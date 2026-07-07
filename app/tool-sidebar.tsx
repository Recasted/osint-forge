"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

type RequiredPlan = "core" | "professional" | "enterprise";

type ToolItem = {
  label: string;
  icon: string;
  href: string;
  locked?: boolean;
  requiredPlan?: RequiredPlan;
};

type ToolGroup = {
  title: string;
  info: string;
  items: ToolItem[];
};

function normalizeEmailSnapshot(email?: string) {
  return email?.trim().toLowerCase() || "";
}

function stableEmailHashSnapshot(email?: string) {
  let hash = 2166136261;
  const cleanEmail = normalizeEmailSnapshot(email);
  for (let index = 0; index < cleanEmail.length; index += 1) {
    hash ^= cleanEmail.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

function isAdminEmailSnapshot(email?: string) {
  return stableEmailHashSnapshot(email) === "d55b37c";
}
function getPlanSnapshot() {
  if (typeof window === "undefined") return "free";

  try {
    const raw = window.localStorage.getItem("osint-forge-account");
    if (!raw) return "free";
    const account = JSON.parse(raw) as { email?: string; plan?: string };
    if (isAdminEmailSnapshot(account.email)) return "enterprise";
    return account.plan || "free";
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

const planRank: Record<string, number> = { free: 0, core: 1, professional: 2, enterprise: 3 };

const toolGroups: ToolGroup[] = [
  {
    title: "OSINT Tools",
    info: "General lookup modules for emails, network assets, vehicles, social handles, and reverse identifier pivots.",
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
    info: "Social and gaming identity modules for Discord, Roblox, Minecraft, public aliases, and cross-platform links.",
    items: [
      { label: "Discord OSINT", icon: "DC", href: "/tools/discord/", locked: true },
      { label: "Discord History", icon: "DH", href: "/tools/discord-history/", locked: true },
      { label: "Roblox to Discord", icon: "RB", href: "/tools/roblox-discord/", locked: true },
      { label: "Minecraft Lookup", icon: "MC", href: "/tools/minecraft/", locked: true },
    ],
  },
  {
    title: "Breach Data",
    info: "Professional+ exposure modules for breach intelligence, stealer log context, machine views, and broad source searches.",
    items: [
      { label: "Machine Viewer", icon: "MV", href: "/tools/machine-viewer/", locked: true, requiredPlan: "professional" },
      { label: "Stealerlogs", icon: "SL", href: "/tools/stealerlogs/", locked: true, requiredPlan: "professional" },
      { label: "Universal Search", icon: "US", href: "/tools/universal-search/", locked: true, requiredPlan: "professional" },
    ],
  },
  {
    title: "Risk & Identity",
    info: "Risk-focused enrichment for emails, IPs, AML screening, phone numbers, card BIN metadata, and identity checks.",
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
    info: "Main investigation pages for people search, handle search, and exporting reviewed findings into reports.",
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
                <details className="tool-group-info">
                  <summary className="tool-menu-heading">
                    <span>{group.title}</span>
                    <span className="tool-info-mark" aria-label={`${group.title} info`}>?</span>
                  </summary>
                  <p className="tool-info-panel">{group.info}</p>
                </details>
                <div className="tool-menu-items">
                  {group.items.map((tool) => {
                    const isActive = pathname === tool.href || (tool.href !== "/" && pathname?.startsWith(tool.href));
                    const requiredPlan = tool.requiredPlan || "core";
                    const showLock = Boolean(tool.locked && planRank[plan] < planRank[requiredPlan]);
                    const lockLabel = requiredPlan === "professional" ? "PRO+" : "LOCK";

                    return (
                      <Link
                        key={`${group.title}-${tool.label}`}
                        className={`tool-rail-link${isActive ? " is-active" : ""}`}
                        href={tool.href}
                        title={showLock ? `${tool.label} requires ${requiredPlan} or higher` : tool.label}
                        aria-label={tool.label}
                      >
                        <span className="tool-rail-icon" aria-hidden="true">{tool.icon}</span>
                        <span className="tool-rail-label">{tool.label}</span>
                        {showLock ? <span className="tool-rail-lock" aria-hidden="true">{lockLabel}</span> : null}
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
