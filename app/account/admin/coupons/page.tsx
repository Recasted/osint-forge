"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { InteractiveEffects } from "../../../interactive-effects";
import { CouponInput, CouponRecord, CouponRedemption, deleteCoupon, getCouponRedemptions, listCoupons, saveCoupon } from "../../../lib/api-client";
import { accountAuthHash, getAccount, isAdminAccount } from "../../../lib/account-store";
import { ToolSidebar } from "../../../tool-sidebar";

const blankCoupon: CouponInput = {
  code: "",
  description: "",
  creditsAward: 0,
  subscriptionPlan: null,
  subscriptionDuration: null,
  percentageDiscount: 0,
  fixedDiscountAmount: 0,
  maxGlobalRedemptions: null,
  maxRedemptionsPerUser: 1,
  expiresAt: null,
  active: true,
  adminNotes: "",
};

function couponToInput(coupon: CouponRecord): CouponInput {
  return {
    code: coupon.code,
    description: coupon.description,
    creditsAward: coupon.creditsAward,
    subscriptionPlan: coupon.subscriptionPlan,
    subscriptionDuration: coupon.subscriptionDuration,
    percentageDiscount: coupon.percentageDiscount,
    fixedDiscountAmount: coupon.fixedDiscountAmount,
    maxGlobalRedemptions: coupon.maxGlobalRedemptions,
    maxRedemptionsPerUser: coupon.maxRedemptionsPerUser,
    expiresAt: coupon.expiresAt,
    active: coupon.active,
    adminNotes: coupon.adminNotes,
  };
}

