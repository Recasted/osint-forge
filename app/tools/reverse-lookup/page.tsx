import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reverse Lookup | OSINT Forge" };
import { ModulePage } from "../module-page";

export default function Page() {
  return (
    <ModulePage
      eyebrow="Reverse Lookup"
      title="Reverse lookup workspace."
      description="Reverse-search loose identifiers and turn fragments into higher-confidence investigative leads."
      examples={["Phone fragments", "Email fragments", "Username traces"]}
      locked={true}
    />
  );
}
