"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import { InteractiveEffects } from "../interactive-effects";
import { AccountState, consumeSearch, getAccount, getRemainingSearches } from "../lib/account-store";
import { runToolSearch, SearchKind, SearchResponse } from "../lib/api-client";
import { ToolSidebar } from "../tool-sidebar";

type ToolSearchPageProps = {
  title: string;
  eyebrow: string;
  description: string;
  placeholder: string;
  examples: string[];
  tool: SearchKind;
};

export function ToolSearchPage({
  title,
  eyebrow,
  description,
  placeholder,
  examples,
  tool,
}: ToolSearchPageProps) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [account, setAccount] = useState<AccountState | null>(() => getAccount());

  const statusText = useMemo(() => {
    if (isLoading) return "Running";
    if (result) return "Complete";
    if (error) return "Needs review";
    return "Ready";
  }, [error, isLoading, result]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const quota = consumeSearch();
    if (!quota.ok) {
      setError(quota.reason);
      return;
    }

    if (quota.account) setAccount(quota.account);
    setIsLoading(true);

    try {
      setResult(await runToolSearch(tool, query));
    } catch (searchError) {
      setResult(null);
      setError(searchError instanceof Error ? searchError.message : "Search failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050607] px-4 py-4 pb-24 text-[#f3f4f0] sm:px-8 lg:px-10 xl:pb-5">
      <InteractiveEffects />
      <ToolSidebar />

      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-3 border border-white/10 bg-black/30 px-3 py-3 backdrop-blur sm:px-4">
          <Link href="/" className="flex items-center gap-3" aria-label="OSINT Forge home">
            <span className="grid size-9 place-items-center bg-[#f3f4f0] text-sm font-black text-[#050607]">
              OF
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] sm:text-sm sm:tracking-[0.18em]">
              OSINT Forge
            </span>
          </Link>
          <div className="flex gap-2">
            <Link
              href="/account/"
              className="border border-white/20 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition hover:border-white hover:bg-white hover:text-black sm:px-4 sm:text-xs sm:tracking-[0.14em]"
            >
              Account
            </Link>
            <Link
              href="/tools/export/"
              className="border border-white/20 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition hover:border-white hover:bg-white hover:text-black sm:px-4 sm:text-xs sm:tracking-[0.14em]"
            >
              Export
            </Link>
          </div>
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

          <div className="mt-8 grid gap-3 sm:grid-cols-2" data-reveal>
            <Link href="/account/" className="glow-card border border-white/12 bg-[#080a0c] p-4 transition hover:border-[#00e0aa]/60">
              <p className="font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[#00e0aa]">
                Account status
              </p>
              <p className="mt-3 text-sm leading-6 text-white/62">
                {account ? `${getRemainingSearches(account)} searches remaining this month` : "Create a free account to unlock 5 monthly searches."}
              </p>
            </Link>
            <Link href="/cart/" className="glow-card border border-[#f0b35a]/40 bg-[#1a1711] p-4 transition hover:border-[#f0b35a]">
              <p className="font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[#f0b35a]">
                Upgrade
              </p>
              <p className="mt-3 text-sm leading-6 text-white/62">
                Need more searches? Add a plan or extra credits from the cart.
              </p>
            </Link>
          </div>

          <form className="glow-card mt-5 border border-white/12 bg-[#080a0c] p-3 sm:p-4" onSubmit={handleSubmit}>
            <div className="flex items-center justify-between gap-4">
              <label className="text-xs font-bold uppercase tracking-[0.18em] text-white/42" htmlFor={`${tool}-search`}>
                Search input
              </label>
              <span className="border border-[#00e0aa]/30 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#00e0aa]">
                {statusText}
              </span>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                className="min-h-11 flex-1 border border-white/10 bg-black px-3 font-mono text-xs text-white outline-none transition focus:border-[#00e0aa] sm:min-h-12 sm:px-4 sm:text-sm"
                id={`${tool}-search`}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={placeholder}
                type="search"
                value={query}
              />
              <button
                className="min-h-11 border border-[#00e0aa]/40 px-5 text-xs font-black uppercase tracking-[0.12em] text-[#00e0aa] transition hover:bg-[#00e0aa] hover:text-black disabled:cursor-wait disabled:opacity-60 sm:min-h-12 sm:px-6 sm:text-sm sm:tracking-[0.14em]"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? "Searching" : "Search"}
              </button>
            </div>
            {error ? (
              <p className="mt-4 border border-[#ff6a4a]/40 bg-[#ff6a4a]/10 px-3 py-2 text-sm leading-6 text-[#ffb6a6]">
                {error}
              </p>
            ) : null}
          </form>

          {result ? (
            <section className="mt-8 grid gap-5 lg:grid-cols-[0.7fr_1fr]" data-reveal>
              <aside className="glow-card border border-[#f0b35a]/50 bg-[#1a1711] p-5">
                <p className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#f0b35a]">
                  Result summary
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-white">{result.query}</h2>
                <p className="mt-4 text-sm leading-7 text-white/62">{result.summary}</p>
                {result.note ? <p className="mt-4 text-xs leading-6 text-white/42">{result.note}</p> : null}
              </aside>

              <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10">
                {result.signals.map((signal) => (
                  <article key={`${signal.label}-${signal.value}`} className="glow-card bg-[#050607] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/42">{signal.label}</p>
                        <p className="mt-2 font-mono text-sm text-white/78">{signal.value}</p>
                      </div>
                      <span className="border border-white/12 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#00e0aa]">
                        {signal.confidence}
                      </span>
                    </div>
                    {signal.source ? <p className="mt-3 text-xs text-white/38">Source: {signal.source}</p> : null}
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <div className="mt-8 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3" data-reveal>
            {examples.map((example) => (
              <article key={example} className="glow-card bg-[#050607] p-5">
                <p className="font-mono text-sm text-white/54">{example}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}