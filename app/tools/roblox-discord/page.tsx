import type { Metadata } from "next";

export const metadata: Metadata = { title: "Roblox to Discord | OSINT Forge" };
import { ModulePage } from "../module-page";

export default function Page() {
  return (
    <ModulePage
      eyebrow="Gaming & Social"
      title="Roblox to Discord workspace."
      description="Connect Roblox usernames and public profile clues to Discord and cross-platform account leads."
      examples={["Roblox profile", "Discord pivots", "Username reuse"]}
      locked={true}
    />
  );
}
