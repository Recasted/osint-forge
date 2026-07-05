import type { Metadata } from "next";

export const metadata: Metadata = { title: "AML Screening | OSINT Forge" };
import { ModulePage } from "../module-page";

export default function Page() {
  return (
    <ModulePage
      eyebrow="AML Screening"
      title="AML screening workspace."
      description="Stage wallet, entity, and sanctions-style risk screening workflows for compliant investigations."
      examples={["Wallet risk", "Sanctions hints", "Entity checks"]}
      locked={true}
    />
  );
}
