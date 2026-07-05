import type { Metadata } from "next";

export const metadata: Metadata = { title: "Instagram Resolver | OSINT Forge" };
import { ModulePage } from "../module-page";

export default function Page() {
  return (
    <ModulePage
      eyebrow="Social OSINT"
      title="Instagram resolver workspace."
      description="Stage Instagram profile checks, public link pivots, and username reuse investigation."
      examples={["Profile checks", "Bio links", "Handle reuse"]}
      locked={true}
    />
  );
}
