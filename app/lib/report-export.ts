import { SearchResponse } from "./api-client";

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 52) || "report";
}

function cleanLine(value: string) {
  return value.replace(/\s+/g, " ").trim();
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

function isInternalProviderLine(label: string, value: string, source?: string) {
  const text = `${label} ${value} ${source || ""}`.toLowerCase();
  return text.includes("oversight index") || text.includes("deepintel oversight") || text.includes("deep intel oversight");
}

export function makeSearchReport(result: SearchResponse, toolName: string) {
  const signals = result.signals.filter((signal) => !isInternalProviderLine(signal.label, signal.value, signal.source));
  const sources = result.sources || [];

  return [
    "OSINT FORGE // INVESTIGATION REPORT",
    `Generated: ${new Date().toISOString()}`,
    `Search date: ${result.generatedAt}`,
    `Module: ${toolName}`,
    `Target: ${result.query}`,
    `Result kind: ${result.kind}`,
    "",
    makeAsciiFlow(result.query),
    "",
    "SUMMARY",
    cleanLine(result.summary),
    result.note ? `Note: ${cleanLine(result.note)}` : "",
    "",
    "SIGNALS",
    signals.length
      ? signals.map((signal, index) => `${String(index + 1).padStart(2, "0")}. [${signal.confidence.toUpperCase()}] ${cleanLine(signal.label)}: ${cleanLine(signal.value)}${signal.source ? ` :: ${cleanLine(signal.source)}` : ""}`).join("\n")
      : "No signals returned.",
    "",
    "SOURCES",
    sources.length
      ? sources.map((source, index) => `${String(index + 1).padStart(2, "0")}. ${cleanLine(source.name)}${source.url ? ` - ${source.url}` : ""}`).join("\n")
      : "No sources returned.",
    "",
    "REVIEW NOTES",
    "- Confirm provider results before using this in a case file.",
    "- Keep raw search context with the final report when possible.",
  ].filter(Boolean).join("\n");
}

export function searchReportFilename(result: SearchResponse, toolName: string) {
  return `osint-forge-${slug(toolName)}-${slug(result.query)}.txt`;
}

export function downloadTextReport(result: SearchResponse, toolName: string) {
  const blob = new Blob([makeSearchReport(result, toolName)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = searchReportFilename(result, toolName);
  anchor.click();
  URL.revokeObjectURL(url);
}