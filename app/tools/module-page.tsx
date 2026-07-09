"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { InteractiveEffects } from "../interactive-effects";
import { AccountRequired } from "./account-required";
import { AccountState, consumeSearch, getAccount, getRemainingSearches, PlanId, planLabel, recordRecentSearch } from "../lib/account-store";
import { ModuleKind, runModuleSearch, SearchResponse } from "../lib/api-client";
import { downloadReport, ReportFormat } from "../lib/report-export";
import { ToolSidebar } from "../tool-sidebar";

type ModulePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  examples: string[];
  locked?: boolean;
  requiredPlan?: Exclude<PlanId, "free">;
};

const planRank: Record<PlanId, number> = { free: 0, core: 1, professional: 2, enterprise: 3 };
const estimatedSearchMs = 12000;

function moduleKindFromPath(pathname: string | null): ModuleKind {
  const segment = pathname?.split("/").filter(Boolean).at(-1) || "universal-search";
  return segment as ModuleKind;
}

function formatSeconds(ms: number) {
  return `${Math.max(0, Math.ceil(ms / 1000))}s`;
}

function brandProviderText(value: string) {
  return value.replace(/DeepIntel/gi, "OSINTForge").replace(/deep intel/gi, "OSINTForge");
}

function isInternalProviderLine(label: string, value: string, source?: string) {
  const text = `${label} ${value} ${source || ""}`.toLowerCase();
  return text.includes("oversight index") || text.includes("deepintel oversight") || text.includes("deep intel oversight");
}

