"use client";

import { useMemo, useState } from "react";

function makeReport(query: string) {
  const target = query.trim() || "example target";

  return String.raw`
OSINT FORGE // ASCIIFLOW REPORT
Generated: draft session
Target: ${target}

+---------------------+       +---------------------+       +---------------------+
|  SEARCH INPUT       | ----> |  ENTITY CLUSTER     | ----> |  EXPORT BRIEF       |
|  ${target.padEnd(17).slice(0, 17)} |       |  aliases / domains  |       |  terminal + doc     |
+---------------------+       +---------------------+       +---------------------+
          |                             |                              |
          v                             v                              v
  +---------------+             +---------------+              +---------------+
  | source sweep  |             | confidence    |              | evidence log  |
  | public traces |             | relationship  |              | next actions  |
  +---------------+             +---------------+              +---------------+

SUMMARY
- Search term staged for OSINT enrichment.
- Placeholder relationship graph generated in AsciiFlow style.
- Replace these lines with real collected evidence when search data is connected.

EVIDENCE TABLE
+----+----------------------+------------+-------------------------------+
| ID | Signal               | Confidence | Notes                         |
+----+----------------------+------------+-------------------------------+
| 01 | Public source match  | Medium     | Test text for your workflow   |
| 02 | Alias/domain overlap | High       | Test text for your workflow   |
| 03 | Export-ready lead    | Medium     | Test text for your workflow   |
+----+----------------------+------------+-------------------------------+
`.trim();
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

export function ExportConsole() {
  const [query, setQuery] = useState("");
  const report = useMemo(() => makeReport(query), [query]);

  const docContent = `<!doctype html><html><head><meta charset="utf-8"><title>OSINT Forge Report</title></head><body><pre style="font-family:Consolas,monospace;white-space:pre-wrap;">${report.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</pre></body></html>`;

  return (
    <section className="py-12 sm:py-20" data-reveal>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#00e0aa] sm:text-xs sm:tracking-[0.2em]">
        Export reports
      </p>
      <h1 className="mt-4 max-w-3xl text-[clamp(2.35rem,12vw,4.4rem)] font-semibold leading-[1.02] tracking-normal text-white">
        AsciiFlow-style terminal exports.
      </h1>
      <p className="mt-5 max-w-2xl text-sm leading-7 text-white/62 sm:mt-6 sm:text-base sm:leading-8">
        Type a search target, generate a terminal-style report, then export it
        as plain text or a Word-compatible document file.
      </p>

      <div className="mt-8 grid gap-5 sm:mt-10 sm:gap-6 lg:grid-cols-[0.72fr_1fr]">
        <form className="glow-card border border-white/12 bg-[#080a0c] p-4 sm:p-5">
          <label className="text-xs font-bold uppercase tracking-[0.18em] text-white/42">
            Search target
          </label>
          <input
            className="mt-4 min-h-11 w-full border border-white/10 bg-black px-3 font-mono text-xs text-white outline-none transition focus:border-[#00e0aa] sm:min-h-12 sm:px-4 sm:text-sm"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="person, domain, handle, IP..."
            type="search"
            value={query}
          />

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              className="border border-[#00e0aa]/40 px-4 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-[#00e0aa] transition hover:bg-[#00e0aa] hover:text-black sm:px-5 sm:text-xs sm:tracking-[0.16em]"
              onClick={() => downloadFile("osint-forge-report.txt", report, "text/plain")}
              type="button"
            >
              Export TXT
            </button>
            <button
              className="border border-white/16 px-4 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-white transition hover:border-white hover:bg-white hover:text-black sm:px-5 sm:text-xs sm:tracking-[0.16em]"
              onClick={() => downloadFile("osint-forge-report.doc", docContent, "application/msword")}
              type="button"
            >
              Export DOC
            </button>
          </div>
        </form>

        <pre className="report-output glow-card overflow-auto border border-white/12 bg-black p-4 font-mono text-[11px] leading-5 text-[#00e0aa] sm:p-5 sm:text-xs sm:leading-6">
          {report}
        </pre>
      </div>
    </section>
  );
}
