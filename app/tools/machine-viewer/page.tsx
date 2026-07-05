import type { Metadata } from "next";

export const metadata: Metadata = { title: "Machine Viewer | OSINT Forge" };
import { ModulePage } from "../module-page";

export default function Page() {
  return (
    <ModulePage
      eyebrow="Breach Data"
      title="Machine viewer workspace."
      description="Inspect per-machine breach or stealer-log style archives when authorized provider data is connected."
      examples={["Device profile", "File tree", "Session clues"]}
      locked={true}
    />
  );
}
