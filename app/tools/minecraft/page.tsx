import type { Metadata } from "next";

export const metadata: Metadata = { title: "Minecraft Lookup | OSINT Forge" };
import { ModulePage } from "../module-page";

export default function Page() {
  return (
    <ModulePage
      eyebrow="Gaming OSINT"
      title="Minecraft lookup workspace."
      description="Stage Minecraft UUID, username history, server footprint, and related handle checks."
      examples={["UUID lookup", "Name history", "Server traces"]}
      locked={true}
    />
  );
}
