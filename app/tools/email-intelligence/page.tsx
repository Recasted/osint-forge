import type { Metadata } from "next";

export const metadata: Metadata = { title: "Email Intelligence | OSINT Forge" };
import { ModulePage } from "../module-page";

export default function Page() {
  return (
    <ModulePage
      eyebrow="Risk & Identity"
      title="Email intelligence workspace."
      description="Turn an email address into breach, account, domain, and identity footprint leads."
      examples={["Breach hints", "Domain pivot", "Account footprint"]}
      locked={false}
    />
  );
}
