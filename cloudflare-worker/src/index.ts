type Env = {
  ALLOWED_ORIGINS?: string;
  HIBP_API_KEY?: string;
  OSINTCAT_API_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PRICE_CORE?: string;
  STRIPE_PRICE_PROFESSIONAL?: string;
  STRIPE_PRICE_ENTERPRISE?: string;
  SITE_URL?: string;
  DB?: { prepare(query: string): { bind(...values: unknown[]): { run(): Promise<unknown> } } };
};

type Confidence = "low" | "medium" | "high";
type PlanId = "core" | "professional" | "enterprise";

type Signal = {
  label: string;
  value: string;
  confidence: Confidence;
  source?: string;
};

type SearchResult = {
  ok: true;
  kind: "people" | "domains" | "handles" | "export" | "health";
  query: string;
  generatedAt: string;
  summary: string;
  signals: Signal[];
  sources: Array<{ name: string; url?: string }>;
  note?: string;
};

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

const planCredits: Record<PlanId, number> = { core: 200, professional: 450, enterprise: 1000 };

function allowedOrigins(env: Env) {
  return (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function corsHeaders(request: Request, env: Env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = allowedOrigins(env);
  const allowOrigin = allowed.includes(origin) ? origin : allowed[0] || "*";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Stripe-Signature",
    "Vary": "Origin",
  };
}

function json(data: unknown, request: Request, env: Env, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      ...jsonHeaders,
      ...corsHeaders(request, env),
    },
  });
}

async function readQuery(request: Request) {
  if (request.method === "GET") {
    return new URL(request.url).searchParams.get("q")?.trim() || "";
  }

  const body = (await request.json().catch(() => null)) as { query?: unknown } | null;
  return typeof body?.query === "string" ? body.query.trim() : "";
}

function normalizeHandle(query: string) {
  return query.trim().replace(/^@/, "").replace(/^https?:\/\//, "").split(/[/?#]/)[0];
}

function isEmail(query: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(query);
}

function isDomain(query: string) {
  return /^(?!-)[a-z0-9-]{1,63}(?<!-)\.[a-z]{2,}$/i.test(query);
}

async function checkUrl(url: string) {
  const response = await fetch(url, {
    method: "HEAD",
    redirect: "follow",
    headers: {
      "User-Agent": "OSINT-Forge/1.0 (+https://github.com)",
    },
  }).catch(() => null);

  return Boolean(response && response.status < 400);
}

function getClientIp(request: Request) {
  return request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() || "unknown";
}

function formEncode(values: Record<string, string>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) params.set(key, value);
  return params;
}

function stripePriceForPlan(plan: PlanId, env: Env) {
  if (plan === "core") return env.STRIPE_PRICE_CORE;
  if (plan === "professional") return env.STRIPE_PRICE_PROFESSIONAL;
  return env.STRIPE_PRICE_ENTERPRISE;
}

async function createStripeCheckout(request: Request, env: Env) {
  if (!env.STRIPE_SECRET_KEY) return { error: "Missing STRIPE_SECRET_KEY Worker secret." };

  const body = (await request.json().catch(() => null)) as { plan?: PlanId; email?: string; username?: string } | null;
  const plan = body?.plan;
  if (!plan || !["core", "professional", "enterprise"].includes(plan)) return { error: "Invalid plan." };

  const price = stripePriceForPlan(plan, env);
  if (!price) return { error: `Missing Stripe price ID for ${plan}.` };

  const siteUrl = (env.SITE_URL || request.headers.get("Origin") || "https://osintforge.dev").replace(/\/$/, "");
  const params = formEncode({
    mode: "subscription",
    success_url: `${siteUrl}/account/?stripe=success&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/cart/?stripe=cancelled`,
    "line_items[0][price]": price,
    "line_items[0][quantity]": "1",
    "metadata[plan]": plan,
    "metadata[email]": body?.email || "",
    "metadata[username]": body?.username || "",
    "metadata[client_ip]": getClientIp(request),
    allow_promotion_codes: "true",
  });

  if (body?.email) params.set("customer_email", body.email);

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const data = (await response.json().catch(() => null)) as { url?: string; error?: { message?: string } } | null;
  if (!response.ok || !data?.url) return { error: data?.error?.message || "Stripe checkout session failed." };
  return { ok: true, url: data.url };
}

