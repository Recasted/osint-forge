import type { Metadata } from "next";

export const metadata: Metadata = { title: "IP Intelligence | OSINT Forge" };
import { ModulePage } from "../module-page";

export default function Page() {
  return (
    <ModulePage
      eyebrow="Risk & Identity"
      title="IP intelligence workspace."
      description="Inspect IP geolocation, ASN, proxy/TOR flags, and infrastructure risk signals."
      examples={["ASN", "Geolocation", "Proxy risk"]}
      locked={true}
    />
  );
}
