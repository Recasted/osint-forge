import type { SearchResponse } from "./api-client";

export type ReportFormat = "txt" | "json" | "html" | "doc" | "casefile" | "ascii";

const width = 100;
const innerWidth = width - 2;

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 52) || "report";
}

function brandProviderText(value: string) {
  return value.replace(/DeepIntel/gi, "OSINTForge").replace(/deep intel/gi, "OSINTForge");
}

function cleanLine(value: string) {
  return brandProviderText(String(value || "").replace(/\s+/g, " ").trim());
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function divider() {
  return "=".repeat(width);
}

function boxLine(text = "") {
  const clean = cleanLine(text);
  return `| ${clean.padEnd(innerWidth - 2).slice(0, innerWidth - 2)} |`;
}

function box(title: string, rows: string[] = []) {
  const rule = `+${"-".repeat(innerWidth)}+`;
  return [rule, boxLine(title), ...(rows.length ? [rule, ...rows.map((row) => boxLine(row))] : []), rule].join("\n");
}

function section(title: string) {
  return `${box(title)}\n`;
}

function tree(label: string, value?: string) {
  const left = `|- ${label}`;
  if (!value) return left;
  const dots = ".".repeat(Math.max(2, 34 - left.length));
  return `${left}${dots} ${value}`;
}

function detectTargetType(query: string) {
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(query)) return "EMAIL";
  if (/^\+?[0-9\s().-]{10,18}$/.test(query)) return "PHONE";
  if (/^https?:\/\//i.test(query)) return "URL";
  if (/^(?!-)[a-z0-9-]{1,63}(?<!-)\.[a-z]{2,}$/i.test(query.replace(/^https?:\/\//, "").split("/")[0])) return "DOMAIN";
  if (/^\d{17,20}$/.test(query.trim())) return "DISCORD_ID";
  return "IDENTIFIER";
}

function titleCase(value: string) {
  return value.replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isInternalProviderLine(label: string, value: string, source?: string) {
  const text = `${label} ${value} ${source || ""}`.toLowerCase();
  return text.includes("oversight index") || text.includes("deepintel oversight") || text.includes("deep intel oversight");
}

function signalsForReport(result: SearchResponse) {
  return result.signals.filter((signal) => !isInternalProviderLine(signal.label, signal.value, signal.source));
}

function modulesReturned(result: SearchResponse) {
  const hit = signalsForReport(result).find((signal) => /modules?/i.test(signal.label) && /returned|module/i.test(signal.value));
  const match = hit?.value.match(/\d+/);
  return match?.[0] || String(Math.max(1, new Set(signalsForReport(result).map((signal) => signal.source).filter(Boolean)).size));
}

function sourceName(result: SearchResponse) {
  const firstProvider = result.sources?.find((source) => !/parser|cloudflare/i.test(source.name));
  return cleanLine(firstProvider?.name || "OSINTForge");
}

function displaySourceUrl(url?: string) {
  if (!url) return "";
  return /deepintel/i.test(url) ? "https://osintforge.dev" : url;
}

function groupItemSignals(result: SearchResponse) {
  const groups = new Map<string, Array<{ label: string; value: string; confidence: string; source?: string }>>();

  for (const signal of signalsForReport(result)) {
    const match = signal.label.match(/(?:Data\s+)?Items?\s+#?(\d+)\s+(.+)/i);
    if (!match) continue;
    const index = match[1].padStart(2, "0");
    const label = titleCase(match[2]);
    const existing = groups.get(index) || [];
    existing.push({ label, value: signal.value, confidence: signal.confidence, source: signal.source });
    groups.set(index, existing);
  }

  return [...groups.entries()].slice(0, 25);
}

function moduleOverview(result: SearchResponse, toolName: string) {
  const signals = signalsForReport(result);
  const rows = [
    tree("Target", result.query),
    tree("Module", toolName),
    tree("Target Type", detectTargetType(result.query)),
    tree("Provider", sourceName(result)),
    tree("Loaded Modules", modulesReturned(result)),
    tree("Signals Returned", String(signals.length)),
    tree("Generated At", result.generatedAt),
  ];

  if (result.note) rows.push(tree("Note", cleanLine(result.note)));
  return rows.join("\n");
}

function signalOverview(result: SearchResponse) {
  const signals = signalsForReport(result);
  if (!signals.length) return "|- No signals returned.";

  return signals.slice(0, 40).map((signal, index) => {
    const meta = signal.source ? `${signal.confidence} / ${cleanLine(signal.source)}` : signal.confidence;
    return `    |- [${String(index + 1).padStart(3, "0")}] ${cleanLine(signal.label)}: ${cleanLine(signal.value)}  (${meta})`;
  }).join("\n");
}

function sourceOverview(result: SearchResponse) {
  if (!result.sources?.length) return "|- No sources returned.";
  return result.sources.map((source, index) => {
    const url = displaySourceUrl(source.url);
    return tree(`Source #${String(index + 1).padStart(2, "0")}`, `${cleanLine(source.name)}${url ? ` -> ${url}` : ""}`);
  }).join("\n");
}

function itemBox(index: string, rows: Array<{ label: string; value: string; confidence: string; source?: string }>) {
  const top = `+- ITEM #${index} ${"-".repeat(Math.max(0, width - 12))}+`;
  const bottom = `+${"-".repeat(innerWidth)}+`;
  const preferred = ["Url", "Domain", "Path", "Username", "Email", "Password", "Log", "Id", "Canonical Credential Id", "Indexed At"];
  const ordered = [
    ...preferred.flatMap((label) => rows.filter((row) => row.label.toLowerCase() === label.toLowerCase())),
    ...rows.filter((row) => !preferred.some((label) => row.label.toLowerCase() === label.toLowerCase())),
  ];

  return [
    top,
    ...ordered.slice(0, 24).map((row) => `|   |- ${row.label.padEnd(22, ".")} ${cleanLine(row.value).slice(0, 68)}`),
    bottom,
  ].join("\n");
}

function itemSections(result: SearchResponse) {
  const groups = groupItemSignals(result);
  if (!groups.length) return "";

  return [
    section(`${sourceName(result).toUpperCase()} -> DATA ITEMS`),
    ...groups.map(([index, rows]) => itemBox(index, rows)),
  ].join("\n\n");
}

export function makeSearchReport(result: SearchResponse, toolName: string) {
  const provider = sourceName(result);
  const targetType = detectTargetType(result.query);
  const title = `OSINTFORGE ${toolName.toUpperCase()} REPORT`;
  const items = itemSections(result);

  return [
    title,
    divider(),
    "",
    box(`TARGET: ${result.query}`),
    "                                                 |",
    "                                                 v",
    box("OSINTForge Investigation Engine", [
      `Module: ${toolName}`,
      `Provider: ${provider}`,
      `Target Type: ${targetType}`,
      `Loaded Modules: ${modulesReturned(result)}`,
    ]),
    "",
    section("CONTEXT  /   REASON"),
    `|- ${cleanLine(result.summary)}`,
    result.note ? `|- ${cleanLine(result.note)}` : "",
    "",
    section("MODULE OVERVIEW"),
    moduleOverview(result, toolName),
    "",
    divider(),
    "SIGNAL INDEX",
    divider(),
    signalOverview(result),
    "",
    items,
    items ? "" : "",
    divider(),
    "SOURCES",
    divider(),
    sourceOverview(result),
    "",
    divider(),
    "REVIEW NOTES",
    divider(),
    "|- Confirm provider output before using this in a case file.",
    "|- Keep raw search context with the exported report where possible.",
    "`- Generated locally by OSINT Forge.",
  ].filter(Boolean).join("\n");
}

export function makeCaseFileReport(result: SearchResponse, toolName: string) {
  const signals = signalsForReport(result);
  return [
    divider(),
    `OSINTFORGE CASE FILE :: ${toolName.toUpperCase()}`,
    divider(),
    `Generated..... ${new Date().toISOString()}`,
    `Target........ ${result.query}`,
    `Target Type... ${detectTargetType(result.query)}`,
    `Module........ ${toolName}`,
    `Provider...... ${sourceName(result)}`,
    `Signal Count.. ${signals.length}`,
    "",
    section("EXECUTIVE SUMMARY"),
    cleanLine(result.summary),
    result.note ? cleanLine(result.note) : "",
    "",
    section("EVIDENCE SUMMARY"),
    signals.length ? signals.map((signal, index) => `${String(index + 1).padStart(2, "0")}. ${cleanLine(signal.label).padEnd(28, ".")} ${cleanLine(signal.value)} (${signal.confidence}${signal.source ? ` / ${cleanLine(signal.source)}` : ""})`).join("\n") : "No signals returned.",
    "",
    section("SOURCES"),
    sourceOverview(result),
    "",
    section("REVIEW NOTES"),
    "This report is generated for authorized investigation, triage, and defensive review.",
  ].filter(Boolean).join("\n");
}

export function makeAsciiDocumentReport(result: SearchResponse, toolName: string) {
  const signals = signalsForReport(result);
  const groups = groupItemSignals(result);
  const targetType = detectTargetType(result.query);
  const provider = sourceName(result);
  const line = "+" + "-".repeat(innerWidth) + "+";
  const row = (value = "") => `| ${cleanLine(value).slice(0, innerWidth - 2).padEnd(innerWidth - 2)} |`;
  const panel = (title: string, rows: string[] = []) => [
    line,
    row(title.toUpperCase()),
    line,
    ...rows.map((value) => row(value)),
    line,
  ].join("\n");
  const signalRows = signals.slice(0, 40).map((signal, index) => {
    const value = cleanLine(signal.value).slice(0, 72);
    return `|   +-- [${String(index + 1).padStart(3, "0")}] ${cleanLine(signal.label)} -> ${value}`;
  });
  const itemRows = groups.flatMap(([index, rows]) => [
    `+-- ITEM #${index}`,
    ...rows.slice(0, 16).map((item) => `|   +-- ${item.label}: ${cleanLine(item.value).slice(0, 78)}`),
  ]);
  const sourceRows = result.sources?.length
    ? result.sources.map((source, index) => {
      const url = displaySourceUrl(source.url);
      return `+-- SOURCE #${String(index + 1).padStart(2, "0")}: ${cleanLine(source.name)}${url ? ` -> ${url}` : ""}`;
    })
    : ["+-- No sources returned"];

  return [
    panel("OSINTForge ASCII Document", [
      `Target : ${result.query}`,
      `Module : ${toolName}`,
      `Type   : ${targetType}`,
      `Source : ${provider}`,
      `Signals: ${signals.length}`,
    ]),
    "",
    result.query,
    "|",
    `+--> [MODULE] ${toolName}`,
    "|    |",
    `|    +--> [PROVIDER] ${provider}`,
    `|    +--> [TARGET TYPE] ${targetType}`,
    `|    +--> [LOADED MODULES] ${modulesReturned(result)}`,
    "|",
    "+--> [SUMMARY]",
    `|    +-- ${cleanLine(result.summary)}`,
    result.note ? `|    +-- ${cleanLine(result.note)}` : "",
    "|",
    "+--> [SIGNALS]",
    signalRows.length ? signalRows.join("\n") : "|   +-- No signals returned",
    "",
    groups.length ? panel("Item Groups") : "",
    groups.length ? itemRows.join("\n") : "",
    "",
    panel("Sources"),
    sourceRows.join("\n"),
    "",
    panel("Review Notes", [
      "Confirm provider output before using this in a case file.",
      "Keep raw search context with the exported report where possible.",
      "Generated locally by OSINT Forge.",
    ]),
  ].filter(Boolean).join("\n");
}

export function makeJsonReport(result: SearchResponse, toolName: string) {
  return JSON.stringify({
    generatedAt: new Date().toISOString(),
    module: toolName,
    kind: result.kind,
    query: result.query,
    searchedAt: result.generatedAt,
    targetType: detectTargetType(result.query),
    summary: cleanLine(result.summary),
    note: result.note ? cleanLine(result.note) : null,
    signals: signalsForReport(result).map((signal) => ({
      label: cleanLine(signal.label),
      value: cleanLine(signal.value),
      confidence: signal.confidence,
      source: signal.source ? cleanLine(signal.source) : undefined,
    })),
    sources: result.sources?.map((source) => ({ name: cleanLine(source.name), url: displaySourceUrl(source.url) })) || [],
  }, null, 2);
}

export function makeHtmlReport(result: SearchResponse, toolName: string) {
  const text = makeSearchReport(result, toolName);
  return `<!doctype html><html><head><meta charset="utf-8"><title>OSINT Forge Report</title><style>body{background:#050607;color:#f3f4f0;font-family:Consolas,monospace;padding:32px;line-height:1.55}pre{white-space:pre-wrap;border:1px solid #1f2a27;padding:24px;background:#000;color:#00e0aa}</style></head><body><pre>${escapeHtml(text)}</pre></body></html>`;
}

export function reportContent(result: SearchResponse, toolName: string, format: ReportFormat) {
  if (format === "json") return makeJsonReport(result, toolName);
  if (format === "html" || format === "doc") return makeHtmlReport(result, toolName);
  if (format === "casefile") return makeCaseFileReport(result, toolName);
  if (format === "ascii") return makeAsciiDocumentReport(result, toolName);
  return makeSearchReport(result, toolName);
}

export function searchReportFilename(result: SearchResponse, toolName: string, format: ReportFormat) {
  const extension = format === "json" ? "json" : format === "html" ? "html" : format === "doc" ? "doc" : "txt";
  const style = format === "txt" ? "brief" : format;
  return `osint-forge-${slug(toolName)}-${slug(result.query)}-${style}.${extension}`;
}

function contentType(format: ReportFormat) {
  if (format === "json") return "application/json;charset=utf-8";
  if (format === "html") return "text/html;charset=utf-8";
  if (format === "doc") return "application/msword;charset=utf-8";
  return "text/plain;charset=utf-8";
}

export function downloadReport(result: SearchResponse, toolName: string, format: ReportFormat) {
  const blob = new Blob([reportContent(result, toolName, format)], { type: contentType(format) });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = searchReportFilename(result, toolName, format);
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadTextReport(result: SearchResponse, toolName: string) {
  downloadReport(result, toolName, "txt");
}