function terminalLines(result: SearchResponse | null) {
  if (!result) return [];

  const signals = result.signals
    .filter((signal) => !isInternalProviderLine(signal.label, signal.value, signal.source))
    .map((signal) => ({
      label: brandProviderText(signal.label),
      value: brandProviderText(signal.value),
      meta: signal.source ? `${signal.confidence} / ${brandProviderText(signal.source)}` : signal.confidence,
      tone: signal.confidence === "high" ? "good" : signal.confidence === "medium" ? "warm" : "muted",
    }));

  return [
    { label: "target", value: result.query, meta: "input", tone: "warm" },
    { label: "summary", value: brandProviderText(result.summary), meta: "system", tone: "plain" },
    ...signals,
    ...(result.note ? [{ label: "note", value: brandProviderText(result.note), meta: "hint", tone: "muted" }] : []),
  ];
}
export function ModulePage({ eyebrow, title, description, locked = true, requiredPlan = "core" }: ModulePageProps) {
  const pathname = usePathname();
  const moduleKind = moduleKindFromPath(pathname);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);
  const [searchStartedAt, setSearchStartedAt] = useState<number | null>(null);
  const [visibleLines, setVisibleLines] = useState(0);
  const [account, setAccount] = useState<AccountState | null>(() => getAccount());
  const [reportFormat, setReportFormat] = useState<ReportFormat>("txt");
  const requiresPaidPlan = locked;
  const hasModuleAccess = Boolean(account && (!requiresPaidPlan || planRank[account.plan] >= planRank[requiredPlan]));
  const requiredPlanLabel = planLabel(requiredPlan);
  const lines = useMemo(() => terminalLines(result), [result]);

  const statusText = useMemo(() => {
    if (isLoading) return "Running";
    if (result) return "Complete";
    if (error) return "Needs review";
    return "Ready";
  }, [error, isLoading, result]);

  useEffect(() => {
    if (!isLoading || !searchStartedAt) return;

    const timer = window.setInterval(() => {
      const elapsed = Date.now() - searchStartedAt;
      setProgress(Math.min(94, Math.round((elapsed / estimatedSearchMs) * 100)));
      setRemainingMs(Math.max(0, estimatedSearchMs - elapsed));
    }, 160);

    return () => window.clearInterval(timer);
  }, [isLoading, searchStartedAt]);

  useEffect(() => {
    if (!lines.length) return;

    const timer = window.setInterval(() => {
      setVisibleLines((current) => {
        if (current >= lines.length) {
          window.clearInterval(timer);
          return current;
        }
        return current + 1;
      });
    }, 115);

    return () => window.clearInterval(timer);
  }, [lines]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    setVisibleLines(0);

    const cleanQuery = query.trim();
    if (!cleanQuery) {
      setError("Enter a target first.");
      return;
    }

    const quota = consumeSearch();
    if (!quota.ok) {
      setError(quota.reason);
      setAccount(getAccount());
      return;
    }

    if (quota.account) setAccount(quota.account);
    setProgress(3);
    setRemainingMs(estimatedSearchMs);
    setSearchStartedAt(Date.now());
    setIsLoading(true);

    try {
      const searchResult = await runModuleSearch(moduleKind, cleanQuery);
      setResult(searchResult);
      recordRecentSearch({
        tool: eyebrow,
        query: searchResult.query,
        summary: searchResult.summary,
        signals: searchResult.signals,
        sources: searchResult.sources,
        note: searchResult.note,
      });
      setProgress(100);
      setRemainingMs(0);
    } catch (searchError) {
      setResult(null);
      setProgress(0);
      setRemainingMs(0);
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
          ) : hasModuleAccess ? (
            <>
              <form className="glow-card mt-8 border border-[#00e0aa]/65 bg-[#06100f] p-4 shadow-2xl shadow-[#00e0aa]/10 sm:p-5" onSubmit={handleSubmit}>
                <div className="flex items-center justify-between gap-4">
                  <label className="text-xs font-bold uppercase tracking-[0.18em] text-white/42" htmlFor="module-target">
                    Search input
                  </label>
                  <span className="border border-[#00e0aa]/30 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#00e0aa]">
                    {statusText}
                  </span>
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <input
                    id="module-target"
                    className="min-h-11 flex-1 border border-white/10 bg-black px-3 font-mono text-xs text-white outline-none transition focus:border-[#00e0aa] sm:min-h-12 sm:px-4 sm:text-sm"
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Enter email, username, phone, Discord ID, domain, IP, or log ID..."
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
                {error ? <p className="mt-4 border border-[#ff6a4a]/40 bg-[#ff6a4a]/10 px-3 py-2 text-sm leading-6 text-[#ffb6a6]">{error}</p> : null}
              </form>

              <section className="module-result-terminal mt-8 overflow-hidden border border-white/10 bg-black/80 font-mono shadow-2xl shadow-black/40" data-reveal>
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-white/44">
                  <span>{moduleKind} :: OSINTForge stream</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {result ? (
                      <>
                        <select
                          className="border border-[#00e0aa]/35 bg-black px-2 py-1 font-mono text-[10px] font-black uppercase tracking-[0.08em] text-white outline-none transition focus:border-[#00e0aa]"
                          onChange={(event) => setReportFormat(event.target.value as ReportFormat)}
                          value={reportFormat}
                        >
                          <option value="txt">TXT case brief</option>
                          <option value="casefile">OSINTForge case file TXT</option>
                          <option value="ascii">ASCII document TXT</option>
                          <option value="json">JSON evidence payload</option>
                          <option value="html">HTML report</option>
                          <option value="doc">Word-compatible DOC</option>
                        </select>
                        <button
                          className="border border-[#f0b35a]/45 px-3 py-1 font-mono text-[10px] font-black uppercase tracking-[0.14em] text-[#f0b35a] transition hover:bg-[#f0b35a] hover:text-black"
                          onClick={() => downloadReport(result, eyebrow, reportFormat)}
                          type="button"
                        >
                          Export
                        </button>
                      </>
                    ) : null}
                    <span className="text-[#00e0aa]">{isLoading ? `ETA ${formatSeconds(remainingMs)}` : result ? "Complete" : "Idle"}</span>
                  </div>
                </header>
                <div className="h-1 bg-white/8">
                  <div className="module-result-progress h-full bg-[#00e0aa] transition-[width] duration-200 ease-linear" style={{ width: `${progress}%` }} />
                </div>
                <div className="min-h-[380px] space-y-2 p-4 text-sm leading-6 sm:p-5">
                  {!isLoading && !result ? (
                    <p className="text-white/34">Waiting for a target. Results will stream here line by line.</p>
                  ) : null}
                  {isLoading ? (
                    <>
                      <p className="module-terminal-line text-white/64"><span className="text-[#f0b35a]">00</span> opening provider route <span className="float-right text-[#00e0aa]">running</span></p>
                      <p className="module-terminal-line text-white/64"><span className="text-[#f0b35a]">01</span> querying OSINTForge endpoint <span className="float-right text-[#00e0aa]">{progress}%</span></p>
                      <p className="module-terminal-line text-white/38"><span className="text-[#f0b35a]">02</span> parsing records as soon as they return<span className="terminal-cursor" /></p>
                    </>
                  ) : null}
                  {lines.slice(0, visibleLines).map((line, index) => (
                    <div className={`module-terminal-line module-terminal-line-${line.tone}`} key={`${line.label}-${line.value}-${index}`}>
                      <span className="module-terminal-index">{String(index + 1).padStart(2, "0")}</span>
                      <span className="module-terminal-label">{line.label}</span>
                      <span className="module-terminal-value">{line.value}</span>
                      <span className="module-terminal-meta">{line.meta}</span>
                    </div>
                  ))}
                </div>
              </section>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/account/" className="inline-flex min-h-11 items-center justify-center border border-white/16 px-5 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:border-white hover:bg-white hover:text-black sm:min-h-12 sm:px-6 sm:text-sm sm:tracking-[0.14em]">
                  Account dashboard
                </Link>
              </div>
            </>
          ) : (
            <>
              <aside className="mt-8 border border-[#f0b35a]/50 bg-[#1a1711] p-5 sm:p-6">
                <p className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#f0b35a]">
                  {requiredPlanLabel}+ required
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-white">
                  Upgrade to unlock this module.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62">
                  Your current plan is active, but this workspace requires {requiredPlanLabel} or higher. Upgrade to open it directly.
                </p>
                <p className="mt-4 font-mono text-xs text-white/42">
                  {getRemainingSearches(account)} searches remaining this month.
                </p>
              </aside>

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