import type { Metadata } from "next";

export const metadata: Metadata = { title: "People OSINT | OSINT Forge" };
import { ToolSearchPage } from "../tool-search-page";

export default function PeopleSearchPage() {
  return (
    <ToolSearchPage
      title="People search workspace."
      eyebrow="People OSINT"
      description="Type a name, alias, email, phone, or fragment to start a people-focused investigation workflow."
      placeholder="name, alias, email, phone..."
      examples={["Alias clustering", "Email exposure", "Public record hints"]}
      tool="people"
    />
  );
}
