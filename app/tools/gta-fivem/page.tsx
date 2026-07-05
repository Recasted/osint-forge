import type { Metadata } from "next";

export const metadata: Metadata = { title: "GTA / FiveM Lookup | OSINT Forge" };
import { ModulePage } from "../module-page";

export default function Page() {
  return (
    <ModulePage
      eyebrow="Gaming OSINT"
      title="GTA / FiveM intelligence workspace."
      description="Collect server, username, Discord, and community footprint leads for GTA and FiveM investigations."
      examples={["Server footprint", "Player handles", "Discord pivots"]}
      locked={true}
    />
  );
}
