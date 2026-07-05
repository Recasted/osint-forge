import type { Metadata } from "next";

export const metadata: Metadata = { title: "Universal Search | OSINT Forge" };
import { ModulePage } from "../module-page";

export default function Page() {
  return (
    <ModulePage
      eyebrow="Universal Search"
      title="Universal search workspace."
      description="Run a broad query across identity, domain, handle, and breach-oriented modules."
      examples={["Entity search", "Source labels", "Risk summary"]}
      locked={true}
      requiredPlan="professional"
    />
  );
}
