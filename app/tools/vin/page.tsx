import type { Metadata } from "next";

export const metadata: Metadata = { title: "VIN Lookup | OSINT Forge" };
import { ModulePage } from "../module-page";

export default function Page() {
  return (
    <ModulePage
      eyebrow="Vehicle OSINT"
      title="VIN lookup workspace."
      description="Stage vehicle identifier checks and ownership-adjacent open-source research workflows."
      examples={["VIN normalization", "Market records", "Registration hints"]}
      locked={true}
    />
  );
}
