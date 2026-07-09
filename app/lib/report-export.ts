import type { SearchResponse } from "./api-client";

const width = 100;
const innerWidth = width - 2;

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 52) || "report";
}

function cleanLine(value: string) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function divider() {
  return "=".repeat(width);
}

function boxLine(text = "") {
  const clean = cleanLine(text);
  return `│ ${clean.padEnd(innerWidth - 2).slice(0, innerWidth - 2)} │`;
}

function box(title: string, rows: string[] = []) {
  const top = `┌${"─".repeat(innerWidth)}┐`;
  const mid = `├${"─".repeat(innerWidth)}┤`;
  const bottom = `└${"─".repeat(innerWidth)}┘`;
  return [top, boxLine(title), ...(rows.length ? [mid, ...rows.map((row) => boxLine(row))] : []), bottom].join("\n");
}

function section(title: string) {
  return `${box(title)}\n`;
}

function tree(label: string, value?: string) {
  const left = `├─ ${label}`;
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
  return firstProvider?.name || "OSINTForge";
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
  if (!signals.length) return "├─ No signals returned.";

  return signals.slice(0, 40).map((signal, index) => {
    const meta = signal.source ? `${signal.confidence} / ${signal.source}` : signal.confidence;
    return `    ├─ [${String(index + 1).padStart(3, "0")}] ${cleanLine(signal.label)}: ${cleanLine(signal.value)}  (${meta})`;
  }).join("\n");
}

function sourceOverview(result: SearchResponse) {
  if (!result.sources?.length) return "├─ No sources returned.";
  return result.sources.map((source, index) => tree(`Source #${String(index + 1).padStart(2, "0")}`, `${source.name}${source.url ? ` -> ${source.url}` : ""}`)).join("\n");
}

function itemBox(index: string, rows: Array<{ label: string; value: string; confidence: string; source?: string }>) {
  const top = `┌─ ITEM #${index} ${"─".repeat(Math.max(0, width - 12))}┐`;
  const bottom = `└${"─".repeat(innerWidth)}┘`;
  const preferred = ["Url", "Domain", "Path", "Username", "Email", "Password", "Log", "Id", "Canonical Credential Id", "Indexed At"];
  const ordered = [
    ...preferred.flatMap((label) => rows.filter((row) => row.label.toLowerCase() === label.toLowerCase())),
    ...rows.filter((row) => !preferred.some((label) => row.label.toLowerCase() === label.toLowerCase())),
  ];

  return [
    top,
    ...ordered.slice(0, 24).map((row) => `│   ├─ ${row.label.padEnd(22, ".")} ${cleanLine(row.value).slice(0, 68)}`),
    bottom,
  ].join("\n");
}

function itemSections(result: SearchResponse) {
  const groups = groupItemSignals(result);
  if (!groups.length) return "";

  return [
    section(`${sourceName(result).toUpperCase()} → DATA ITEMS`),
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
    "                                                 │",
    "                                                 ▼",
    box("OSINTForge Investigation Engine", [
      `Module: ${toolName}`,
      `Provider: ${provider}`,
      `Target Type: ${targetType}`,
      `Loaded Modules: ${modulesReturned(result)}`,
    ]),
    "",
    section("CONTEXT  /   REASON"),
    `├─ ${cleanLine(result.summary)}`,
    result.note ? `├─ ${cleanLine(result.note)}` : "",
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
    "├─ Confirm provider output before using this in a case file.",
    "├─ Keep raw search context with the exported report where possible.",
    "└─ Generated locally by OSINT Forge.",
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