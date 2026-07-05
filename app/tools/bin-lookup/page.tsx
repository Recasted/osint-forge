import type { Metadata } from "next";

export const metadata: Metadata = { title: "BIN Lookup | OSINT Forge" };
import { ModulePage } from "../module-page";

export default function Page() {
  return (
    <ModulePage
      eyebrow="Risk & Identity"
      title="BIN lookup workspace."
      description="Look up card BIN metadata and issuer details for fraud and payment risk triage."
      examples={["Issuer", "Country", "Card type"]}
      locked={true}
    />
  );
}
