import { ToolSearchPage } from "../tool-search-page";

export default function HandleSearchPage() {
  return (
    <ToolSearchPage
      title="Handle and profile search."
      eyebrow="Handle OSINT"
      description="Enter usernames or profile URLs to stage social, forum, repository, and alias reuse checks."
      placeholder="@handle, profile URL, username..."
      examples={["Username reuse", "Profile linkage", "Archive checks"]}
      tool="handles"
    />
  );
}