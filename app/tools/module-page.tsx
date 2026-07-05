"use client";

import Link from "next/link";
import { useState } from "react";

import { InteractiveEffects } from "../interactive-effects";
import { AccountRequired } from "./account-required";
import { AccountState, getAccount, getRemainingSearches } from "../lib/account-store";
import { ToolSidebar } from "../tool-sidebar";

type ModulePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  examples: string[];
  locked?: boolean;
};

export function ModulePage({ eyebrow, title, description, examples, locked = true }: ModulePageProps) {
  const [account, setAccount] = useState<AccountState | null>(() => getAccount());

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
          <Link href="/account/" className="border border-white/20 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition hover:border-white hover:bg-white hover:text-black sm:px-4 sm:text-xs sm:tracking-[0.14em]">
            Account
          </Link>
        </header>

        <section className="py-12 sm:py-20" data-reveal>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#00e0aa] sm:text-xs sm:tracking-[0.2em]">
            {eyebrow}
          </p>
          <h1 className="mt-4 max-w-3xl text-[clamp(2.35rem,12vw,4.4rem)] font-semibold leading-[1.02] tracking-normal text-white">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/62 sm:mt-6 sm:text-base sm:leading-8">
            {description}
          </p>

          {!account ? (
            <AccountRequired moduleName={eyebrow} onCreate={setAccount} />
          ) : (
            <>
              <aside className={`mt-8 border p-5 sm:p-6 ${locked ? "border-[#f0b35a]/50 bg-[#1a1711]" : "border-[#00e0aa]/40 bg-[#00e0aa]/10"}`}>
                <p className={`font-mono text-[11px] font-black uppercase tracking-[0.18em] ${locked ? "text-[#f0b35a]" : "text-[#00e0aa]"}`}>
                  {locked ? "Plan module" : "Available"}
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-white">
                  {locked ? "This module has its own workspace ready." : "This module is live."}
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62">
                  {locked
                    ? "The page is ready for access control, provider wiring, and plan checks. Once billing and provider APIs are connected, this module can unlock by subscription rank."
                    : "This module is connected to the current search workflow."}
                </p>
                <p className="mt-4 font-mono text-xs text-white/42">
                  {getRemainingSearches(account)} searches remaining this month.
                </p>
              </aside>

              <div className="mt-8 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3" data-reveal>
                {examples.map((example) => (
                  <article key={example} className="glow-card bg-[#050607] p-5">
                    <p className="font-mono text-sm text-white/54">{example}</p>
                  </article>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/cart/" className="inline-flex min-h-11 items-center justify-center border border-[#00e0aa]/40 px-5 text-xs font-black uppercase tracking-[0.12em] text-[#00e0aa] transition hover:bg-[#00e0aa] hover:text-black sm:min-h-12 sm:px-6 sm:text-sm sm:tracking-[0.14em]">
                  Upgrade access
                </Link>
                <Link href="/account/" className="inline-flex min-h-11 items-center justify-center border border-white/16 px-5 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:border-white hover:bg-white hover:text-black sm:min-h-12 sm:px-6 sm:text-sm sm:tracking-[0.14em]">
                  Account dashboard
                </Link>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
