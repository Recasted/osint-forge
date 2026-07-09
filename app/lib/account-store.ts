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

export type RecentSearch = {
  tool: string;
  query: string;
  summary: string;
  createdAt: string;
  signals?: Array<{
    label: string;
    value: string;
    confidence: "low" | "medium" | "high";
    source?: string;
  }>;
  sources?: Array<{
    name: string;
    url?: string;
  }>;
  note?: string;
};

export type CouponReward = {
  code: string;
  creditsAward: number;
  subscriptionPlan?: PlanId | null;
  subscriptionDuration?: string | null;
};

const accountKey = "osint-forge-account";
const accountsKey = "osint-forge-accounts";
const cartKey = "osint-forge-cart";
const recentSearchesKey = "osint-forge-recent-searches";
const adminEmailHash = "d55b37c";
const adminCredits = 999999;

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

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function usernameFromEmail(email: string) {
  return email.split("@")[0]?.replace(/[^a-z0-9_-]/gi, "").slice(0, 18) || "operator";
}

function stableEmailHash(email: string) {
  let hash = 2166136261;
  const cleanEmail = normalizeEmail(email);
  for (let index = 0; index < cleanEmail.length; index += 1) {
    hash ^= cleanEmail.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

export function isAdminEmail(email: string) {
  return stableEmailHash(email) === adminEmailHash;
}

export function isAdminAccount(account: Pick<AccountState, "email">) {
  return isAdminEmail(account.email);
}

export function accountAuthHash(account: Pick<AccountState, "email">) {
  return stableEmailHash(account.email);
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

export function accountRankLabel(account: AccountState) {
  return isAdminAccount(account) ? "Admin" : planLabel(account.plan);
}

export function accountTierClass(account: AccountState) {
  return isAdminAccount(account) ? "tier-admin" : planTierClass(account.plan);
}

function normalizeAccount(rawAccount: AccountState) {
  const isAdmin = isAdminEmail(rawAccount.email);
  const account = {
    ...rawAccount,
    email: normalizeEmail(rawAccount.email),
    username: rawAccount.username || usernameFromEmail(rawAccount.email),
    plan: isAdmin ? "enterprise" as PlanId : rawAccount.plan,
    credits: isAdmin ? adminCredits : rawAccount.credits,
    searchesLimit: isAdmin ? adminCredits : rawAccount.searchesLimit,
  };

  if (account.month === currentMonth()) return account;

  const limit = account.plan === "free" ? 5 : account.credits;
  return {
    ...account,
    searchesUsed: 0,
    searchesLimit: isAdmin ? adminCredits : limit,
    month: currentMonth(),
  };
}

function getRememberedAccounts() {
  if (!canUseStorage()) return {} as Record<string, AccountState>;

  try {
    return JSON.parse(window.localStorage.getItem(accountsKey) || "{}") as Record<string, AccountState>;
  } catch {
    return {} as Record<string, AccountState>;
  }
}

function rememberAccount(account: AccountState) {
  if (!canUseStorage()) return;
  const remembered = getRememberedAccounts();
  remembered[normalizeEmail(account.email)] = account;
  window.localStorage.setItem(accountsKey, JSON.stringify(remembered));
}

function findRememberedAccount(email: string) {
  const remembered = getRememberedAccounts()[normalizeEmail(email)];
  return remembered ? normalizeAccount(remembered) : null;
}

export function getAccount() {
  if (!canUseStorage()) return null;

  const raw = window.localStorage.getItem(accountKey);
  if (!raw) return null;

  try {
    const account = normalizeAccount(JSON.parse(raw) as AccountState);
    window.localStorage.setItem(accountKey, JSON.stringify(account));
    rememberAccount(account);
    return account;
  } catch {
    return null;
  }
}

export function saveAccount(account: AccountState) {
  const normalizedAccount = normalizeAccount(account);
  if (!canUseStorage()) return normalizedAccount;
  window.localStorage.setItem(accountKey, JSON.stringify(normalizedAccount));
  rememberAccount(normalizedAccount);
  window.dispatchEvent(new Event("osint-forge-account"));
  return normalizedAccount;
}

export function createFreeAccount(email: string, username?: string) {
  const cleanEmail = normalizeEmail(email);
  const remembered = findRememberedAccount(cleanEmail);
  if (remembered) {
    return saveAccount({
      ...remembered,
      username: (username || remembered.username || usernameFromEmail(cleanEmail)).trim().slice(0, 18),
    });
  }

  const isAdmin = isAdminEmail(cleanEmail);
  return saveAccount({
    username: (username || usernameFromEmail(cleanEmail)).trim().slice(0, 18),
    email: cleanEmail,
    plan: isAdmin ? "enterprise" : "free",
    searchesUsed: 0,
    searchesLimit: isAdmin ? adminCredits : 5,
    credits: isAdmin ? adminCredits : 5,
    month: currentMonth(),
  });
}

export function getRecentSearches() {
  if (!canUseStorage()) return [] as RecentSearch[];

  try {
    return JSON.parse(window.localStorage.getItem(recentSearchesKey) || "[]") as RecentSearch[];
  } catch {
    return [] as RecentSearch[];
  }
}

export function recordRecentSearch(search: Omit<RecentSearch, "createdAt">) {
  if (!canUseStorage()) return [] as RecentSearch[];

  const recent = getRecentSearches();
  const nextSearches = [
    { ...search, createdAt: new Date().toISOString() },
    ...recent.filter((item) => !(item.tool === search.tool && item.query === search.query)),
  ].slice(0, 10);

  window.localStorage.setItem(recentSearchesKey, JSON.stringify(nextSearches));
  window.dispatchEvent(new Event("osint-forge-recent-searches"));
  return nextSearches;
}
export function signOut() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(accountKey);
  window.dispatchEvent(new Event("osint-forge-account"));
}

export function getRemainingSearches(account: AccountState) {
  if (isAdminAccount(account)) return adminCredits;
  return Math.max(0, account.searchesLimit - account.searchesUsed);
}

export function consumeSearch(): { ok: true; account: AccountState } | { ok: false; reason: string } {
  const account = getAccount();
  if (!account) {
    return { ok: false, reason: "Create a free account or sign in before using tools." };
  }

  if (isAdminAccount(account)) return { ok: true, account };

  if (getRemainingSearches(account) <= 0) {
    return { ok: false, reason: "You have used your monthly search allowance. Upgrade or add credits to continue." };
  }

  const updated = saveAccount({ ...account, searchesUsed: account.searchesUsed + 1 });
  return { ok: true, account: updated };
}

export function applyCouponReward(email: string, username: string | undefined, reward: CouponReward) {
  const cleanEmail = normalizeEmail(email);
  const existingAccount = getAccount() || findRememberedAccount(cleanEmail);
  const isAdmin = isAdminEmail(cleanEmail);
  const nextPlan = isAdmin ? "enterprise" : reward.subscriptionPlan || existingAccount?.plan || "free";
  const planCredits = nextPlan === "free" ? 5 : catalog[nextPlan].credits;
  const existingCredits = existingAccount?.credits || planCredits;
  const nextCredits = isAdmin ? adminCredits : Math.max(existingCredits, planCredits) + Math.max(0, reward.creditsAward || 0);

  return saveAccount({
    username: (username || existingAccount?.username || usernameFromEmail(cleanEmail)).trim().slice(0, 18),
    email: cleanEmail,
    plan: nextPlan,
    searchesUsed: Math.min(existingAccount?.searchesUsed || 0, nextCredits),
    searchesLimit: nextCredits,
    credits: nextCredits,
    month: currentMonth(),
  });
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
  const cleanEmail = normalizeEmail(email);
  const items = getCart();
  const existingAccount = getAccount() || findRememberedAccount(cleanEmail);
  const subscription = items.find((item) => item.kind === "subscription") || catalog.free;
  const addOnCredits = items.filter((item) => item.kind === "credits").reduce((total, item) => total + item.credits, 0);
  const isAdmin = isAdminEmail(cleanEmail);
  const credits = isAdmin ? adminCredits : subscription.credits + addOnCredits;

  const account = saveAccount({
    username: (username || existingAccount?.username || usernameFromEmail(cleanEmail)).trim().slice(0, 18),
    email: cleanEmail,
    plan: isAdmin ? "enterprise" : subscription.id as PlanId,
    searchesUsed: 0,
    searchesLimit: credits,
    credits,
    month: currentMonth(),
  });
  clearCart();
  return account;
}