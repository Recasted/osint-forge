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
export type CouponDuration = "7d" | "30d" | "90d" | "1y" | "lifetime";
export type CouponPlan = "core" | "professional" | "enterprise";

export type CouponRecord = {
  code: string;
  description: string;
  creditsAward: number;
  subscriptionPlan: CouponPlan | null;
  subscriptionDuration: CouponDuration | null;
  percentageDiscount: number;
  fixedDiscountAmount: number;
  maxGlobalRedemptions: number | null;
  maxRedemptionsPerUser: number;
  expiresAt: string | null;
  active: boolean;
  adminNotes: string;
  redemptions: number;
  remainingRedemptions: number | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CouponInput = Omit<CouponRecord, "redemptions" | "remainingRedemptions" | "createdAt" | "updatedAt">;

export type CouponRedemption = {
  id: number;
  couponCode: string;
  email: string;
  username: string;
  creditsAwarded: number;
  subscriptionPlan: CouponPlan | null;
  subscriptionDuration: CouponDuration | null;
  ipAddress: string;
  redeemedAt: string;
};

export async function listCoupons(adminHash: string, query = "", status = "all") {
  const params = new URLSearchParams({ adminHash, q: query, status });
  const response = await fetch(`${getApiBaseUrl()}/api/admin/coupons?${params.toString()}`);
  const data = (await response.json().catch(() => null)) as { coupons?: CouponRecord[]; error?: string } | null;
  if (!response.ok || !data?.coupons) throw new Error(data?.error || "Could not load coupons.");
  return data.coupons;
}

export async function saveCoupon(adminHash: string, coupon: CouponInput, originalCode?: string) {
  const response = await fetch(`${getApiBaseUrl()}/api/admin/coupons${originalCode ? `/${encodeURIComponent(originalCode)}` : ""}`, {
    method: originalCode ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminHash, coupon }),
  });
  const data = (await response.json().catch(() => null)) as { coupon?: CouponRecord; error?: string } | null;
  if (!response.ok || !data?.coupon) throw new Error(data?.error || "Could not save coupon.");
  return data.coupon;
}

export async function deleteCoupon(adminHash: string, code: string) {
  const params = new URLSearchParams({ adminHash });
  const response = await fetch(`${getApiBaseUrl()}/api/admin/coupons/${encodeURIComponent(code)}?${params.toString()}`, { method: "DELETE" });
  const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  if (!response.ok || !data?.ok) throw new Error(data?.error || "Could not delete coupon.");
  return true;
}

export async function getCouponRedemptions(adminHash: string, code: string) {
  const params = new URLSearchParams({ adminHash });
  const response = await fetch(`${getApiBaseUrl()}/api/admin/coupons/${encodeURIComponent(code)}/redemptions?${params.toString()}`);
  const data = (await response.json().catch(() => null)) as { redemptions?: CouponRedemption[]; error?: string } | null;
  if (!response.ok || !data?.redemptions) throw new Error(data?.error || "Could not load redemption history.");
  return data.redemptions;
}

export async function redeemCoupon(code: string, email: string, username: string) {
  const response = await fetch(`${getApiBaseUrl()}/api/coupons/redeem`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, email, username }),
  });
  const data = (await response.json().catch(() => null)) as { ok?: boolean; reward?: { code: string; creditsAward: number; subscriptionPlan?: CouponPlan | null; subscriptionDuration?: CouponDuration | null }; message?: string; error?: string } | null;
  if (!response.ok || !data?.reward) throw new Error(data?.error || "Coupon could not be redeemed.");
  return data;
}
