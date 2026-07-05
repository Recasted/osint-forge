export type PlanId = "free" | "core" | "professional" | "enterprise";
export type CartItemId = PlanId | "extra-50" | "extra-200" | "extra-1000";

export type AccountState = {
  username: string;
  email: string;
  plan: PlanId;
  searchesUsed: number;
  searchesLimit: number;
  credits: number;
  month: string;
};

export type CartItem = {
  id: CartItemId;
  name: string;
  price: number;
  credits: number;
  kind: "subscription" | "credits";
};

const accountKey = "osint-forge-account";
const cartKey = "osint-forge-cart";

export const catalog: Record<CartItemId, CartItem> = {
  free: { id: "free", name: "Free", price: 0, credits: 5, kind: "subscription" },
  core: { id: "core", name: "Core", price: 4.99, credits: 200, kind: "subscription" },
  professional: { id: "professional", name: "Professional", price: 14.99, credits: 450, kind: "subscription" },
  enterprise: { id: "enterprise", name: "Enterprise", price: 39.99, credits: 1000, kind: "subscription" },
  "extra-50": { id: "extra-50", name: "Extra 50", price: 5, credits: 50, kind: "credits" },
  "extra-200": { id: "extra-200", name: "Extra 200", price: 20, credits: 200, kind: "credits" },
  "extra-1000": { id: "extra-1000", name: "Extra 1000", price: 100, credits: 1000, kind: "credits" },
};

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function usernameFromEmail(email: string) {
  return email.split("@")[0]?.replace(/[^a-z0-9_-]/gi, "").slice(0, 18) || "operator";
}

export function planLabel(plan: PlanId) {
  if (plan === "free") return "Free";
  if (plan === "core") return "Core";
  if (plan === "professional") return "Professional";
  return "Enterprise";
}

export function planTierClass(plan: PlanId) {
  return `tier-${plan}`;
}

function normalizeAccount(rawAccount: AccountState) {
  const account = {
    ...rawAccount,
    username: rawAccount.username || usernameFromEmail(rawAccount.email),
  };

  if (account.month === currentMonth()) return account;

  const limit = account.plan === "free" ? 5 : account.credits;
  return {
    ...account,
    searchesUsed: 0,
    searchesLimit: limit,
    month: currentMonth(),
  };
}

export function getAccount() {
  if (!canUseStorage()) return null;

  const raw = window.localStorage.getItem(accountKey);
  if (!raw) return null;

  try {
    const account = normalizeAccount(JSON.parse(raw) as AccountState);
    window.localStorage.setItem(accountKey, JSON.stringify(account));
    return account;
  } catch {
    return null;
  }
}

export function saveAccount(account: AccountState) {
  if (!canUseStorage()) return account;
  window.localStorage.setItem(accountKey, JSON.stringify(account));
  window.dispatchEvent(new Event("osint-forge-account"));
  return account;
}

export function createFreeAccount(email: string, username?: string) {
  return saveAccount({
    username: (username || usernameFromEmail(email)).trim().slice(0, 18),
    email,
    plan: "free",
    searchesUsed: 0,
    searchesLimit: 5,
    credits: 5,
    month: currentMonth(),
  });
}

export function signOut() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(accountKey);
  window.dispatchEvent(new Event("osint-forge-account"));
}

export function getRemainingSearches(account: AccountState) {
  return Math.max(0, account.searchesLimit - account.searchesUsed);
}

export function consumeSearch(): { ok: true; account: AccountState } | { ok: false; reason: string } {
  const account = getAccount();
  if (!account) {
    return { ok: false, reason: "Create a free account or sign in before using tools." };
  }

  if (getRemainingSearches(account) <= 0) {
    return { ok: false, reason: "You have used your monthly search allowance. Upgrade or add credits to continue." };
  }

  const updated = saveAccount({ ...account, searchesUsed: account.searchesUsed + 1 });
  return { ok: true, account: updated };
}

export function getCart() {
  if (!canUseStorage()) return [] as CartItem[];

  try {
    return JSON.parse(window.localStorage.getItem(cartKey) || "[]") as CartItem[];
  } catch {
    return [] as CartItem[];
  }
}

export function saveCart(items: CartItem[]) {
  if (!canUseStorage()) return items;
  window.localStorage.setItem(cartKey, JSON.stringify(items));
  window.dispatchEvent(new Event("osint-forge-cart"));
  return items;
}

export function addToCart(id: CartItemId) {
  const item = catalog[id];
  const existing = getCart().filter((cartItem) => cartItem.kind !== "subscription" || item.kind !== "subscription");
  return saveCart([...existing, item]);
}

export function removeFromCart(id: CartItemId) {
  return saveCart(getCart().filter((item) => item.id !== id));
}

export function clearCart() {
  return saveCart([]);
}

export function activateCart(email: string, username?: string) {
  const items = getCart();
  const existingAccount = getAccount();
  const subscription = items.find((item) => item.kind === "subscription") || catalog.free;
  const addOnCredits = items.filter((item) => item.kind === "credits").reduce((total, item) => total + item.credits, 0);
  const credits = subscription.credits + addOnCredits;

  const account = saveAccount({
    username: (username || existingAccount?.username || usernameFromEmail(email)).trim().slice(0, 18),
    email,
    plan: subscription.id as PlanId,
    searchesUsed: 0,
    searchesLimit: credits,
    credits,
    month: currentMonth(),
  });
  clearCart();
  return account;
}
