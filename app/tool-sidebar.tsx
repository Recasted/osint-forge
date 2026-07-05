"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

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

function getPlanSnapshot() {
  if (typeof window === "undefined") return "free";

  try {
    const raw = window.localStorage.getItem("osint-forge-account");
    if (!raw) return "free";
    return JSON.parse(raw).plan || "free";
  } catch {
    return "free";
  }
}

function subscribeToAccount(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("osint-forge-account", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("osint-forge-account", callback);
  };
}

const toolGroups: ToolGroup[] = [
  {
    title: "OSINT Tools",
    items: [
      { label: "Email OSINT", icon: "EM", href: "/tools/email/" },
      { label: "Network", icon: "NW", href: "/tools/network/" },
      { label: "VIN Lookup", icon: "VN", href: "/tools/vin/", locked: true },
      { label: "GTA / FiveM", icon: "GT", href: "/tools/gta-fivem/", locked: true },
      { label: "TikTok Resolver", icon: "TT", href: "/tools/tiktok-resolver/", locked: true },
      { label: "Instagram Resolver", icon: "IG", href: "/tools/instagram-resolver/", locked: true },
      { label: "TikTok OSINT", icon: "TK", href: "/tools/tiktok-osint/", locked: true },
      { label: "Reverse Lookup", icon: "RL", href: "/tools/reverse-lookup/", locked: true },
    ],
  },
  {
    title: "Gaming & Social",
    items: [
      { label: "Discord OSINT", icon: "DC", href: "/tools/discord/", locked: true },
      { label: "Discord History", icon: "DH", href: "/tools/discord-history/", locked: true },
      { label: "Roblox to Discord", icon: "RB", href: "/tools/roblox-discord/", locked: true },
      { label: "Minecraft Lookup", icon: "MC", href: "/tools/minecraft/", locked: true },
    ],
  },
  {
    title: "Breach Data",
    items: [
      { label: "Machine Viewer", icon: "MV", href: "/tools/machine-viewer/", locked: true },
      { label: "Stealerlogs", icon: "SL", href: "/tools/stealerlogs/", locked: true },
      { label: "Universal Search", icon: "US", href: "/tools/universal-search/" },
    ],
  },
  {
    title: "Risk & Identity",
    items: [
      { label: "Email Intelligence", icon: "EI", href: "/tools/email-intelligence/" },
      { label: "IP Intelligence", icon: "IP", href: "/tools/ip-intelligence/", locked: true },
      { label: "AML Screening", icon: "AM", href: "/tools/aml-screening/", locked: true },
      { label: "AML Entity Screening", icon: "AE", href: "/tools/aml-entity-screening/", locked: true },
      { label: "Phone Intelligence", icon: "PH", href: "/tools/phone-intelligence/", locked: true },
      { label: "BIN Lookup", icon: "BI", href: "/tools/bin-lookup/", locked: true },
    ],
  },
  {
    title: "Core Workspace",
    items: [
      { label: "People OSINT", icon: "PE", href: "/tools/people/" },
      { label: "Handle Search", icon: "HD", href: "/tools/handles/" },
      { label: "Report Export", icon: "EX", href: "/tools/export/" },
    ],
  },
];

const mobileTools = [
  { label: "Home", short: "HM", href: "/" },
  { label: "Email", short: "EM", href: "/tools/email/" },
  { label: "Network", short: "NW", href: "/tools/network/" },
  { label: "Universal", short: "US", href: "/tools/universal-search/" },
  { label: "Account", short: "AC", href: "/account/" },
  { label: "Cart", short: "CT", href: "/cart/" },
];

export function ToolSidebar() {
  const pathname = usePathname();
  const plan = useSyncExternalStore(subscribeToAccount, getPlanSnapshot, () => "free");
  const hasPaidPlan = plan !== "free";

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
                    const showLock = Boolean(tool.locked && !hasPaidPlan);

                    return (
                      <Link
                        key={`${group.title}-${tool.label}`}
                        className={`tool-rail-link${isActive ? " is-active" : ""}`}
                        href={tool.href}
                        title={showLock ? `${tool.label} requires a paid plan` : tool.label}
                        aria-label={tool.label}
                      >
                        <span className="tool-rail-icon" aria-hidden="true">{tool.icon}</span>
                        <span className="tool-rail-label">{tool.label}</span>
                        {showLock ? <span className="tool-rail-lock" aria-hidden="true">LOCK</span> : null}
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
