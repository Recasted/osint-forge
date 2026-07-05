import type { Metadata } from "next";

export const metadata: Metadata = { title: "Discord OSINT | OSINT Forge" };
import { ModulePage } from "../module-page";

export default function Page() {
  return (
    <ModulePage
      eyebrow="Discord OSINT"
      title="Discord OSINT workspace."
      description="Resolve Discord IDs, usernames, linked accounts, and community history into identity leads."
      examples={["Discord ID", "Server history", "Linked accounts"]}
      locked={true}
    />
  );
}
