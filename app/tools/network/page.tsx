import type { Metadata } from "next";

export const metadata: Metadata = { title: "Network Intelligence | OSINT Forge" };
import { ModulePage } from "../module-page";

export default function Page() {
  return (
    <ModulePage
      eyebrow="Network OSINT"
      title="Network intelligence workspace."
      description="Inspect domains, IPs, ASN clues, DNS records, and infrastructure relationships from one module."
      examples={["DNS records", "ASN clues", "Infrastructure graph"]}
      locked={false}
    />
  );
}
