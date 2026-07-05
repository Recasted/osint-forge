"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type ToolItem = {
  label: string;
  icon: string;
  href: string;
  locked?: boolean;
};

type ToolGroup = {
  title: string;
  items: ToolItem[];
};

const toolGroups: ToolGroup[] = [
  {
    title: "OSINT Tools",
    items: [
      { label: "People OSINT", icon: "@", href: "/tools/people/" },
      { label: "Network", icon: "#", href: "/tools/domains/" },
      { label: "Handle Search", icon: "HD", href: "/tools/handles/" },
      { label: "Report Export", icon: "EX", href: "/tools/export/" },
    ],
  },
  {
    title: "Gaming & Social",
    items: [
      { label: "Discord OSINT", icon: "DC", href: "/account/", locked: true },
      { label: "Discord History", icon: "DH", href: "/account/", locked: true },
      { label: "Roblox to Discord", icon: "RB", href: "/account/", locked: true },
      { label: "Minecraft Lookup", icon: "MC", href: "/account/", locked: true },
    ],
  },
  {
    title: "Breach Data",
    items: [
      { label: "Machine Viewer", icon: "MV", href: "/account/", locked: true },
      { label: "Stealerlogs", icon: "SL", href: "/account/", locked: true },
      { label: "Universal Search", icon: "US", href: "/tools/people/" },
    ],
  },
  {
    title: "Risk & Identity",
    items: [
      { label: "Email Intelligence", icon: "EM", href: "/tools/people/" },
      { label: "IP Intelligence", icon: "IP", href: "/tools/domains/", locked: true },
      { label: "AML Screening", icon: "AM", href: "/account/", locked: true },
      { label: "Phone Intelligence", icon: "PH", href: "/tools/people/", locked: true },
      { label: "BIN Lookup", icon: "BI", href: "/account/", locked: true },
    ],
  },
];

const mobileTools = [
  { label: "Home", short: "HM", href: "/" },
  { label: "People", short: "PE", href: "/tools/people/" },
  { label: "Domain", short: "DM", href: "/tools/domains/" },
  { label: "Handles", short: "HD", href: "/tools/handles/" },
  { label: "Account", short: "AC", href: "/account/" },
  { label: "Cart", short: "CT", href: "/cart/" },
];

export function ToolSidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="tool-rail" aria-label="OSINT Forge tools">
        <div className="tool-rail-inner">
          <Link href="/" className="tool-rail-brand" aria-label="OSINT Forge home">
            <span>OF</span>
            <strong>OSINT Forge</strong>
          </Link>

          <nav className="tool-menu">
            {toolGroups.map((group) => (
              <section className="tool-menu-group" key={group.title}>
                <div className="tool-menu-heading">
                  <span>{group.title}</span>
                  <span aria-hidden="true">?</span>
                </div>
                <div className="tool-menu-items">
                  {group.items.map((tool) => {
                    const isActive = pathname === tool.href || (tool.href !== "/" && pathname?.startsWith(tool.href));

                    return (
                      <Link
                        key={`${group.title}-${tool.label}`}
                        className={`tool-rail-link${isActive ? " is-active" : ""}`}
                        href={tool.href}
                        title={tool.locked ? `${tool.label} requires an account or plan` : tool.label}
                        aria-label={tool.label}
                      >
                        <span className="tool-rail-icon" aria-hidden="true">{tool.icon}</span>
                        <span className="tool-rail-label">{tool.label}</span>
                        {tool.locked ? <span className="tool-rail-lock" aria-hidden="true">LOCK</span> : null}
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </nav>
        </div>
      </aside>

      <nav className="mobile-tool-rail" aria-label="OSINT Forge tools">
        {mobileTools.map((tool) => (
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