export default function AdminCouponsPage() {
  const account = getAccount();
  const isAdmin = Boolean(account && isAdminAccount(account));
  const adminHash = account ? accountAuthHash(account) : "";
  const [coupons, setCoupons] = useState<CouponRecord[]>([]);
  const [form, setForm] = useState<CouponInput>(blankCoupon);
  const [editingCode, setEditingCode] = useState<string | undefined>();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [historyCode, setHistoryCode] = useState("");
  const [history, setHistory] = useState<CouponRedemption[]>([]);

  const filteredCoupons = useMemo(() => coupons, [coupons]);

  const loadCoupons = useCallback(async function loadCoupons() {
    if (!isAdmin) return;
    setIsLoading(true);
    setError("");
    try {
      setCoupons(await listCoupons(adminHash, query, status));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load coupons.");
    } finally {
      setIsLoading(false);
    }
  }, [adminHash, isAdmin, query, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCoupons();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadCoupons]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const saved = await saveCoupon(adminHash, form, editingCode);
      setMessage(`${saved.code} saved.`);
      setForm(blankCoupon);
      setEditingCode(undefined);
      await loadCoupons();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save coupon.");
    }
  }

  async function handleToggle(coupon: CouponRecord) {
    setError("");
    try {
      await saveCoupon(adminHash, { ...couponToInput(coupon), active: !coupon.active }, coupon.code);
      await loadCoupons();
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Could not update coupon.");
    }
  }

  async function handleDelete(code: string) {
    setError("");
    try {
      await deleteCoupon(adminHash, code);
      if (editingCode === code) {
        setEditingCode(undefined);
        setForm(blankCoupon);
      }
      await loadCoupons();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete coupon.");
    }
  }

  async function handleHistory(code: string) {
    setHistoryCode(code);
    setError("");
    try {
      setHistory(await getCouponRedemptions(adminHash, code));
    } catch (historyError) {
      setError(historyError instanceof Error ? historyError.message : "Could not load history.");
    }
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-[#050607] px-4 py-4 pb-24 text-[#f3f4f0] sm:px-8 lg:px-10 xl:pb-5">
        <InteractiveEffects />
        <ToolSidebar />
        <div className="mx-auto max-w-3xl py-20">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#ff6b76]">Admin only</p>
          <h1 className="mt-4 text-5xl font-semibold text-white">Coupon management is restricted.</h1>
          <Link href="/account/" className="mt-8 inline-flex border border-white/20 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-white hover:text-black">Back to dashboard</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050607] px-4 py-4 pb-24 text-[#f3f4f0] sm:px-8 lg:px-10 xl:pb-5">
      <InteractiveEffects />
      <ToolSidebar />
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-3 border border-white/10 bg-black/30 px-3 py-3 backdrop-blur sm:px-4">
          <Link href="/" className="flex items-center gap-3" aria-label="OSINT Forge home"><span className="grid size-9 place-items-center bg-[#f3f4f0] text-sm font-black text-[#050607]">OF</span><span className="text-xs font-semibold uppercase tracking-[0.14em] sm:text-sm sm:tracking-[0.18em]">OSINT Forge</span></Link>
          <Link href="/account/" className="border border-white/20 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition hover:border-white hover:bg-white hover:text-black sm:px-4 sm:text-xs sm:tracking-[0.14em]">Dashboard</Link>
        </header>

        <section className="py-12 sm:py-20" data-reveal>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#ff6b76] sm:text-xs sm:tracking-[0.2em]">Admin Dashboard</p>
          <h1 className="mt-4 max-w-3xl text-[clamp(2.35rem,12vw,4.4rem)] font-semibold leading-[1.02] tracking-normal text-white">Coupon management.</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/62 sm:mt-6 sm:text-base sm:leading-8">Create rewards, limit redemptions, disable codes, and inspect redemption history from one place.</p>

          <div className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <form className="glow-card border border-[#7a090f]/70 bg-[#120709] p-5" onSubmit={handleSubmit}>
              <div className="flex items-center justify-between gap-4">
                <p className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#ff6b76]">{editingCode ? "Edit coupon" : "Create coupon"}</p>
                <button className="text-xs uppercase tracking-[0.12em] text-white/42 hover:text-white" onClick={() => { setForm(blankCoupon); setEditingCode(undefined); }} type="button">Reset</button>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <input className="min-h-11 border border-white/10 bg-black px-3 font-mono text-xs uppercase text-white outline-none focus:border-[#ff6b76]" onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} placeholder="CODE or blank for random" value={form.code} />
                <input className="min-h-11 border border-white/10 bg-black px-3 text-xs text-white outline-none focus:border-[#ff6b76]" onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" value={form.description} />
                <input className="min-h-11 border border-white/10 bg-black px-3 font-mono text-xs text-white outline-none focus:border-[#ff6b76]" onChange={(event) => setForm({ ...form, creditsAward: Number(event.target.value) })} placeholder="Credits award" type="number" value={form.creditsAward || ""} />
                <select className="min-h-11 border border-white/10 bg-black px-3 text-xs text-white outline-none focus:border-[#ff6b76]" onChange={(event) => setForm({ ...form, subscriptionPlan: event.target.value ? event.target.value as CouponInput["subscriptionPlan"] : null })} value={form.subscriptionPlan || ""}>
                  <option value="">No free plan</option>
                  <option value="core">Core</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
                <select className="min-h-11 border border-white/10 bg-black px-3 text-xs text-white outline-none focus:border-[#ff6b76]" onChange={(event) => setForm({ ...form, subscriptionDuration: event.target.value ? event.target.value as CouponInput["subscriptionDuration"] : null })} value={form.subscriptionDuration || ""}>
                  <option value="">No duration</option>
                  <option value="7d">7 days</option>
                  <option value="30d">30 days</option>
                  <option value="90d">90 days</option>
                  <option value="1y">1 year</option>
                  <option value="lifetime">Lifetime</option>
                </select>
                <input className="min-h-11 border border-white/10 bg-black px-3 font-mono text-xs text-white outline-none focus:border-[#ff6b76]" onChange={(event) => setForm({ ...form, percentageDiscount: Number(event.target.value) })} placeholder="Percent discount" type="number" value={form.percentageDiscount || ""} />
                <input className="min-h-11 border border-white/10 bg-black px-3 font-mono text-xs text-white outline-none focus:border-[#ff6b76]" onChange={(event) => setForm({ ...form, fixedDiscountAmount: Number(event.target.value) })} placeholder="Fixed discount" type="number" value={form.fixedDiscountAmount || ""} />
                <input className="min-h-11 border border-white/10 bg-black px-3 font-mono text-xs text-white outline-none focus:border-[#ff6b76]" onChange={(event) => setForm({ ...form, maxGlobalRedemptions: event.target.value ? Number(event.target.value) : null })} placeholder="Global max" type="number" value={form.maxGlobalRedemptions || ""} />
                <input className="min-h-11 border border-white/10 bg-black px-3 font-mono text-xs text-white outline-none focus:border-[#ff6b76]" onChange={(event) => setForm({ ...form, maxRedemptionsPerUser: Number(event.target.value) })} placeholder="Max per user" type="number" value={form.maxRedemptionsPerUser} />
                <input className="min-h-11 border border-white/10 bg-black px-3 font-mono text-xs text-white outline-none focus:border-[#ff6b76]" onChange={(event) => setForm({ ...form, expiresAt: event.target.value || null })} type="date" value={form.expiresAt || ""} />
              </div>
              <label className="mt-4 flex items-center gap-3 text-sm text-white/62"><input checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} type="checkbox" /> Active</label>
              <textarea className="mt-4 min-h-24 w-full border border-white/10 bg-black px-3 py-3 text-xs text-white outline-none focus:border-[#ff6b76]" onChange={(event) => setForm({ ...form, adminNotes: event.target.value })} placeholder="Internal admin notes" value={form.adminNotes} />
              <button className="mt-5 min-h-12 w-full border border-[#ff6b76]/60 px-5 text-xs font-black uppercase tracking-[0.16em] text-[#ff6b76] transition hover:bg-[#7a090f] hover:text-white" type="submit">Save coupon</button>
              {message ? <p className="mt-4 border border-[#00e0aa]/35 bg-[#00e0aa]/10 px-3 py-2 text-sm text-[#9fffe7]">{message}</p> : null}
              {error ? <p className="mt-4 border border-[#ff6a4a]/40 bg-[#ff6a4a]/10 px-3 py-2 text-sm text-[#ffb6a6]">{error}</p> : null}
            </form>

            <section>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input className="min-h-11 flex-1 border border-white/10 bg-black px-3 font-mono text-xs text-white outline-none focus:border-[#00e0aa]" onChange={(event) => setQuery(event.target.value)} placeholder="Search coupons" value={query} />
                <select className="min-h-11 border border-white/10 bg-black px-3 text-xs text-white outline-none focus:border-[#00e0aa]" onChange={(event) => setStatus(event.target.value)} value={status}>
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
                <button className="min-h-11 border border-[#00e0aa]/40 px-5 text-xs font-black uppercase tracking-[0.14em] text-[#00e0aa] transition hover:bg-[#00e0aa] hover:text-black" onClick={loadCoupons} type="button">{isLoading ? "Loading" : "Filter"}</button>
              </div>

              <div className="mt-4 overflow-hidden border border-white/10 bg-white/10">
                {filteredCoupons.length ? filteredCoupons.map((coupon) => (
                  <article key={coupon.code} className="glow-card bg-[#050607] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-mono text-lg font-black text-white">{coupon.code}</p>
                        <p className="mt-2 text-sm leading-6 text-white/52">{coupon.description || "No description"}</p>
                        <p className="mt-2 font-mono text-xs text-white/38">{coupon.redemptions} redeemed / {coupon.remainingRedemptions === null ? "unlimited" : `${coupon.remainingRedemptions} left`} / expires {coupon.expiresAt || "never"}</p>
                      </div>
                      <span className={`border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${coupon.active ? "border-[#00e0aa]/35 text-[#00e0aa]" : "border-white/15 text-white/36"}`}>{coupon.active ? "Active" : "Disabled"}</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-black uppercase tracking-[0.12em]">
                      <button className="border border-white/16 px-3 py-2 text-white/62 hover:text-white" onClick={() => { setForm(couponToInput(coupon)); setEditingCode(coupon.code); }} type="button">Edit</button>
                      <button className="border border-[#f0b35a]/35 px-3 py-2 text-[#f0b35a] hover:bg-[#f0b35a] hover:text-black" onClick={() => handleToggle(coupon)} type="button">{coupon.active ? "Disable" : "Enable"}</button>
                      <button className="border border-[#00e0aa]/35 px-3 py-2 text-[#00e0aa] hover:bg-[#00e0aa] hover:text-black" onClick={() => handleHistory(coupon.code)} type="button">History</button>
                      <button className="border border-[#ff6a4a]/40 px-3 py-2 text-[#ffb6a6] hover:bg-[#ff6a4a] hover:text-black" onClick={() => handleDelete(coupon.code)} type="button">Delete</button>
                    </div>
                  </article>
                )) : <p className="bg-[#050607] p-5 text-sm text-white/46">No coupons found.</p>}
              </div>

              {historyCode ? (
                <div className="mt-6 border border-white/10 bg-black/50 p-4">
                  <p className="font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[#00e0aa]">Redemption history: {historyCode}</p>
                  <div className="mt-4 space-y-2">
                    {history.length ? history.map((item) => (
                      <div key={item.id} className="grid gap-2 border border-white/10 bg-[#050607] p-3 text-xs text-white/58 sm:grid-cols-[1fr_1fr_auto]">
                        <span>{item.email}</span>
                        <span>{item.creditsAwarded} credits {item.subscriptionPlan ? `/ ${item.subscriptionPlan}` : ""}</span>
                        <span>{item.redeemedAt}</span>
                      </div>
                    )) : <p className="text-sm text-white/42">No redemptions yet.</p>}
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}