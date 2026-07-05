import type { Metadata } from "next";

export const metadata: Metadata = { title: "TikTok Resolver | OSINT Forge" };
import { ModulePage } from "../module-page";

export default function Page() {
  return (
    <ModulePage
      eyebrow="Social OSINT"
      title="TikTok resolver workspace."
      description="Resolve TikTok handles into public profile signals, reused usernames, and cross-platform leads."
      examples={["Profile metadata", "Username reuse", "Public links"]}
      locked={true}
    />
  );
}
