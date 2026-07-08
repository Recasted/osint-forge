export type SearchKind = "people" | "domains" | "handles";
export type ModuleKind = "email" | "network" | "vin" | "gta-fivem" | "tiktok-resolver" | "instagram-resolver" | "tiktok-osint" | "reverse-lookup" | "discord" | "discord-history" | "roblox-discord" | "minecraft" | "machine-viewer" | "stealerlogs" | "universal-search" | "email-intelligence" | "ip-intelligence" | "aml-screening" | "aml-entity-screening" | "phone-intelligence" | "bin-lookup";

export type SearchResponse = {
  ok: boolean;
  kind: SearchKind | ModuleKind | "export" | "health";
  query: string;
  generatedAt: string;
  summary: string;
  signals: Array<{
    label: string;
    value: string;
    confidence: "low" | "medium" | "high";
    source?: string;
  }>;
  sources: Array<{
    name: string;
    url?: string;
  }>;
  note?: string;
};

const localFallbackBase = "http://127.0.0.1:8787";

export function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
    localFallbackBase
  );
}

export async function runToolSearch(kind: SearchKind, query: string) {
  const trimmed = query.trim();

  if (!trimmed) {
    throw new Error("Enter a target first.");
  }

  const response = await fetch(`${getApiBaseUrl()}/api/${kind}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: trimmed }),
  });

  const data = (await response.json().catch(() => null)) as SearchResponse | { error?: string } | null;

  if (!response.ok || !data || !("ok" in data)) {
    throw new Error(data && "error" in data && data.error ? data.error : "Search failed.");
  }

  return data;
}

export async function runModuleSearch(module: ModuleKind, query: string) {
  const trimmed = query.trim();

  if (!trimmed) {
    throw new Error("Enter a target first.");
  }

  const response = await fetch(`${getApiBaseUrl()}/api/modules/${module}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: trimmed }),
  });

  const data = (await response.json().catch(() => null)) as SearchResponse | { error?: string } | null;

  if (!response.ok || !data || !("ok" in data)) {
    throw new Error(data && "error" in data && data.error ? data.error : "Search failed.");
  }

  return data;
}
export async function createStripeCheckout(plan: "core" | "professional" | "enterprise", email: string, username: string) {
  const response = await fetch(`${getApiBaseUrl()}/api/stripe/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ plan, email, username }),
  });

  const data = (await response.json().catch(() => null)) as { ok?: boolean; url?: string; error?: string } | null;

  if (!response.ok || !data?.url) {
    throw new Error(data?.error || "Stripe checkout failed.");
  }

  return data.url;
}

export async function createNowPaymentsInvoice(plan: "core" | "professional" | "enterprise", email: string, username: string) {
  const response = await fetch(`${getApiBaseUrl()}/api/nowpayments/invoice`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ plan, email, username }),
  });

  const data = (await response.json().catch(() => null)) as { ok?: boolean; url?: string; error?: string } | null;

  if (!response.ok || !data?.url) {
    throw new Error(data?.error || "Crypto checkout failed.");
  }

  return data.url;
}

