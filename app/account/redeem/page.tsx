"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { InteractiveEffects } from "../../interactive-effects";
import { redeemCoupon } from "../../lib/api-client";
import { AccountState, applyCouponReward, getAccount } from "../../lib/account-store";
import { ToolSidebar } from "../../tool-sidebar";

export default function RedeemCouponPage() {
  const [account, setAccount] = useState<AccountState | null>(() => getAccount());
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);

  async function handleRedeem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    const currentAccount = getAccount();
    if (!currentAccount) {
      setError("Create or sign in to an account before redeeming coupons.");
      return;
    }
    if (!code.trim()) {
      setError("Enter a coupon code first.");
      return;
    }

    setIsRedeeming(true);
    try {
      const redeemed = await redeemCoupon(code.trim(), currentAccount.email, currentAccount.username);
      const updatedAccount = applyCouponReward(currentAccount.email, currentAccount.username, redeemed.reward!);
      setAccount(updatedAccount);
      setMessage(`${redeemed.reward?.code} redeemed. ${redeemed.reward?.creditsAward || 0} credits added${redeemed.reward?.subscriptionPlan ? ` and ${redeemed.reward.subscriptionPlan} activated` : ""}.`);
      setCode("");
    } catch (redeemError) {
      setError(redeemError instanceof Error ? redeemError.message : "Coupon could not be redeemed.");
    } finally {
      setIsRedeeming(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050607] px-4 py-4 pb-24 text-[#f3f4f0] sm:px-8 lg:px-10 xl:pb-5">
      <InteractiveEffects />
      <ToolSidebar />
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between gap-3 border border-white/10 bg-black/30 px-3 py-3 backdrop-blur sm:px-4">
          <Link href="/" className="flex items-center gap-3" aria-label="OSINT Forge home">
            <span className="grid size-9 place-items-center bg-[#f3f4f0] text-sm font-black text-[#050607]">OF</span>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] sm:text-sm sm:tracking-[0.18em]">OSINT Forge</span>
          </Link>
          <Link href="/account/" className="border border-white/20 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition hover:border-white hover:bg-white hover:text-black sm:px-4 sm:text-xs sm:tracking-[0.14em]">Dashboard</Link>
        </header>

        <section className="py-12 sm:py-20" data-reveal>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f0b35a] sm:text-xs sm:tracking-[0.2em]">Redeem Coupon</p>
          <h1 className="mt-4 max-w-3xl text-[clamp(2.35rem,12vw,4.4rem)] font-semibold leading-[1.02] tracking-normal text-white">Claim credits or subscription time.</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/62 sm:mt-6 sm:text-base sm:leading-8">Coupon rewards are validated by the API before credits or plan access are added to your account.</p>

          <form className="glow-card mt-10 border border-[#f0b35a]/45 bg-[#1a1711] p-5" onSubmit={handleRedeem}>
            <label className="text-xs font-bold uppercase tracking-[0.18em] text-white/42" htmlFor="coupon-code">Coupon code</label>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input id="coupon-code" className="min-h-12 flex-1 border border-white/10 bg-black px-4 font-mono text-sm uppercase text-white outline-none transition focus:border-[#f0b35a]" onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="FORGE-100" type="text" value={code} />
              <button className="min-h-12 border border-[#f0b35a]/60 px-6 text-xs font-black uppercase tracking-[0.16em] text-[#f0b35a] transition hover:bg-[#f0b35a] hover:text-black disabled:cursor-wait disabled:opacity-60" disabled={isRedeeming} type="submit">{isRedeeming ? "Redeeming" : "Redeem"}</button>
            </div>
            {account ? <p className="mt-4 text-xs leading-6 text-white/42">Signed in as {account.email}. Current plan: {account.plan}. Credits: {account.credits}.</p> : <p className="mt-4 text-xs leading-6 text-white/42">You need an account before redeeming.</p>}
            {message ? <p className="mt-4 border border-[#00e0aa]/35 bg-[#00e0aa]/10 px-3 py-2 text-sm leading-6 text-[#9fffe7]">{message}</p> : null}
            {error ? <p className="mt-4 border border-[#ff6a4a]/40 bg-[#ff6a4a]/10 px-3 py-2 text-sm leading-6 text-[#ffb6a6]">{error}</p> : null}
          </form>
        </section>
      </div>
    </main>
  );
}