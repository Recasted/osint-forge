import type { Metadata } from "next";

export const metadata: Metadata = { title: "TikTok OSINT | OSINT Forge" };
import { ModulePage } from "../module-page";

export default function Page() {
  return (
    <ModulePage
      eyebrow="TikTok OSINT"
      title="TikTok OSINT workspace."
      description="Investigate TikTok identities, public posts, profile metadata, and related account traces."
      examples={["Creator footprint", "Public posts", "Related handles"]}
      locked={true}
    />
  );
}
