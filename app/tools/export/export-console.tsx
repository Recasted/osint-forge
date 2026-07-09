"use client";

import { useMemo, useState } from "react";

import { RecentSearch, getRecentSearches } from "../../lib/account-store";

type ExportFormat = "txt" | "json" | "html" | "doc";

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "report";
}

function formatDate(value?: string) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
}

function makeAsciiFlow(target: string) {
  const clean = target.padEnd(17).slice(0, 17);
  return [
    "+---------------------+       +---------------------+       +---------------------+",
    "|  SEARCH INPUT       | ----> |  SIGNAL CLUSTER     | ----> |  EXPORT BRIEF       |",
    `|  ${clean} |       |  sources / matches  |       |  report evidence    |`,
    "+---------------------+       +---------------------+       +---------------------+",
  ].join("\n");
}

function reportLines(search: RecentSearch | null, notes: string) {
  const target = search?.query || "No search selected";
  const signals = search?.signals || [];
  const sources = search?.sources || [];

  return [
    "OSINT FORGE // INVESTIGATION REPORT",
    `Generated: ${new Date().toISOString()}`,
    `Search date: ${formatDate(search?.createdAt)}`,
    `Module: ${search?.tool || "Manual export"}`,
    `Target: ${target}`,
    "",
    makeAsciiFlow(target),
    "",
    "SUMMARY",
    search?.summary || "Select a recent search or run a tool first. The exporter will format the saved result here.",
    search?.note ? `Note: ${search.note}` : "",
    "",
    "SIGNALS",
    signals.length
      ? signals.map((signal, index) => `${String(index + 1).padStart(2, "0")}. [${signal.confidence.toUpperCase()}] ${signal.label}: ${signal.value}${signal.source ? ` :: ${signal.source}` : ""}`).join("\n")
      : "No saved signal rows for this search yet.",
    "",
    "SOURCES",
    sources.length
      ? sources.map((source, index) => `${String(index + 1).padStart(2, "0")}. ${source.name}${source.url ? ` - ${source.url}` : ""}`).join("\n")
      : "No saved sources for this search yet.",
    "",
    "ANALYST NOTES",
    notes.trim() || "No analyst notes added.",
    "",
    "CHAIN OF CUSTODY",
    "- Generated locally in OSINT Forge export workspace.",
    "- Review all provider output before using this in a case file.",
    "- Keep raw search context with the final report when possible.",
  ].filter(Boolean);
}

function makeTextReport(search: RecentSearch | null, notes: string) {
  return reportLines(search, notes).join("\n");
}

function makeJsonReport(search: RecentSearch | null, notes: string) {
  return JSON.stringify({
    generatedAt: new Date().toISOString(),
    tool: search?.tool || null,
    query: search?.query || null,
    searchedAt: search?.createdAt || null,
    summary: search?.summary || null,
    note: search?.note || null,
    signals: search?.signals || [],
    sources: search?.sources || [],
    analystNotes: notes.trim(),
  }, null, 2);
}