function hex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let index = 0; index < a.length; index += 1) result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return result === 0;
}

async function verifyStripeSignature(payload: string, signatureHeader: string | null, secret: string) {
  if (!signatureHeader) return false;
  const timestamp = signatureHeader.split(",").find((part) => part.startsWith("t="))?.slice(2);
  const signatures = signatureHeader.split(",").filter((part) => part.startsWith("v1=")).map((part) => part.slice(3));
  if (!timestamp || !signatures.length) return false;

  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${payload}`));
  const expected = hex(digest);
  return signatures.some((signature) => safeEqual(expected, signature));
}

async function handleStripeWebhook(request: Request, env: Env) {
  if (!env.STRIPE_WEBHOOK_SECRET) return json({ error: "Missing STRIPE_WEBHOOK_SECRET." }, request, env, 500);

  const payload = await request.text();
  const valid = await verifyStripeSignature(payload, request.headers.get("Stripe-Signature"), env.STRIPE_WEBHOOK_SECRET);
  if (!valid) return json({ error: "Invalid Stripe signature." }, request, env, 400);

  const event = JSON.parse(payload) as { type?: string; data?: { object?: { customer?: string; subscription?: string; metadata?: Record<string, string> } } };
  if (event.type === "checkout.session.completed") {
    const session = event.data?.object;
    const plan = session?.metadata?.plan as PlanId | undefined;
    const email = session?.metadata?.email || "";
    const username = session?.metadata?.username || "";
    const ip = session?.metadata?.client_ip || "";

    if (env.DB && plan && ["core", "professional", "enterprise"].includes(plan)) {
      await env.DB.prepare(
        "insert into subscriptions (email, username, ip_address, plan, credits, unlimited, stripe_customer_id, stripe_subscription_id, source) values (?, ?, ?, ?, ?, 0, ?, ?, 'stripe')",
      ).bind(email, username, ip, plan, planCredits[plan], session?.customer || "", session?.subscription || "").run();
    }
  }

  return json({ received: true }, request, env);
}

async function peopleSearch(query: string, env: Env): Promise<SearchResult> {
  const signals: Signal[] = [
    {
      label: "Input classified",
      value: isEmail(query) ? "Email address" : "Name, alias, phone, or fragment",
      confidence: "medium",
      source: "OSINT Forge parser",
    },
  ];
  const sources: SearchResult["sources"] = [{ name: "OSINT Forge parser" }];

  if (isEmail(query) && env.HIBP_API_KEY) {
    const response = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(query)}?truncateResponse=false`, {
      headers: {
        "hibp-api-key": env.HIBP_API_KEY,
        "user-agent": "OSINT Forge",
      },
    });

    if (response.status === 200) {
      const breaches = (await response.json()) as Array<{ Name?: string; Domain?: string }>;
      signals.push({ label: "Breach exposure", value: `${breaches.length} breach record${breaches.length === 1 ? "" : "s"}`, confidence: "high", source: "Have I Been Pwned" });
      signals.push({ label: "Top breach names", value: breaches.slice(0, 5).map((breach) => breach.Name || breach.Domain).filter(Boolean).join(", ") || "No named breaches returned", confidence: "medium", source: "Have I Been Pwned" });
      sources.push({ name: "Have I Been Pwned", url: "https://haveibeenpwned.com/API/v3" });
    } else if (response.status === 404) {
      signals.push({ label: "Breach exposure", value: "No breach records returned", confidence: "medium", source: "Have I Been Pwned" });
      sources.push({ name: "Have I Been Pwned", url: "https://haveibeenpwned.com/API/v3" });
    }
  }

  signals.push({ label: "Next pivot", value: isEmail(query) ? "Run handle reuse and domain pivots from the mailbox domain" : "Add email, phone, city, employer, or handle for higher confidence", confidence: "low", source: "OSINT Forge workflow" });

  return {
    ok: true,
    kind: "people",
    query,
    generatedAt: new Date().toISOString(),
    summary: isEmail(query) && env.HIBP_API_KEY ? "People search completed with breach enrichment." : "People search staged. Add provider keys for deeper enrichment.",
    signals,
    sources,
    note: env.HIBP_API_KEY ? undefined : "Set HIBP_API_KEY with `wrangler secret put HIBP_API_KEY` to enable email breach enrichment.",
  };
}

