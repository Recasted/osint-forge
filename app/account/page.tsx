"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { InteractiveEffects } from "../interactive-effects";
import { AccountState, createFreeAccount, getAccount, getRemainingSearches, signOut } from "../lib/account-store";
import { ToolSidebar } from "../tool-sidebar";

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [account, setAccount] = useState<AccountState | null>(() => getAccount());

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) return;
    setAccount(createFreeAccount(cleanEmail));
    setEmail("");
  }

  function handleSignOut() {
    signOut();
    setAccount(null);
  }

  return (
    <main className="min-h-screen bg-[#050607] px-4 py-4 pb-24 text-[#f3f4f0] sm:px-8 lg:px-10 xl:pb-5">
      <InteractiveEffects />
      <ToolSidebar />

      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-3 border border-white/10 bg-black/30 px-3 py-3 backdrop-blur sm:px-4">
          <Link href="/" className="flex items-center gap-3" aria-label="OSINT Forge home">
            <span className="grid size-9 place-items-center bg-[#f3f4f0] text-sm font-black text-[#050607]">OF</span>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] sm:text-sm sm:tracking-[0.18em]">OSINT Forge</span>
          </Link>
          <Link href="/cart/" className="border border-white/20 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition hover:border-white hover:bg-white hover:text-black sm:px-4 sm:text-xs sm:tracking-[0.14em]">
            Cart
          </Link>
        </header>

        <section className="py-12 sm:py-20" data-reveal>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#00e0aa] sm:text-xs sm:tracking-[0.2em]">Account</p>
          <h1 className="mt-4 max-w-3xl text-[clamp(2.35rem,12vw,4.4rem)] font-semibold leading-[1.02] tracking-normal text-white">
            Sign in before using OSINT tools.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/62 sm:mt-6 sm:text-base sm:leading-8">
            Free accounts get 5 searches each month. Upgrade when you need higher search volume, exports, and provider-backed enrichment.
          </p>

          {account ? (
            <div className="mt-10 grid gap-5 lg:grid-cols-[0.7fr_1fr]">
              <aside className="glow-card border border-[#00e0aa]/40 bg-[#00e0aa]/10 p-6">
                <p className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#00e0aa]">Signed in</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">{account.email}</h2>
                <p className="mt-4 text-sm leading-7 text-white/62">Plan: {account.plan}</p>
              </aside>
              <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-3">
                <div className="glow-card bg-[#050607] p-5">
                  <p className="font-mono text-sm text-white/42">Remaining</p>
                  <p className="mt-3 text-4xl font-semibold">{getRemainingSearches(account)}</p>
                </div>
                <div className="glow-card bg-[#050607] p-5">
                  <p className="font-mono text-sm text-white/42">Used</p>
                  <p className="mt-3 text-4xl font-semibold">{account.searchesUsed}</p>
                </div>
                <div className="glow-card bg-[#050607] p-5">
                  <p className="font-mono text-sm text-white/42">Monthly limit</p>
                  <p className="mt-3 text-4xl font-semibold">{account.searchesLimit}</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:col-span-2">
                <Link href="/tools/people/" className="inline-flex min-h-11 items-center justify-center border border-[#00e0aa]/40 px-5 text-xs font-black uppercase tracking-[0.12em] text-[#00e0aa] transition hover:bg-[#00e0aa] hover:text-black sm:min-h-12 sm:px-6 sm:text-sm sm:tracking-[0.14em]">
                  Use tools
                </Link>
                <Link href="/cart/" className="inline-flex min-h-11 items-center justify-center border border-white/16 px-5 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:border-white hover:bg-white hover:text-black sm:min-h-12 sm:px-6 sm:text-sm sm:tracking-[0.14em]">
                  Upgrade
                </Link>
                <button className="inline-flex min-h-11 items-center justify-center border border-white/16 px-5 text-xs font-black uppercase tracking-[0.12em] text-white/62 transition hover:border-white hover:text-white sm:min-h-12 sm:px-6 sm:text-sm sm:tracking-[0.14em]" onClick={handleSignOut} type="button">
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <form className="glow-card mt-10 border border-white/12 bg-[#080a0c] p-4 sm:p-5" onSubmit={handleCreate}>
              <label className="text-xs font-bold uppercase tracking-[0.18em] text-white/42" htmlFor="account-email">Email</label>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input id="account-email" className="min-h-11 flex-1 border border-white/10 bg-black px-3 font-mono text-xs text-white outline-none transition focus:border-[#00e0aa] sm:min-h-12 sm:px-4 sm:text-sm" onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" type="email" value={email} />
                <button className="min-h-11 border border-[#00e0aa]/40 px-5 text-xs font-black uppercase tracking-[0.12em] text-[#00e0aa] transition hover:bg-[#00e0aa] hover:text-black sm:min-h-12 sm:px-6 sm:text-sm sm:tracking-[0.14em]" type="submit">
                  Create free account
                </button>
              </div>
              <p className="mt-4 text-xs leading-6 text-white/42">Prototype account state is stored in this browser until real authentication is connected.</p>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}