function makeHtmlReport(search: RecentSearch | null, notes: string) {
  const text = makeTextReport(search, notes);
  return `<!doctype html><html><head><meta charset="utf-8"><title>OSINT Forge Report</title><style>body{background:#050607;color:#f3f4f0;font-family:Consolas,monospace;padding:32px;line-height:1.55}pre{white-space:pre-wrap;border:1px solid #1f2a27;padding:24px;background:#000}h1{font-family:Arial,sans-serif}</style></head><body><h1>OSINT Forge Report</h1><pre>${escapeHtml(text)}</pre></body></html>`;
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function exportContent(format: ExportFormat, search: RecentSearch | null, notes: string) {
  if (format === "json") return makeJsonReport(search, notes);
  if (format === "html" || format === "doc") return makeHtmlReport(search, notes);
  return makeTextReport(search, notes);
}

function contentType(format: ExportFormat) {
  if (format === "json") return "application/json";
  if (format === "html") return "text/html";
  if (format === "doc") return "application/msword";
  return "text/plain";
}

export function ExportConsole() {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(() => getRecentSearches());
  const [selectedKey, setSelectedKey] = useState(() => getRecentSearches()[0]?.createdAt || "");
  const [notes, setNotes] = useState("");
  const [format, setFormat] = useState<ExportFormat>("txt");
  const selectedSearch = useMemo(() => recentSearches.find((search) => search.createdAt === selectedKey) || recentSearches[0] || null, [recentSearches, selectedKey]);
  const report = useMemo(() => exportContent(format, selectedSearch, notes), [format, notes, selectedSearch]);
  const filename = `osint-forge-${slug(selectedSearch?.query || "manual")}.${format}`;

  function refreshSearches() {
    const nextSearches = getRecentSearches();
    setRecentSearches(nextSearches);
    setSelectedKey((current) => current || nextSearches[0]?.createdAt || "");
  }

  return (
    <section className="py-12 sm:py-20" data-reveal>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#00e0aa] sm:text-xs sm:tracking-[0.2em]">
        Export reports
      </p>
      <h1 className="mt-4 max-w-3xl text-[clamp(2.35rem,12vw,4.4rem)] font-semibold leading-[1.02] tracking-normal text-white">
        Format saved searches into reports.
      </h1>
      <p className="mt-5 max-w-2xl text-sm leading-7 text-white/62 sm:mt-6 sm:text-base sm:leading-8">
        Pick a recent search, add notes, preview the formatted output, then download it as TXT, JSON, HTML, or Word-compatible DOC.
      </p>

      <div className="mt-8 grid gap-5 sm:mt-10 sm:gap-6 lg:grid-cols-[0.72fr_1fr]">
        <form className="glow-card border border-white/12 bg-[#080a0c] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <label className="text-xs font-bold uppercase tracking-[0.18em] text-white/42" htmlFor="export-search">
              Recent search
            </label>
            <button className="text-[11px] font-black uppercase tracking-[0.12em] text-[#00e0aa] hover:text-white" onClick={refreshSearches} type="button">
              Refresh
            </button>
          </div>
          <select
            className="mt-4 min-h-11 w-full border border-white/10 bg-black px-3 font-mono text-xs text-white outline-none transition focus:border-[#00e0aa] sm:min-h-12 sm:px-4 sm:text-sm"
            id="export-search"
            onChange={(event) => setSelectedKey(event.target.value)}
            value={selectedSearch?.createdAt || ""}
          >
            {recentSearches.length ? recentSearches.map((search) => (
              <option key={`${search.createdAt}-${search.query}`} value={search.createdAt}>{search.tool} :: {search.query}</option>
            )) : <option value="">No searches saved yet</option>}
          </select>

          <label className="mt-5 block text-xs font-bold uppercase tracking-[0.18em] text-white/42" htmlFor="export-format">
            Format
          </label>
          <select
            className="mt-4 min-h-11 w-full border border-white/10 bg-black px-3 font-mono text-xs text-white outline-none transition focus:border-[#00e0aa] sm:min-h-12 sm:px-4 sm:text-sm"
            id="export-format"
            onChange={(event) => setFormat(event.target.value as ExportFormat)}
            value={format}
          >
            <option value="txt">TXT case brief</option>
            <option value="json">JSON evidence payload</option>
            <option value="html">HTML report</option>
            <option value="doc">Word-compatible DOC</option>
          </select>

          <label className="mt-5 block text-xs font-bold uppercase tracking-[0.18em] text-white/42" htmlFor="export-notes">
            Analyst notes
          </label>
          <textarea
            className="mt-4 min-h-32 w-full border border-white/10 bg-black px-3 py-3 font-mono text-xs text-white outline-none transition focus:border-[#00e0aa] sm:px-4 sm:text-sm"
            id="export-notes"
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Add context, confidence notes, next pivots, or case references..."
            value={notes}
          />

          <button
            className="mt-5 w-full border border-[#00e0aa]/40 px-4 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-[#00e0aa] transition hover:bg-[#00e0aa] hover:text-black disabled:cursor-not-allowed disabled:opacity-50 sm:px-5 sm:text-xs sm:tracking-[0.16em]"
            disabled={!selectedSearch}
            onClick={() => downloadFile(filename, report, contentType(format))}
            type="button"
          >
            Download {format.toUpperCase()}
          </button>

          {!selectedSearch ? <p className="mt-4 border border-[#f0b35a]/30 bg-[#f0b35a]/10 px-3 py-2 text-sm leading-6 text-[#f0d39a]">Run a tool first, then come back here and hit Refresh.</p> : null}
        </form>

        <pre className="report-output glow-card max-h-[680px] overflow-auto border border-white/12 bg-black p-4 font-mono text-[11px] leading-5 text-[#00e0aa] sm:p-5 sm:text-xs sm:leading-6">
          {report}
        </pre>
      </div>
    </section>
  );
}