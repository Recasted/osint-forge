import type { Metadata } from "next";

export const metadata: Metadata = { title: "Email OSINT | OSINT Forge" };
import { ModulePage } from "../module-page";

export default function Page() {
  return (
    <ModulePage
      eyebrow="Email OSINT"
      title="Email OSINT workspace."
      description="Search email exposure, account footprint signals, breach hints, and reusable identity pivots."
      examples={["Email footprint", "Breach correlation", "Account discovery"]}
      locked={true}
    />
  );
}
