export type SearchKind = "people" | "domains" | "handles";

export type SearchResponse = {
  ok: boolean;
  kind: SearchKind | "export" | "health";
  query: string;
  generatedAt: string;
  summary: string;
  signals: Array<{
    label: string;
    value: string;
    confidence: "low" | "medium" | "high";
    source?: string;
  }>;
  sources: Array<{
    name: string;
    url?: string;
  }>;
  note?: string;
};

const localFallbackBase = "http://127.0.0.1:8787";

export function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
    localFallbackBase
  );
}

export async function runToolSearch(kind: SearchKind, query: string) {
  const trimmed = query.trim();

  if (!trimmed) {
    throw new Error("Enter a target first.");
  }

  const response = await fetch(`${getApiBaseUrl()}/api/${kind}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: trimmed }),
  });

  const data = (await response.json().catch(() => null)) as SearchResponse | { error?: string } | null;

  if (!response.ok || !data || !("ok" in data)) {
    throw new Error(data && "error" in data && data.error ? data.error : "Search failed.");
  }

  return data;
}