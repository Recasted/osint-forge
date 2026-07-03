import Link from "next/link";

const tools = [
  { label: "Home", short: "HM", href: "/" },
  { label: "People Search", short: "PE", href: "/tools/people/" },
  { label: "Domain Search", short: "DM", href: "/tools/domains/" },
  { label: "Handle Search", short: "HD", href: "/tools/handles/" },
  { label: "Export Reports", short: "EX", href: "/tools/export/" },
];

export function ToolSidebar() {
  return (
    <>
      <aside className="tool-rail" aria-label="OSINT Forge tools">
        <nav className="tool-rail-inner">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              className="tool-rail-link"
              href={tool.href}
              title={tool.label}
              aria-label={tool.label}
            >
              {tool.short}
            </Link>
          ))}
        </nav>
      </aside>

      <nav className="mobile-tool-rail" aria-label="OSINT Forge tools">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            className="mobile-tool-link"
            href={tool.href}
            title={tool.label}
            aria-label={tool.label}
          >
            <span>{tool.short}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
