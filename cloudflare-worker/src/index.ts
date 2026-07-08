type Env = {
  ALLOWED_ORIGINS?: string;
  HIBP_API_KEY?: string;
  OSINTCAT_API_KEY?: string;
  DEEPINTEL_API_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  NOWPAYMENTS_API_KEY?: string;
  NOWPAYMENTS_IPN_SECRET?: string;
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
  kind: "people" | "domains" | "handles" | "export" | "health" | string;
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
    "Access-Control-Allow-Headers": "Content-Type, Stripe-Signature, x-nowpayments-sig",
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


async function createNowPaymentsInvoice(request: Request, env: Env) {
  if (!env.NOWPAYMENTS_API_KEY) return { error: "Missing NOWPAYMENTS_API_KEY Worker secret." };

  const body = (await request.json().catch(() => null)) as { plan?: PlanId; email?: string; username?: string } | null;
  const plan = body?.plan;
  if (!plan || !["core", "professional", "enterprise"].includes(plan)) return { error: "Invalid plan." };

  const siteUrl = (env.SITE_URL || request.headers.get("Origin") || "https://osintforge.dev").replace(/\/$/, "");
  const amount = plan === "core" ? 4.99 : plan === "professional" ? 14.99 : 39.99;
  const orderId = `osint-forge-${plan}-${Date.now()}`;

  const response = await fetch("https://api.nowpayments.io/v1/invoice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.NOWPAYMENTS_API_KEY,
    },
    body: JSON.stringify({
      price_amount: amount,
      price_currency: "usd",
      order_id: orderId,
      order_description: `OSINT Forge ${plan} subscription`,
      ipn_callback_url: `${new URL(request.url).origin}/api/nowpayments/ipn`,
      success_url: `${siteUrl}/account/?crypto=success&plan=${plan}`,
      cancel_url: `${siteUrl}/cart/?crypto=cancelled`,
      is_fixed_rate: true,
    }),
  });

  const data = (await response.json().catch(() => null)) as { invoice_url?: string; id?: string; message?: string; error?: string } | null;
  if (!response.ok || !data?.invoice_url) return { error: data?.message || data?.error || "NOWPayments invoice creation failed." };
  return { ok: true, url: data.invoice_url, invoiceId: data.id, orderId };
}

function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortObject);
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>).sort().reduce<Record<string, unknown>>((sorted, key) => {
      sorted[key] = sortObject((value as Record<string, unknown>)[key]);
      return sorted;
    }, {});
  }
  return value;
}

async function verifyNowPaymentsSignature(payload: string, signature: string | null, secret?: string) {
  if (!secret || !signature) return false;
  const parsed = JSON.parse(payload) as unknown;
  const sortedPayload = JSON.stringify(sortObject(parsed));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(sortedPayload));
  return safeEqual(hex(digest), signature.toLowerCase());
}

