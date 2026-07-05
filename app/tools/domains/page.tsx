import type { Metadata } from "next";

export const metadata: Metadata = { title: "Domain OSINT | OSINT Forge" };
import { ToolSearchPage } from "../tool-search-page";

export default function DomainSearchPage() {
  return (
    <ToolSearchPage
      title="Domain and infrastructure search."
      eyebrow="Domain OSINT"
      description="Search domains, IPs, registrants, DNS clues, and related infrastructure from one terminal-style surface."
      placeholder="domain, IP, ASN, nameserver..."
      examples={["DNS pivoting", "Registrant overlap", "Infrastructure graph"]}
      tool="domains"
    />
  );
}
