import type { Metadata } from "next";

export const metadata: Metadata = { title: "Stealerlogs | OSINT Forge" };
import { ModulePage } from "../module-page";

export default function Page() {
  return (
    <ModulePage
      eyebrow="Breach Data"
      title="Stealerlogs workspace."
      description="Search stealer-log style exposure data, credentials, cookies, wallets, and archive metadata through provider APIs."
      examples={["Credential exposure", "Cookie traces", "Archive metadata"]}
      locked={true}
      requiredPlan="professional"
    />
  );
}
