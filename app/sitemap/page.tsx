import type { Metadata } from "next";
import Link from "next/link";

import { InteractiveEffects } from "../interactive-effects";
import { SiteFooter } from "../site-footer";
import { ToolSidebar } from "../tool-sidebar";

export const metadata: Metadata = { title: "Sitemap | OSINT Forge" };

const groups = [
  {
    title: "Core Pages",
    count: "5",
    icon: "HM",
    links: [
      { label: "Home", href: "/", copy: "Platform overview, features, workflow, and pricing." },
      { label: "Pricing", href: "/#pricing", copy: "Subscription tiers, credits, and add-on packs." },
      { label: "FAQ", href: "/faq/", copy: "Answers about accounts, credits, billing, and APIs." },
      { label: "Contact", href: "/contact/", copy: "Get in touch with the OSINT Forge team." },
      { label: "Support Portal", href: "/support/", copy: "Support notes, documentation, and request guidance." },
    ],
  },
  {
    title: "Account & Auth",
    count: "3",
    icon: "AC",
    links: [
      { label: "Account", href: "/account/", copy: "Dashboard, credits, plan rank, and module access." },
      { label: "Cart", href: "/cart/", copy: "Plan checkout shell and credit packs." },
      { label: "Create Free Account", href: "/account/", copy: "Create an account and get 5 monthly searches." },
    ],
  },
  {
    title: "Documentation & API",
    count: "3",
    icon: "API",
    links: [
      { label: "Support Docs", href: "/support/#documentation", copy: "Frontend, Worker, D1, and provider key setup notes." },
      { label: "API Health", href: "https://api.osintforge.dev/api/health", copy: "Live Cloudflare Worker health endpoint." },
      { label: "Legal Center", href: "/legal/", copy: "Usage rules, data removal, and policy links." },
    ],
  },
];

const modules = [
  [
    { label: "Email OSINT", href: "/tools/email/", copy: "Email footprint and breach lookup." },
    { label: "Network", href: "/tools/network/", copy: "IP geolocation and DNS records." },
    { label: "VIN Lookup", href: "/tools/vin/", copy: "Vehicle history and specifications." },
    { label: "GTA / FiveM", href: "/tools/gta-fivem/", copy: "Game server intelligence workspace." },
  ],
  [
    { label: "TikTok Resolver", href: "/tools/tiktok-resolver/", copy: "Resolve public share links to profiles." },
    { label: "Instagram Resolver", href: "/tools/instagram-resolver/", copy: "Public profile and share-link resolution." },
    { label: "TikTok OSINT", href: "/tools/tiktok-osint/", copy: "TikTok account and footprint checks." },
    { label: "Reverse Lookup", href: "/tools/reverse-lookup/", copy: "Cross-site social footprint scan." },
  ],
  [
    { label: "Discord OSINT", href: "/tools/discord/", copy: "User IDs, links, and social pivots." },
    { label: "Discord History", href: "/tools/discord-history/", copy: "Username and display-name history module." },
    { label: "Roblox to Discord", href: "/tools/roblox-discord/", copy: "Roblox and Discord relationship workspace." },
    { label: "Minecraft Lookup", href: "/tools/minecraft/", copy: "UUID, skin, and username history." },
  ],
  [
    { label: "Machine Viewer", href: "/tools/machine-viewer/", copy: "Machine-level stealer log workspace." },
    { label: "Stealerlogs", href: "/tools/stealerlogs/", copy: "URL, login, and password database search shell." },
    { label: "Universal Search", href: "/tools/universal-search/", copy: "Parallel multi-source investigation starter." },
    { label: "Email Intelligence", href: "/tools/email-intelligence/", copy: "Risk score, breach history, and linked accounts." },
  ],
  [
    { label: "IP Intelligence", href: "/tools/ip-intelligence/", copy: "ISP, proxy, VPN, and Tor checks." },
    { label: "AML Screening", href: "/tools/aml-screening/", copy: "Sanctions, PEP, and watchlist screening." },
    { label: "AML Entity Screening", href: "/tools/aml-entity-screening/", copy: "Company and organization screening." },
    { label: "Phone Intelligence", href: "/tools/phone-intelligence/", copy: "Carrier, line type, and linked accounts." },
  ],
  [
    { label: "People OSINT", href: "/tools/people/", copy: "People-focused identity workflow." },
    { label: "Handle Search", href: "/tools/handles/", copy: "Username reuse and public profile checks." },
    { label: "Report Export", href: "/tools/export/", copy: "Build downloadable investigation notes." },
    { label: "BIN Lookup", href: "/tools/bin-lookup/", copy: "Card BIN intelligence workspace." },
  ],
];

export default function SitemapPage() {
  return (
    <main className="min-h-screen bg-[#050607] text-[#f3f4f0]">
      <InteractiveEffects />
      <ToolSidebar />
      <section className="px-4 py-4 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <header className="flex items-center justify-between gap-3 border border-white/10 bg-black/30 px-3 py-3 backdrop-blur sm:px-4">
            <Link href="/" className="flex items-center gap-3" aria-label="OSINT Forge home">
              <span className="grid size-9 place-items-center bg-[#f3f4f0] text-sm font-black text-[#050607]">OF</span>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] sm:text-sm sm:tracking-[0.18em]">OSINT Forge</span>
            </Link>
            <Link href="/account/" className="border border-white/20 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition hover:border-white hover:bg-white hover:text-black sm:px-4 sm:text-xs sm:tracking-[0.14em]">Account</Link>
          </header>

          <section className="py-14 sm:py-20" data-reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#00e0aa] sm:text-xs sm:tracking-[0.22em]">Sitemap</p>
            <h1 className="mt-4 max-w-4xl text-[clamp(2.4rem,10vw,5rem)] font-semibold leading-[1.02] tracking-normal text-white">Every page and module.</h1>
            <p className="mt-6 max-w-3xl text-sm leading-7 text-white/62 sm:text-base sm:leading-8">A structured map of OSINT Forge pages, account routes, documentation points, and intelligence modules.</p>
          </section>

          <section className="grid gap-5 lg:grid-cols-3" data-reveal>
            {groups.map((group) => (
              <article key={group.title} className="sitemap-card">
                <header>
                  <span>{group.icon}</span>
                  <h2>{group.title}</h2>
                  <small>{group.count}</small>
                </header>
                <div className="sitemap-list">
                  {group.links.map((link) => (
                    <Link key={link.label} href={link.href}>
                      <strong>{link.label}</strong>
                      <p>{link.copy}</p>
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </section>

          <section className="sitemap-card mt-5" data-reveal>
            <header>
              <span>IN</span>
              <h2>Intelligence Modules</h2>
              <small>25+</small>
            </header>
            <div className="sitemap-module-grid">
              {modules.flat().map((module) => (
                <Link key={module.href} href={module.href}>
                  <strong>{module.label}</strong>
                  <p>{module.copy}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

