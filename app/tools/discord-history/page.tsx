import type { Metadata } from "next";

export const metadata: Metadata = { title: "Discord History | OSINT Forge" };
import { ModulePage } from "../module-page";

export default function Page() {
  return (
    <ModulePage
      eyebrow="Discord History"
      title="Discord history workspace."
      description="Review Discord identity history, known aliases, and timeline signals when provider data is connected."
      examples={["Alias history", "Timeline clues", "Server overlap"]}
      locked={true}
    />
  );
}
