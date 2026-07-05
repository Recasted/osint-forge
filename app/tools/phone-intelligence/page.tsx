import type { Metadata } from "next";

export const metadata: Metadata = { title: "Phone Intelligence | OSINT Forge" };
import { ModulePage } from "../module-page";

export default function Page() {
  return (
    <ModulePage
      eyebrow="Risk & Identity"
      title="Phone intelligence workspace."
      description="Resolve phone numbers into carrier, line type, region, and public identity pivots."
      examples={["Carrier", "Line type", "Linked accounts"]}
      locked={true}
    />
  );
}
