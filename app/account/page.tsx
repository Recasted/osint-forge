"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { InteractiveEffects } from "../interactive-effects";
import { AccountState, createFreeAccount, getAccount, getRemainingSearches, planLabel, planTierClass, signOut } from "../lib/account-store";
import { ThemeControl } from "../theme-control";
import { ToolSidebar } from "../tool-sidebar";

const dashboardModules = [
  { title: "Email OSINT", href: "/tools/email/", meta: "Email footprint and account clues" },
  { title: "Network", href: "/tools/network/", meta: "Domains, IPs, DNS, and ASN clues" },
  { title: "Universal Search", href: "/tools/universal-search/", meta: "Cross-module investigation starter" },
  { title: "Discord OSINT", href: "/tools/discord/", meta: "Social identity workspace" },
  { title: "Stealerlogs", href: "/tools/stealerlogs/", meta: "Provider-ready breach module" },
  { title: "Report Export", href: "/tools/export/", meta: "Build downloadable case notes" },
];

function RankBadge({ account }: { account: AccountState }) {
  return (
    <span className={`subscription-rank ${planTierClass(account.plan)}`}>
      [{planLabel(account.plan)}]
      <i />
      <i />
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

export default function AccountPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [account, setAccount] = useState<AccountState | null>(() => getAccount());

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanEmail = email.trim();
    const cleanUsername = username.trim();
    if (!cleanEmail || !cleanUsername) return;
    setAccount(createFreeAccount(cleanEmail, cleanUsername));
    setEmail("");
    setUsername("");
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
            Your dashboard and module access.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/62 sm:mt-6 sm:text-base sm:leading-8">
            Free accounts get 5 searches each month. Paid plans raise the credit limit and unlock more provider-backed modules once billing is connected.
          </p>

          {account ? (
            <div className="mt-10 grid gap-5 lg:grid-cols-[0.7fr_1fr]">
              <aside className="glow-card border border-[#00e0aa]/40 bg-[#00e0aa]/10 p-6">
                <p className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#00e0aa]">Signed in</p>
                <h2 className="mt-3 flex flex-wrap items-center gap-3 text-2xl font-semibold text-white">
                  {account.username}
                  <RankBadge account={account} />
                </h2>
                <p className="mt-4 text-sm leading-7 text-white/62">{account.email}</p>
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

              <section className="lg:col-span-2">
                <ThemeControl />
                <div className="mt-5 flex items-center justify-between gap-4">
                  <h2 className="text-2xl font-semibold text-white">Modules</h2>
                  <button className="border border-white/16 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white/62 transition hover:border-white hover:text-white" onClick={handleSignOut} type="button">
                    Sign out
                  </button>
                </div>
                <div className="mt-4 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3">
                  {dashboardModules.map((module) => (
                    <Link key={module.href} href={module.href} className="glow-card bg-[#050607] p-5 transition hover:bg-white/[0.04]">
                      <p className="font-semibold text-white">{module.title}</p>
                      <p className="mt-3 text-sm leading-6 text-white/52">{module.meta}</p>
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          ) : (
            <form className="glow-card mt-10 border border-white/12 bg-[#080a0c] p-4 sm:p-5" onSubmit={handleCreate}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.18em] text-white/42" htmlFor="account-username">Username</label>
                  <input id="account-username" className="mt-3 min-h-11 w-full border border-white/10 bg-black px-3 font-mono text-xs text-white outline-none transition focus:border-[#00e0aa] sm:min-h-12 sm:px-4 sm:text-sm" maxLength={18} onChange={(event) => setUsername(event.target.value)} placeholder="nightcrawler_99" type="text" value={username} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.18em] text-white/42" htmlFor="account-email">Email</label>
                  <input id="account-email" className="mt-3 min-h-11 w-full border border-white/10 bg-black px-3 font-mono text-xs text-white outline-none transition focus:border-[#00e0aa] sm:min-h-12 sm:px-4 sm:text-sm" onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" type="email" value={email} />
                </div>
              </div>
              <button className="mt-5 min-h-11 border border-[#00e0aa]/40 px-5 text-xs font-black uppercase tracking-[0.12em] text-[#00e0aa] transition hover:bg-[#00e0aa] hover:text-black disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-12 sm:px-6 sm:text-sm sm:tracking-[0.14em]" disabled={!username.trim() || !email.trim()} type="submit">
                Create free account
              </button>
              <p className="mt-4 text-xs leading-6 text-white/42">Prototype account state is stored in this browser until real authentication is connected.</p>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