async function domainSearch(query: string): Promise<SearchResult> {
  const domain = query.replace(/^https?:\/\//, "").split("/")[0].trim().toLowerCase();
  const signals: Signal[] = [];
  const sources: SearchResult["sources"] = [{ name: "Cloudflare DNS over HTTPS", url: "https://developers.cloudflare.com/1.1.1.1/encryption/dns-over-https/" }];

  if (!isDomain(domain)) {
    signals.push({ label: "Input classified", value: "Not a clean domain. Try example.com", confidence: "low", source: "OSINT Forge parser" });
  } else {
    for (const type of ["A", "AAAA", "MX", "NS", "TXT"] as const) {
      const response = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${type}`, { headers: { Accept: "application/dns-json" } }).catch(() => null);
      const data = response ? ((await response.json().catch(() => null)) as { Answer?: Array<{ data: string }> } | null) : null;
      const values = data?.Answer?.map((answer) => answer.data).slice(0, 5) || [];
      signals.push({ label: `${type} records`, value: values.length ? values.join(" | ") : "No records returned", confidence: values.length ? "high" : "medium", source: "Cloudflare DNS" });
    }
  }

  return { ok: true, kind: "domains", query: domain || query, generatedAt: new Date().toISOString(), summary: "Domain search completed with public DNS enrichment.", signals, sources };
}

async function handleSearch(query: string): Promise<SearchResult> {
  const handle = normalizeHandle(query);
  const checks = [
    { name: "GitHub", url: `https://github.com/${handle}` },
    { name: "Reddit", url: `https://www.reddit.com/user/${handle}` },
    { name: "X/Twitter", url: `https://x.com/${handle}` },
    { name: "TikTok", url: `https://www.tiktok.com/@${handle}` },
  ];

  const results = await Promise.all(checks.map(async (check) => ({ ...check, found: await checkUrl(check.url) })));
  const signals = results.map<Signal>((result) => ({ label: result.name, value: result.found ? result.url : "No public profile confirmed", confidence: result.found ? "medium" : "low", source: result.name }));

  return { ok: true, kind: "handles", query: handle, generatedAt: new Date().toISOString(), summary: "Handle search completed across common public profile surfaces.", signals, sources: results.map((result) => ({ name: result.name, url: result.url })), note: "HEAD checks can miss platforms that block automated requests. Treat misses as unconfirmed, not impossible." };
}

function exportResult(query: string): SearchResult {
  return {
    ok: true,
    kind: "export",
    query,
    generatedAt: new Date().toISOString(),
    summary: "Export endpoint is ready. Wire this to saved search results when you add persistence.",
    signals: [
      { label: "Export format", value: "JSON report payload", confidence: "high", source: "OSINT Forge API" },
      { label: "Persistence", value: "Not enabled yet", confidence: "medium", source: "Cloudflare Worker" },
    ],
    sources: [{ name: "OSINT Forge API" }],
  };
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request, env) });

    const url = new URL(request.url);
    const route = url.pathname.replace(/\/$/, "");

    if (route === "/api/stripe/webhook" && request.method === "POST") return handleStripeWebhook(request, env);
    if (route === "/" || route === "/api/health") return json({ ok: true, kind: "health", query: "health", generatedAt: new Date().toISOString(), summary: "OSINT Forge API is online.", signals: [], sources: [] }, request, env);
    if (route === "/api/stripe/checkout" && request.method === "POST") return json(await createStripeCheckout(request, env), request, env);

    if (request.method !== "POST" && request.method !== "GET") return json({ error: "Method not allowed" }, request, env, 405);

    const query = await readQuery(request);
    if (!query) return json({ error: "Missing search query" }, request, env, 400);

    if (route === "/api/people") return json(await peopleSearch(query, env), request, env);
    if (route === "/api/domains") return json(await domainSearch(query), request, env);
    if (route === "/api/handles") return json(await handleSearch(query), request, env);
    if (route === "/api/export") return json(exportResult(query), request, env);

    return json({ error: "Not found" }, request, env, 404);
  },
};

export default worker;

