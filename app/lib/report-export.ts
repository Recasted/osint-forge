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

type ItemRow = { label: string; value: string; confidence: string; source?: string };
type ItemGroup = [string, ItemRow[]];

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

function rowMatches(row: ItemRow, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(row.label));
}

function findRow(rows: ItemRow[], patterns: RegExp[]) {
  return rows.find((row) => rowMatches(row, patterns));
}

function isCountValue(value: string) {
  return /^\d+\s+records?$/i.test(cleanLine(value));
}

function rowValue(rows: ItemRow[], patterns: RegExp[]) {
  return cleanLine(findRow(rows, patterns)?.value || "");
}

function rowDataValue(rows: ItemRow[], patterns: RegExp[]) {
  return cleanLine(rows.find((row) => rowMatches(row, patterns) && !isCountValue(row.value))?.value || "");
}

function extractDomain(value: string) {
  const clean = cleanLine(value).replace(/^https?:\/\//i, "https://");
  try {
    return new URL(clean).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    const match = cleanLine(value).match(/(?:https?:\/\/)?(?:www\.)?([a-z0-9-]+(?:\.[a-z0-9-]+)+)/i);
    return match?.[1]?.replace(/^www\./i, "").toLowerCase() || "";
  }
}

function itemDomain(rows: ItemRow[]) {
  return rowDataValue(rows, [/^domain #?\d+$/i, /^domain$/i, /^host$/i, /^hostname$/i]) || extractDomain(itemUrl(rows));
}

function itemUrl(rows: ItemRow[]) {
  return rowDataValue(rows, [/^url$/i, /^url #?\d+$/i, /^site$/i, /^website$/i, /^path #?\d+$/i, /^path$/i, /login/i]);
}

function itemPassword(rows: ItemRow[]) {
  return rowValue(rows, [/password/i, /pass/i, /credential/i]);
}

function itemDate(rows: ItemRow[]) {
  return rowValue(rows, [/indexed/i, /observed/i, /pwned/i, /date/i, /created/i, /updated/i]);
}

function dateRank(value: string) {
  const match = cleanLine(value).match(/\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}:\d{2}Z?)?/);
  if (!match) return Number.POSITIVE_INFINITY;
  const time = Date.parse(match[0]);
  return Number.isNaN(time) ? Number.POSITIVE_INFINITY : -time;
}

function compareItemGroups(a: ItemGroup, b: ItemGroup) {
  const domainCompare = itemDomain(a[1]).localeCompare(itemDomain(b[1]));
  if (domainCompare) return domainCompare;
  const dateCompare = dateRank(itemDate(a[1])) - dateRank(itemDate(b[1]));
  if (dateCompare) return dateCompare;
  const urlCompare = itemUrl(a[1]).localeCompare(itemUrl(b[1]));
  if (urlCompare) return urlCompare;
  return Number(a[0]) - Number(b[0]);
}

function groupItemSignals(result: SearchResponse) {
  const groups = new Map<string, ItemRow[]>();

  for (const signal of signalsForReport(result)) {
    const match = signal.label.match(/(?:Data\s+)?Items?\s+#?(\d+)\s+(.+)/i);
    if (!match) continue;
    const index = match[1].padStart(2, "0");
    const label = titleCase(match[2]);
    const existing = groups.get(index) || [];
    existing.push({ label, value: signal.value, confidence: signal.confidence, source: signal.source });
    groups.set(index, existing);
  }

  return [...groups.entries()].sort(compareItemGroups).slice(0, 25);
}

function uniqueValues(values: string[]) {
  return [...new Set(values.map(cleanLine).filter(Boolean))];
}

function urlHierarchy(result: SearchResponse) {
  const groups = groupItemSignals(result);
  if (!groups.length) return "|- No item records available for hierarchy.";
  const byDomain = new Map<string, string[]>();

  for (const [, rows] of groups) {
    const domain = itemDomain(rows) || "unknown-domain";
    const urls = byDomain.get(domain) || [];
    const url = itemUrl(rows) || "record without URL/path";
    urls.push(url);
    byDomain.set(domain, urls);
  }

  return [...byDomain.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([domain, urls], domainIndex, domains) => {
    const domainBranch = domainIndex === domains.length - 1 ? "`-" : "|-";
    const childPrefix = domainIndex === domains.length - 1 ? "   " : "|  ";
    const children = uniqueValues(urls).sort().slice(0, 12).map((url, urlIndex, allUrls) => {
      const branch = urlIndex === allUrls.length - 1 ? "`-" : "|-";
      return `${childPrefix} ${branch} ${url}`;
    });
    return [`${domainBranch} ${domain}`, ...children].join("\n");
  }).join("\n");
}

function boxTreeRelationshipGraph(result: SearchResponse) {
  const groups = groupItemSignals(result);
  if (!groups.length) return "";
  const byDomain = new Map<string, string[]>();

  for (const [, rows] of groups) {
    const domain = itemDomain(rows) || "unknown-domain";
    const urls = byDomain.get(domain) || [];
    urls.push(itemUrl(rows) || "record without URL/path");
    byDomain.set(domain, urls);
  }

  const lines = [
    `► ${cleanLine(result.query)}`,
    "│",
    "▼",
    "█ RELATED DOMAINS",
    "│",
  ];
  const domains = [...byDomain.entries()].sort(([a], [b]) => a.localeCompare(b));
  domains.forEach(([domain, urls], domainIndex) => {
    const lastDomain = domainIndex === domains.length - 1;
    lines.push(`${lastDomain ? "└" : "├"}──► ${domain}`);
    const domainStem = lastDomain ? "   " : "│  ";
    const cleanUrls = uniqueValues(urls).sort().slice(0, 10);
    cleanUrls.forEach((url, urlIndex) => {
      const lastUrl = urlIndex === cleanUrls.length - 1;
      lines.push(`${domainStem}${lastUrl ? "└" : "├"}──► ${url}`);
    });
  });
  return lines.join("\n");
}

function boxTreeText(value: string) {
  return value
    .replace(/\|-/g, "├──►")
    .replace(/`-/g, "└──►")
    .replace(/\|  /g, "│  ")
    .replace(/   /g, "   ");
}
function credentialReuseGraph(result: SearchResponse) {
  const groups = groupItemSignals(result);
  const byPassword = new Map<string, string[]>();

  for (const [, rows] of groups) {
    const password = itemPassword(rows);
    if (!password) continue;
    const target = itemUrl(rows) || itemDomain(rows) || "unknown target";
    const existing = byPassword.get(password) || [];
    existing.push(target);
    byPassword.set(password, existing);
  }

  const reused = [...byPassword.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
  if (!reused.length) return "|- No credential reuse fields returned.";

  return reused.slice(0, 12).map(([password, targets], index, allPasswords) => {
    const branch = index === allPasswords.length - 1 ? "`-" : "|-";
    const cleanTargets = uniqueValues(targets).sort();
    const targetLines = cleanTargets.slice(0, 8).map((target, targetIndex, allTargets) => {
      const targetBranch = targetIndex === allTargets.length - 1 ? "`-" : "|-";
      const prefix = index === allPasswords.length - 1 ? "   " : "|  ";
      return `${prefix} ${targetBranch} ${target}`;
    });
    return [`${branch} ${password} (${cleanTargets.length} target${cleanTargets.length === 1 ? "" : "s"})`, ...targetLines].join("\n");
  }).join("\n");
}

function timelineOverview(result: SearchResponse) {
  const groups = groupItemSignals(result);
  const byDate = new Map<string, string[]>();

  for (const [index, rows] of groups) {
    const date = itemDate(rows);
    const match = date.match(/\d{4}-\d{2}-\d{2}/);
    if (!match) continue;
    const entries = byDate.get(match[0]) || [];
    entries.push(`Item #${index}: ${itemUrl(rows) || itemDomain(rows) || "record"}`);
    byDate.set(match[0], entries);
  }

  const entries = [...byDate.entries()].sort(([a], [b]) => b.localeCompare(a));
  if (!entries.length) return "|- No timeline fields returned.";

  return entries.slice(0, 10).map(([date, rows], index, allDates) => {
    const branch = index === allDates.length - 1 ? "`-" : "|-";
    const prefix = index === allDates.length - 1 ? "   " : "|  ";
    return [`${branch} ${date}`, ...uniqueValues(rows).slice(0, 8).map((row, rowIndex, allRows) => `${prefix} ${rowIndex === allRows.length - 1 ? "`-" : "|-"} ${row}`)].join("\n");
  }).join("\n");
}

function intelligenceSummary(result: SearchResponse) {
  const groups = groupItemSignals(result);
  const domains = uniqueValues(groups.map(([, rows]) => itemDomain(rows)));
  const urls = uniqueValues(groups.map(([, rows]) => itemUrl(rows)));
  const passwords = uniqueValues(groups.map(([, rows]) => itemPassword(rows)));
  const dated = groups.filter(([, rows]) => itemDate(rows)).length;
  return [
    tree("Records", String(groups.length)),
    tree("Related Domains", String(domains.length)),
    tree("Observed URLs", String(urls.length)),
    tree("Credential Variants", String(passwords.length)),
    tree("Timeline Events", String(dated)),
  ].join("\n");
}

function sortedAnalysisSections(result: SearchResponse) {
  if (!groupItemSignals(result).length) return "";
  return [
    section("URL HIERARCHY"),
    urlHierarchy(result),
    "",
    section("CREDENTIAL REUSE"),
    credentialReuseGraph(result),
    "",
    section("TIMELINE"),
    timelineOverview(result),
    "",
    section("INTELLIGENCE SUMMARY"),
    intelligenceSummary(result),
  ].join("\n");
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

function boxTreeSeparator(title: string) {
  const line = "┌" + "─".repeat(innerWidth) + "┐";
  const mid = "├" + "─".repeat(innerWidth) + "┤";
  const bottom = "└" + "─".repeat(innerWidth) + "┘";
  const row = `│ █ ${cleanLine(title).toUpperCase()} ▓▒░`.padEnd(innerWidth + 1) + "│";
  return [line, row, mid, bottom].join("\n");
}
function fieldCode(label: string) {
  if (/^url/i.test(label)) return "URL";
  if (/^(username|email|mail)/i.test(label)) return "MAIL";
  if (/^password$/i.test(label)) return "PW";
  if (/password hash/i.test(label)) return "PW HASH";
  if (/^(id|canonical)/i.test(label)) return "ID";
  if (/log id/i.test(label)) return "LOG";
  if (/domain/i.test(label)) return "DOMAIN";
  if (/path/i.test(label)) return "PATH";
  if (/archive/i.test(label)) return "ARCHIVE";
  if (/(indexed|pwned|observed|date|created|updated)/i.test(label)) return "DATE";
  if (/hwid/i.test(label)) return "HWID";
  if (/device/i.test(label)) return "DEVICE";
  return label.toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim().slice(0, 14) || "FIELD";
}

function fieldRank(label: string) {
  const code = fieldCode(label);
  const order = ["URL", "DOMAIN", "PATH", "MAIL", "PW", "PW HASH", "ID", "LOG", "ARCHIVE", "DATE", "DEVICE", "HWID"];
  const index = order.indexOf(code);
  return index === -1 ? order.length : index;
}

function sortedRowsForItem(rows: ItemRow[]) {
  return [...rows]
    .filter((row) => !isCountValue(row.value))
    .sort((a, b) => fieldRank(a.label) - fieldRank(b.label) || a.label.localeCompare(b.label));
}

function itemSignalIndex(result: SearchResponse) {
  const groups = groupItemSignals(result);
  if (!groups.length) {
    return signalOverview(result).replace(/\|-/g, "├──►").replace(/`-/g, "└──►");
  }

  return groups.flatMap(([index, rows]) => {
    const cleanIndex = String(Number(index) || index).padStart(2, "0");
    const sortedRows = sortedRowsForItem(rows).slice(0, 18);
    return [
      boxTreeSeparator(`Item ${cleanIndex}`),
      ...sortedRows.map((row, rowIndex) => {
        const lastRow = rowIndex === sortedRows.length - 1;
        return `${lastRow ? "└" : "├"}──► ${fieldCode(row.label).padEnd(8)} ${cleanIndex} │ ${cleanLine(row.value).slice(0, 88)}`;
      }),
    ];
  }).join("\n");
}
function itemBox(index: string, rows: ItemRow[]) {
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
    sortedAnalysisSections(result),
    sortedAnalysisSections(result) ? "" : "",
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
    sortedAnalysisSections(result),
    sortedAnalysisSections(result) ? "" : "",
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
  const line = "┌" + "─".repeat(innerWidth) + "┐";
  const mid = "├" + "─".repeat(innerWidth) + "┤";
  const bottom = "└" + "─".repeat(innerWidth) + "┘";
  const row = (value = "") => `│ ${cleanLine(value).slice(0, innerWidth - 2).padEnd(innerWidth - 2)} │`;
  const panel = (title: string, rows: string[] = []) => [
    line,
    row(`█ ${title.toUpperCase()} ▓▒░`),
    mid,
    ...rows.map((value) => row(value)),
    bottom,
  ].join("\n");
  const signalRows = itemSignalIndex(result);
  const itemRows = groups.flatMap(([index, rows], groupIndex) => [
    `${groupIndex === groups.length - 1 ? "└" : "├"}──► ITEM #${index}`,
    ...rows.slice(0, 16).map((item, itemIndex, allItems) => `│   ${itemIndex === allItems.length - 1 ? "└" : "├"}──► ${item.label}: ${cleanLine(item.value).slice(0, 78)}`),
  ]);
  const sourceRows = result.sources?.length
    ? result.sources.map((source, index, allSources) => {
      const url = displaySourceUrl(source.url);
      return `${index === allSources.length - 1 ? "└" : "├"}──► SOURCE #${String(index + 1).padStart(2, "0")}: ${cleanLine(source.name)}${url ? ` ─ ${url}` : ""}`;
    })
    : ["└──► No sources returned"];

  return [
    panel("OSINTForge Box Drawing Document", [
      `Target  │ ${result.query}`,
      `Module  │ ${toolName}`,
      `Type    │ ${targetType}`,
      `Source  │ ${provider}`,
      `Signals │ ${signals.length}`,
    ]),
    "",
    boxTreeRelationshipGraph(result) || [
      `► ${result.query}`,
      "│",
      "▼",
      `█ MODULE: ${toolName}`,
      "│",
      `├──► PROVIDER: ${provider}`,
      `├──► TARGET TYPE: ${targetType}`,
      `└──► LOADED MODULES: ${modulesReturned(result)}`,
    ].join("\n"),
    "",
    "█ SUMMARY",
    "│",
    `└──► ${cleanLine(result.summary)}`,
    result.note ? `    └──► ${cleanLine(result.note)}` : "",
    "",
    groups.length ? panel("URL Hierarchy") : "",
    groups.length ? boxTreeText(urlHierarchy(result)) : "",
    groups.length ? "" : "",
    groups.length ? panel("Credential Reuse") : "",
    groups.length ? boxTreeText(credentialReuseGraph(result)) : "",
    groups.length ? "" : "",
    groups.length ? panel("Timeline") : "",
    groups.length ? boxTreeText(timelineOverview(result)) : "",
    groups.length ? "" : "",
    groups.length ? panel("Intelligence Summary") : "",
    groups.length ? boxTreeText(intelligenceSummary(result)) : "",
    groups.length ? "" : "",
    panel("Item Index"),
    signalRows || "└──► No item signals returned",
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