async function handleNowPaymentsIpn(request: Request, env: Env) {
  const payload = await request.text();
  const valid = await verifyNowPaymentsSignature(payload, request.headers.get("x-nowpayments-sig"), env.NOWPAYMENTS_IPN_SECRET);
  if (env.NOWPAYMENTS_IPN_SECRET && !valid) return json({ error: "Invalid NOWPayments signature." }, request, env, 400);

  const event = JSON.parse(payload) as { payment_status?: string; order_id?: string; price_amount?: number; price_currency?: string; actually_paid?: number; pay_currency?: string; invoice_id?: string };
  if (env.DB) {
    await env.DB.prepare("insert into crypto_payments (order_id, invoice_id, payment_status, price_amount, price_currency, actually_paid, pay_currency, raw_payload) values (?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(event.order_id || "", event.invoice_id || "", event.payment_status || "", event.price_amount || 0, event.price_currency || "", event.actually_paid || 0, event.pay_currency || "", payload)
      .run();
  }

  return json({ received: true }, request, env);
}
type DeepIntelEnvelope = {
  ok?: boolean;
  mode?: string;
  target?: string;
  type_detected?: string;
  results?: Array<{ module?: string; module_key?: string; status?: string; data?: unknown }>;
  meta?: { plan?: string; credits_charged?: number; credits_remaining?: number; generated_at?: string };
  domain_intel?: unknown;
  ip_intel?: unknown;
  error?: string;
  code?: string;
};

function summarizeDeepIntelData(data: unknown): string {
  if (data === null || data === undefined || data === "") return "No value returned";
  if (typeof data === "string") return data.slice(0, 260);
  if (typeof data === "number" || typeof data === "boolean") return String(data);
  if (Array.isArray(data)) {
    const primitives = data.filter((item) => item === null || ["string", "number", "boolean"].includes(typeof item)).slice(0, 8);
    if (primitives.length) return primitives.map((item) => String(item)).join(" | ").slice(0, 260);
    return `${data.length} record${data.length === 1 ? "" : "s"}`;
  }
  if (typeof data === "object") {
    const entries = Object.entries(data as Record<string, unknown>).slice(0, 5);
    const preview: string = entries.map(([key, value]) => `${key}: ${typeof value === "object" ? summarizeDeepIntelData(value) : String(value)}`).join(" | ");
    return preview.slice(0, 260) || "Structured data returned";
  }
  return "Returned data";
}

function humanizeDeepIntelKey(key: string): string {
  return key
    .replace(/\[(\d+)\]/g, " #$1")
    .replace(/[._-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isPrimitiveDeepIntelValue(value: unknown): boolean {
  return value === null || value === undefined || ["string", "number", "boolean"].includes(typeof value);
}

function flattenDeepIntelValue(value: unknown, path: string, source: string, signals: Signal[], depth = 0) {
  if (signals.length >= 90 || depth > 5 || value === null || value === undefined || value === "") return;

  if (isPrimitiveDeepIntelValue(value)) {
    signals.push({ label: humanizeDeepIntelKey(path), value: summarizeDeepIntelData(value), confidence: "high", source });
    return;
  }

  if (Array.isArray(value)) {
    signals.push({ label: humanizeDeepIntelKey(path), value: `${value.length} record${value.length === 1 ? "" : "s"}`, confidence: value.length ? "high" : "medium", source });
    value.slice(0, 12).forEach((item, index) => flattenDeepIntelValue(item, `${path}[${index + 1}]`, source, signals, depth + 1));
    return;
  }

  const entries = Object.entries(value as Record<string, unknown>).filter(([, entryValue]) => entryValue !== null && entryValue !== undefined && entryValue !== "");
  for (const [key, entryValue] of entries.slice(0, 24)) {
    flattenDeepIntelValue(entryValue, path ? `${path}.${key}` : key, source, signals, depth + 1);
    if (signals.length >= 90) break;
  }
}

function deepIntelFieldSignals(data: unknown, source: string): Signal[] {
  const signals: Signal[] = [];
  flattenDeepIntelValue(data, "data", source, signals);
  return signals;
}
function deepIntelObjectSummary(label: string, value: unknown): Signal | null {
  if (!value || typeof value !== "object") return null;
  const keys = Object.keys(value as Record<string, unknown>).slice(0, 8);
  return {
    label,
    value: keys.length ? keys.join(", ") : "Structured intelligence returned",
    confidence: "high",
    source: "DeepIntel",
  };
}

function deepIntelSignals(data: DeepIntelEnvelope, endpoint: string): Signal[] {
  const signals: Signal[] = [];

  if (data.type_detected) {
    signals.push({ label: "DeepIntel target type", value: data.type_detected, confidence: "high", source: "DeepIntel" });
  }

  const domainSignal = deepIntelObjectSummary("DeepIntel domain intel", data.domain_intel);
  if (domainSignal) signals.push(domainSignal);
  const ipSignal = deepIntelObjectSummary("DeepIntel IP intel", data.ip_intel);
  if (ipSignal) signals.push(ipSignal);

  const hits = data.results || [];
  signals.push({
    label: "DeepIntel modules",
    value: hits.length ? `${hits.length} module${hits.length === 1 ? "" : "s"} returned` : `No ${endpoint} hits returned`,
    confidence: hits.length ? "high" : "medium",
    source: "DeepIntel",
  });

  for (const hit of hits.slice(0, 20)) {
    const source = hit.module || hit.module_key || "DeepIntel";
    signals.push({
      label: source,
      value: summarizeDeepIntelData(hit.data),
      confidence: hit.status === "SUCCESS" ? "high" : "medium",
      source: "DeepIntel",
    });
    signals.push(...deepIntelFieldSignals(hit.data, source));
  }

  if (typeof data.meta?.credits_remaining === "number") {
    signals.push({ label: "DeepIntel credits remaining", value: String(data.meta.credits_remaining), confidence: "high", source: "DeepIntel" });
  }

  return signals;
}

type DeepIntelEndpoint = "breaches" | "stealerlogs" | "discord-id" | "domain" | "footprint" | "email" | "phone";

async function deepIntelSearch(endpoint: DeepIntelEndpoint, target: string, env: Env): Promise<DeepIntelEnvelope | null> {
  if (!env.DEEPINTEL_API_KEY) return null;

  const response = await fetch(`https://deepintel.cc/api/osint/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": env.DEEPINTEL_API_KEY,
    },
    body: JSON.stringify({ target }),
  });

  const data = (await response.json().catch(() => null)) as DeepIntelEnvelope | null;
  if (!response.ok) {
    return {
      ok: false,
      error: data?.error || "DeepIntel request failed.",
      code: data?.code || String(response.status),
    };
  }

  return data;
}

function deepIntelErrorSignal(data: DeepIntelEnvelope): Signal {
  return {
    label: "DeepIntel provider",
    value: data.code ? `${data.code}: ${data.error || "request failed"}` : data.error || "request failed",
    confidence: "medium",
    source: "DeepIntel",
  };
}
async function peopleSearch(query: string, env: Env): Promise<SearchResult> {
  const signals: Signal[] = [
    {
      label: "Input classified",
      value: isEmail(query) ? "Email address" : "Name, alias, phone, IP, domain, or fragment",
      confidence: "medium",
      source: "OSINT Forge parser",
    },
  ];
  const sources: SearchResult["sources"] = [{ name: "OSINT Forge parser" }];

  const deepIntel = await deepIntelSearch("breaches", query, env);
  if (deepIntel?.ok) {
    signals.push(...deepIntelSignals(deepIntel, "breach"));
    sources.push({ name: "DeepIntel", url: "https://deepintel.cc/docs" });
    return {
      ok: true,
      kind: "people",
      query,
      generatedAt: new Date().toISOString(),
      summary: "People search completed with DeepIntel breach intelligence.",
      signals,
      sources,
    };
  }

  if (deepIntel && !deepIntel.ok) {
    signals.push(deepIntelErrorSignal(deepIntel));
    sources.push({ name: "DeepIntel", url: "https://deepintel.cc/docs" });
  }

  if (!env.DEEPINTEL_API_KEY && isEmail(query) && env.HIBP_API_KEY) {
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
    summary: env.DEEPINTEL_API_KEY ? "People search staged. DeepIntel returned no completed breach result." : "People search staged. Add DEEPINTEL_API_KEY for deeper enrichment.",
    signals,
    sources,
    note: env.DEEPINTEL_API_KEY ? undefined : "Set DEEPINTEL_API_KEY with `wrangler secret put DEEPINTEL_API_KEY` to enable DeepIntel enrichment.",
  };
}

async function domainSearch(query: string, env: Env): Promise<SearchResult> {
  const domain = query.replace(/^https?:\/\//, "").split("/")[0].trim().toLowerCase();
  const signals: Signal[] = [];
  const sources: SearchResult["sources"] = [{ name: "Cloudflare DNS over HTTPS", url: "https://developers.cloudflare.com/1.1.1.1/encryption/dns-over-https/" }];

  if (!isDomain(domain)) {
    signals.push({ label: "Input classified", value: "Not a clean domain. Try example.com", confidence: "low", source: "OSINT Forge parser" });
  } else {
    const deepIntel = await deepIntelSearch("domain", domain, env);
    if (deepIntel?.ok) {
      signals.push(...deepIntelSignals(deepIntel, "domain"));
      sources.push({ name: "DeepIntel", url: "https://deepintel.cc/docs" });
    } else if (deepIntel && !deepIntel.ok) {
      signals.push(deepIntelErrorSignal(deepIntel));
      sources.push({ name: "DeepIntel", url: "https://deepintel.cc/docs" });
    }

    for (const type of ["A", "AAAA", "MX", "NS", "TXT"] as const) {
      const response = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${type}`, { headers: { Accept: "application/dns-json" } }).catch(() => null);
      const data = response ? ((await response.json().catch(() => null)) as { Answer?: Array<{ data: string }> } | null) : null;
      const values = data?.Answer?.map((answer) => answer.data).slice(0, 5) || [];
      signals.push({ label: `${type} records`, value: values.length ? values.join(" | ") : "No records returned", confidence: values.length ? "high" : "medium", source: "Cloudflare DNS" });
    }
  }

  return { ok: true, kind: "domains", query: domain || query, generatedAt: new Date().toISOString(), summary: env.DEEPINTEL_API_KEY ? "Domain search completed with DeepIntel and public DNS enrichment." : "Domain search completed with public DNS enrichment.", signals, sources };
}

async function handleSearch(query: string, env: Env): Promise<SearchResult> {
  const handle = normalizeHandle(query);
  const checks = [
    { name: "GitHub", url: `https://github.com/${handle}` },
    { name: "Reddit", url: `https://www.reddit.com/user/${handle}` },
    { name: "X/Twitter", url: `https://x.com/${handle}` },
    { name: "TikTok", url: `https://www.tiktok.com/@${handle}` },
  ];

  const results = await Promise.all(checks.map(async (check) => ({ ...check, found: await checkUrl(check.url) })));
  const signals = results.map<Signal>((result) => ({ label: result.name, value: result.found ? result.url : "No public profile confirmed", confidence: result.found ? "medium" : "low", source: result.name }));
  const sources: SearchResult["sources"] = results.map((result) => ({ name: result.name, url: result.url }));

  const deepIntel = await deepIntelSearch("footprint", handle, env);
  if (deepIntel?.ok) {
    signals.push(...deepIntelSignals(deepIntel, "footprint"));
    sources.push({ name: "DeepIntel", url: "https://deepintel.cc/docs" });
  } else if (deepIntel && !deepIntel.ok) {
    signals.push(deepIntelErrorSignal(deepIntel));
    sources.push({ name: "DeepIntel", url: "https://deepintel.cc/docs" });
  }

  return {
    ok: true,
    kind: "handles",
    query: handle,
    generatedAt: new Date().toISOString(),
    summary: deepIntel?.ok ? "Handle search completed with DeepIntel footprint intelligence." : "Handle search completed across common public profile surfaces.",
    signals,
    sources,
    note: deepIntel?.ok ? undefined : "HEAD checks can miss platforms that block automated requests. Treat misses as unconfirmed, not impossible.",
  };
}

function isDiscordSnowflake(query: string) {
  return /^\d{17,20}$/.test(query.trim());
}

function isPhoneLike(query: string) {
  return /^\+?[0-9\s().-]{10,18}$/.test(query.trim());
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function universalSweepEndpoints(query: string): DeepIntelEndpoint[] {
  if (isEmail(query)) return ["email", "footprint", "breaches", "stealerlogs"];
  const cleanDomain = query.replace(/^https?:\/\//, "").split("/")[0].trim().toLowerCase();
  if (isDomain(cleanDomain)) return ["domain", "breaches", "stealerlogs"];
  if (isDiscordSnowflake(query)) return ["discord-id", "breaches", "stealerlogs"];
  if (isPhoneLike(query)) return ["phone", "breaches", "footprint"];
  return ["footprint", "breaches", "stealerlogs"];
}

async function deepIntelSweep(query: string, env: Env): Promise<{ signals: Signal[]; sources: SearchResult["sources"]; endpoints: string[]; successCount: number }> {
  const signals: Signal[] = [];
  const sources: SearchResult["sources"] = [{ name: "DeepIntel", url: "https://deepintel.cc/docs" }];
  const endpoints = universalSweepEndpoints(query);
  let successCount = 0;

  if (!env.DEEPINTEL_API_KEY) {
    return {
      signals: [{ label: "Provider key", value: "Set DEEPINTEL_API_KEY in the Cloudflare Worker to run Universal Search.", confidence: "medium", source: "OSINT Forge API" }],
      sources,
      endpoints,
      successCount,
    };
  }

  for (const [index, endpoint] of endpoints.entries()) {
    if (index > 0) await sleep(1050);
    signals.push({ label: "DeepIntel sweep", value: `running ${endpoint}`, confidence: "medium", source: "OSINT Forge router" });
    const response = await deepIntelSearch(endpoint, query, env);
    if (response?.ok) {
      successCount += 1;
      signals.push(...deepIntelSignals(response, endpoint));
    } else if (response && !response.ok) {
      signals.push(deepIntelErrorSignal(response));
    }
  }

  return { signals, sources, endpoints, successCount };
}
const moduleEndpointMap: Record<string, DeepIntelEndpoint> = {
  email: "email",
  network: "domain",
  vin: "breaches",
  "gta-fivem": "discord-id",
  "tiktok-resolver": "footprint",
  "instagram-resolver": "footprint",
  "tiktok-osint": "footprint",
  "reverse-lookup": "footprint",
  discord: "discord-id",
  "discord-history": "discord-id",
  "roblox-discord": "footprint",
  minecraft: "footprint",
  "machine-viewer": "stealerlogs",
  stealerlogs: "stealerlogs",
  "universal-search": "breaches",
  "email-intelligence": "email",
  "ip-intelligence": "domain",
  "aml-screening": "breaches",
  "aml-entity-screening": "breaches",
  "phone-intelligence": "phone",
  "bin-lookup": "breaches",
};

function moduleFallbackHint(module: string) {
  if (["vin", "aml-screening", "aml-entity-screening", "bin-lookup"].includes(module)) return "DeepIntel does not expose a dedicated endpoint for this module name yet, so OSINT Forge runs the closest broad breach/intelligence lookup.";
  if (["gta-fivem"].includes(module)) return "DeepIntel's public API resolves Discord IDs for gaming pivots; enter a Discord snowflake for best results.";
  if (["machine-viewer"].includes(module)) return "Machine viewer uses stealerlog search first. Use returned log IDs with victim-file endpoints when archive browsing is connected.";
  return undefined;
}

async function moduleSearch(module: string, query: string, env: Env): Promise<SearchResult> {
  if (module === "universal-search") {
    const sweep = await deepIntelSweep(query, env);
    return {
      ok: true,
      kind: module,
      query,
      generatedAt: new Date().toISOString(),
      summary: sweep.successCount ? `Universal Search completed across ${sweep.endpoints.join(", ")}.` : `Universal Search ran ${sweep.endpoints.join(", ")} but no completed provider result was returned.`,
      signals: sweep.signals,
      sources: sweep.sources,
      note: env.DEEPINTEL_API_KEY ? undefined : "Set DEEPINTEL_API_KEY with `wrangler secret put DEEPINTEL_API_KEY` to enable DeepIntel-backed modules.",
    };
  }

  const endpoint = moduleEndpointMap[module];
  if (!endpoint) {
    return {
      ok: true,
      kind: module,
      query,
      generatedAt: new Date().toISOString(),
      summary: "Unknown module route.",
      signals: [{ label: "Module", value: `No DeepIntel mapping exists for ${module}.`, confidence: "low", source: "OSINT Forge" }],
      sources: [{ name: "OSINT Forge API" }],
    };
  }

  const signals: Signal[] = [
    { label: "DeepIntel endpoint", value: endpoint, confidence: "high", source: "OSINT Forge router" },
  ];
  const sources: SearchResult["sources"] = [{ name: "DeepIntel", url: "https://deepintel.cc/docs" }];

  const deepIntel = await deepIntelSearch(endpoint, query, env);
  if (deepIntel?.ok) {
    signals.push(...deepIntelSignals(deepIntel, endpoint));
  } else if (deepIntel && !deepIntel.ok) {
    signals.push(deepIntelErrorSignal(deepIntel));
  } else {
    signals.push({ label: "Provider key", value: "Set DEEPINTEL_API_KEY in the Cloudflare Worker to run this module.", confidence: "medium", source: "OSINT Forge API" });
  }

  const hint = moduleFallbackHint(module);

  return {
    ok: true,
    kind: module,
    query,
    generatedAt: new Date().toISOString(),
    summary: deepIntel?.ok ? `${module} completed through DeepIntel ${endpoint}.` : `${module} is wired to DeepIntel ${endpoint}, but no completed provider result was returned.`,
    signals,
    sources,
    note: hint || (env.DEEPINTEL_API_KEY ? undefined : "Set DEEPINTEL_API_KEY with `wrangler secret put DEEPINTEL_API_KEY` to enable DeepIntel-backed modules."),
  };
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
    if (route === "/api/nowpayments/ipn" && request.method === "POST") return handleNowPaymentsIpn(request, env);
    if (route === "/" || route === "/api/health") return json({ ok: true, kind: "health", query: "health", generatedAt: new Date().toISOString(), summary: "OSINT Forge API is online.", signals: [], sources: [] }, request, env);
    if (route === "/api/stripe/checkout" && request.method === "POST") return json(await createStripeCheckout(request, env), request, env);
    if (route === "/api/nowpayments/invoice" && request.method === "POST") return json(await createNowPaymentsInvoice(request, env), request, env);

    if (request.method !== "POST" && request.method !== "GET") return json({ error: "Method not allowed" }, request, env, 405);

    const query = await readQuery(request);
    if (!query) return json({ error: "Missing search query" }, request, env, 400);

    if (route === "/api/people") return json(await peopleSearch(query, env), request, env);
    if (route === "/api/domains") return json(await domainSearch(query, env), request, env);
    if (route === "/api/handles") return json(await handleSearch(query, env), request, env);
    if (route.startsWith("/api/modules/")) return json(await moduleSearch(route.replace("/api/modules/", ""), query, env), request, env);
    if (route === "/api/export") return json(exportResult(query), request, env);

    return json({ error: "Not found" }, request, env, 404);
  },
};

export default worker;

