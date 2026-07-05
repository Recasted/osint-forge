import type { Metadata } from "next";

export const metadata: Metadata = { title: "AML Entity Screening | OSINT Forge" };
import { ModulePage } from "../module-page";

export default function Page() {
  return (
    <ModulePage
      eyebrow="AML Entity Screening"
      title="AML entity screening workspace."
      description="Screen organizations, names, and entity identifiers against connected compliance providers."
      examples={["Entity match", "Risk labels", "Source notes"]}
      locked={true}
    />
  );
}
