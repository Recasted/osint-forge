import type { PlanId } from "./lib/account-store";
import { AccountAccessButton } from "./account-access-button";
import { CurrentPlanBadge } from "./current-plan-badge";
import { InteractiveEffects } from "./interactive-effects";
import { SiteFooter } from "./site-footer";
import { ToolSidebar } from "./tool-sidebar";

const stats = [
  { value: "2,000+", label: "Open-source sources" },
  { value: "600B+", label: "Records indexed" },
  { value: "96%", label: "Evidence confidence scoring" },
];

const poweredBy = [
  { name: "OsintCat", href: "https://www.osintcat.net/" },
  { name: "OSINT Solutions", href: "https://osintsolutions.org/home" },
  { name: "Have I Been Pwned", href: "https://haveibeenpwned.com/" },
];

const previewRows = [
  { label: "Identity profile", result: "resolved" },
  { label: "Alias history", result: "6 aliases" },
  { label: "Handle matches", result: "12 accounts" },
  { label: "Email intel", result: "4 emails" },
  { label: "Breach corpus", result: "11 breaches" },
  { label: "Intel archives", result: "2 records" },
  { label: "Source graph", result: "18 links" },
];

const capabilities = [
  {
    title: "Identity Resolution",
    copy: "Correlate names, aliases, domains, handles, wallets, records, and infrastructure into one defensible entity view.",
  },
  {
    title: "Threat Surface Mapping",
    copy: "Turn scattered public signals into relationship graphs, exposure maps, source trails, and prioritized leads.",
  },
  {
    title: "Evidence Preservation",
    copy: "Capture screenshots, timestamps, hashes, source URLs, and analyst notes with exportable case context.",
  },
  {
    title: "Brief Generation",
    copy: "Move from investigation workspace to clean intelligence summaries for teams, clients, and decision-makers.",
  },
];

const modules = [
  {
    short: "PE",
    title: "People Intelligence",
    copy: "Resolve emails, aliases, phone fragments, and public exposure into a clean identity lead set.",
    href: "/tools/people/",
    tags: ["Email footprint", "Breach hints", "Alias clustering"],
    preview: "alex.mercer@example.com",
    stat: "5 free searches",
  },
  {
    short: "DM",
    title: "Domain Analysis",
    copy: "Map DNS records, infrastructure clues, nameservers, and ownership pivots from one domain input.",
    href: "/tools/domains/",
    tags: ["DNS records", "Infrastructure", "Linked assets"],
    preview: "osintforge.dev",
    stat: "Live DNS checks",
  },
  {
    short: "HD",
    title: "Handle Footprint",
    copy: "Trace usernames across public profile surfaces and spot reuse patterns before you pivot deeper.",
    href: "/tools/handles/",
    tags: ["Profile reuse", "Social checks", "Archive leads"],
    preview: "nightcrawler_99",
    stat: "Cross-platform",
  },
  {
    short: "EX",
    title: "Evidence Export",
    copy: "Package reviewed signals into a terminal-style brief with notes, source labels, and next actions.",
    href: "/tools/export/",
    tags: ["TXT export", "DOC export", "Case notes"],
    preview: "brief-ready.json",
    stat: "5 credits/export",
  },
];
const workflow = [
  "Enter a person, company, domain, handle, IP, wallet, or loose clue.",
  "OSINT Forge enriches, clusters, scores, and flags the highest-value connections.",
  "Analysts review evidence, preserve source material, and export a structured brief.",
];

const plans: { id: PlanId; name: string; credits: string; price: string; tier: string }[] = [
  { id: "core", name: "Core", credits: "200", price: "$4.99", tier: "tier-core" },
  { id: "professional", name: "Professional", credits: "450", price: "$14.99", tier: "tier-professional" },
  { id: "enterprise", name: "Enterprise", credits: "1000", price: "$39.99", tier: "tier-enterprise" },
];

const creditPacks = [
  { name: "Extra 50", credits: "50", price: "$5" },
  { name: "Extra 200", credits: "200", price: "$20" },
  { name: "Extra 1000", credits: "1000", price: "$100" },
];

const faqs = [
  {
    question: "What is OSINT Forge?",
    answer:
      "OSINT Forge is an all-in-one Open Source Intelligence (OSINT) platform that helps investigators search, correlate, and analyze publicly available information from multiple sources in a single workspace. Build intelligence reports, map relationships, and export findings without switching between dozens of different tools.",
  },
  {
    question: "Is the information private or hacked?",
    answer:
      "No. OSINT Forge is designed to work with publicly available information and authorized data providers. We do not promote or support unauthorized access to private systems or confidential data. Results depend on the sources available at the time of your search.",
  },
  {
    question: "How do credits work?",
    answer:
      "Every search consumes investigation credits based on the tools and data sources used. More advanced searches require more credits than basic lookups. Unused subscription credits refresh with each billing cycle, and additional credit packs can be purchased at any time. All prices are shown excluding applicable taxes.",
  },
];


export default function Home() {
  return (
    <main className="min-h-screen bg-[#050607] pb-20 text-[#f3f4f0] xl:pb-0">
      <InteractiveEffects />
      <ToolSidebar />
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_16%,rgba(64,92,255,0.28),transparent_28%),radial-gradient(circle_at_20%_80%,rgba(0,224,170,0.14),transparent_26%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:44px_44px]" />
        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-3 py-4 sm:px-8 lg:px-10">
          <header className="flex items-center justify-between gap-3 border border-white/10 bg-black/30 px-3 py-3 backdrop-blur sm:gap-5 sm:px-4">
            <a href="#" className="flex items-center gap-3" aria-label="OSINT Forge home">
              <span className="grid size-9 place-items-center bg-[#f3f4f0] text-sm font-black text-[#050607]">
                OF
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] sm:text-sm sm:tracking-[0.18em]">
                OSINT Forge
              </span>
            </a>
            <nav className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-[0.16em] text-white/56 md:flex">
              <a className="transition hover:text-white" href="#capabilities">
                Capabilities
              </a>
              <a className="transition hover:text-white" href="#workflow">
                Process
              </a>
              <a className="transition hover:text-white" href="#pricing">
                Pricing
              </a>
              <a className="transition hover:text-white" href="#faq">
                FAQ
              </a>
              <a className="transition hover:text-white" href="#community">
                Community
              </a>
            </nav>
            <AccountAccessButton />
          </header>

          <div className="grid min-w-0 flex-1 items-start gap-7 py-7 sm:gap-8 sm:py-12 lg:grid-cols-[minmax(0,1fr)_470px] lg:gap-12">
            <div className="min-w-0 lg:pt-4" data-reveal>
              <p className="mb-4 inline-flex border border-[#5f73ff]/50 bg-[#5f73ff]/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#aeb8ff] sm:mb-5 sm:text-xs sm:tracking-[0.2em]">
                OSINT intelligence platform
              </p>
              <h1 className="max-w-4xl text-[clamp(2rem,10.5vw,4.6rem)] font-semibold leading-[1.04] tracking-normal text-white sm:leading-[1.02] lg:text-8xl">
                Investigate anyone. Map anything. Prove every link.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/62 sm:mt-7 sm:text-lg sm:leading-8">
                Search across open-source signals, resolve hidden relationships,
                preserve evidence, and produce case-ready intelligence reports
                from one focused workspace.
              </p>

              <div className="mt-6 max-w-2xl border border-white/12 bg-[#080a0c] p-2 shadow-2xl shadow-black/40 sm:mt-9 sm:p-3">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex min-h-11 flex-1 items-center border border-white/10 bg-black px-3 font-mono text-xs text-white/44 sm:min-h-12 sm:px-4 sm:text-sm">
                    domain, handle, IP, wallet, person, company...
                  </div>
                  <a
                    href="#capabilities"
                    className="inline-flex min-h-11 items-center justify-center bg-white px-5 text-xs font-black uppercase tracking-[0.12em] text-black transition hover:bg-[#00e0aa] sm:min-h-12 sm:px-6 sm:text-sm sm:tracking-[0.14em]"
                  >
                    Create Account
                  </a>
                </div>
              </div>

              <div className="mt-7 grid max-w-3xl gap-px overflow-hidden border border-white/10 bg-white/10 sm:mt-10 sm:grid-cols-3" data-reveal>
                {stats.map((stat) => (
                  <div key={stat.label} className="glow-card bg-[#07090a] p-4 sm:p-5">
                    <p className="text-2xl font-semibold text-white sm:text-3xl">{stat.value}</p>
                    <p className="mt-2 text-xs uppercase leading-5 tracking-[0.14em] text-white/46">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 max-w-3xl" data-reveal>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-white/42">
                  Powered by
                </p>
                <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-3">
                  {poweredBy.map((source) => (
                    <a
                      key={source.name}
                      href={source.href}
                      target="_blank"
                      rel="noreferrer"
                      className="glow-card block bg-[#07090a] p-4 transition"
                    >
                      <p className="text-sm font-bold uppercase tracking-[0.14em] text-white">
                        {source.name}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <aside className="glow-card search-preview min-w-0 border border-white/12 bg-[#07090a]/92 p-3 shadow-2xl shadow-black/50 backdrop-blur sm:p-4 lg:mt-28" data-reveal>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#00e0aa]">
                    Live Preview
                  </p>
                  <h2 className="mt-2 text-lg font-semibold sm:text-xl">OSINT Forge search</h2>
                </div>
                <span className="border border-[#00e0aa]/40 px-3 py-1 text-xs font-bold text-[#00e0aa]">
                  548ms
                </span>
              </div>

              <div className="mt-4 border border-white/10 bg-black p-3 font-mono sm:mt-5 sm:p-4">
                <div className="flex items-center gap-2 text-xs text-white/42">
                  <span className="size-2 bg-[#f0b35a]" />
                  <span className="size-2 bg-white/18" />
                  <span className="size-2 bg-white/18" />
                  <span className="ml-3">osintforge - correlation engine</span>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 border-b border-[#f0b35a]/70 pb-3 text-sm sm:gap-4">
                  <p className="min-w-0 truncate text-white">
                    <span className="text-[#f0b35a]">&gt;</span> search{" "}
                    <span className="text-[#f0b35a]">person</span>{" "}
                    <span className="text-white/90">alex.mercer@example.com</span>
                    <span className="terminal-cursor" />
                  </p>
                  <span className="status-badge shrink-0 border border-[#f0b35a]/50 bg-[#f0b35a]/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#f0b35a]">
                    <span className="status-running">Running</span>
                    <span className="status-complete">Complete</span>
                  </span>
                </div>

                <div className="search-progress mt-0 h-0.5 bg-[#f0b35a]" />

                <div className="mt-4 grid gap-3">
                  {previewRows.map((row, index) => (
                    <div
                      key={row.label}
                      className="preview-row flex items-center justify-between gap-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid size-6 shrink-0 place-items-center border border-white/38 text-[10px] text-[#f0b35a]">
                          {index + 1}
                        </span>
                        <span className="truncate text-sm font-bold text-white/86">
                          {row.label}
                        </span>
                      </div>
                      <div className="preview-row-result flex shrink-0 items-center gap-3 text-xs text-white/42">
                        <span className="text-[#f0b35a]">ok</span>
                        <span>{row.result}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="correlated-card mt-5 border border-[#ff6a4a]/70 bg-[#241615]/80 p-4">
                  <div className="mb-4 flex items-center justify-between border-b border-white/12 pb-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/58">
                      Correlated profile
                    </p>
                    <span className="border border-white/14 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/46">
                      Risk 10
                    </span>
                  </div>
                  <div className="grid gap-3 text-xs text-white/42">
                    <div className="preview-result-line grid grid-cols-[1fr_1fr_auto] gap-3">
                      <span>matched user</span>
                      <span>ak_sentry</span>
                      <span>high</span>
                    </div>
                    <div className="preview-result-line grid grid-cols-[1fr_1fr_auto] gap-3">
                      <span>breach overlap</span>
                      <span>11 sources</span>
                      <span>sealed</span>
                    </div>
                    <div className="preview-result-line grid grid-cols-[1fr_1fr_auto] gap-3">
                      <span>export status</span>
                      <span>brief ready</span>
                      <span>docx</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section id="capabilities" className="border-b border-white/10 px-3 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1fr]">
            <div data-reveal>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#00e0aa] sm:text-xs sm:tracking-[0.2em]">
                Capabilities
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">
                Built for investigators who need answers, not another tab stack.
              </h2>
            </div>
            <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2" data-reveal>
              {capabilities.map((item) => (
                <article key={item.title} className="glow-card bg-[#080a0c] p-4 sm:p-6">
                  <div className="mb-5 h-1 w-14 bg-[#5f73ff] sm:mb-8 sm:w-16" />
                  <h3 className="text-lg font-semibold text-white sm:text-xl">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/54 sm:mt-4 sm:leading-7">{item.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="modules" className="module-showcase border-b border-white/10 bg-[#050607] px-3 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end" data-reveal>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#00e0aa] sm:text-xs sm:tracking-[0.2em]">
                Module tools
              </p>
              <h2 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">
                One command surface. Specialist modules underneath.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-white/54">
              Each tool shows what it checks, how it spends searches, and what kind of evidence comes back before you run the next pivot.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]" data-reveal>
            <aside className="module-terminal overflow-hidden border border-[#00e0aa]/20 bg-black/80 p-5 shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 font-mono text-xs text-white/42">
                  <span className="size-2 bg-[#00e0aa]" />
                  <span className="size-2 bg-[#f0b35a]" />
                  <span className="size-2 bg-white/22" />
                  <span className="ml-3">module-router</span>
                </div>
                <span className="border border-[#00e0aa]/30 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#00e0aa]">
                  Online
                </span>
              </div>
              <div className="mt-5 grid gap-3 font-mono text-xs text-white/54 sm:text-sm">
                <p><span className="text-[#00e0aa]">$</span> route input --target email --module people</p>
                <p><span className="text-[#f0b35a]">01</span> checking account footprint <span className="float-right text-[#00e0aa]">ready</span></p>
                <p><span className="text-[#f0b35a]">02</span> collecting source labels <span className="float-right text-[#00e0aa]">ready</span></p>
                <p><span className="text-[#f0b35a]">03</span> preserving report context <span className="float-right text-[#00e0aa]">ready</span></p>
              </div>
              <div className="module-scan mt-6 h-1 bg-[#00e0aa]" />
              <div className="mt-6 flex flex-wrap gap-2">
                {["Account required", "5 free searches", "Provider keys server-side", "Export ready"].map((item) => (
                  <span key={item} className="border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-[11px] text-white/52">
                    {item}
                  </span>
                ))}
              </div>
            </aside>

            <aside className="module-graph relative min-h-[280px] overflow-hidden border border-white/10 bg-[#071014] p-5">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:36px_36px]" />
              <div className="relative flex h-full min-h-[240px] items-center justify-center">
                <span className="graph-node graph-node-main">OF</span>
                <span className="graph-node graph-node-a">PE</span>
                <span className="graph-node graph-node-b">DM</span>
                <span className="graph-node graph-node-c">HD</span>
                <span className="graph-node graph-node-d">EX</span>
                <span className="graph-line graph-line-a" />
                <span className="graph-line graph-line-b" />
                <span className="graph-line graph-line-c" />
                <span className="graph-line graph-line-d" />
              </div>
            </aside>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4" data-reveal>
            {modules.map((module) => (
              <a key={module.title} href={module.href} className="module-card glow-card group border border-white/10 bg-[#080a0c] p-5">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <span className="grid size-11 place-items-center border border-[#00e0aa]/35 bg-[#00e0aa]/10 font-mono text-xs font-black text-[#00e0aa]">
                    {module.short}
                  </span>
                  <span className="border border-white/12 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/42">
                    {module.stat}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-white">{module.title}</h3>
                <p className="mt-4 min-h-[84px] text-sm leading-7 text-white/54">{module.copy}</p>
                <div className="mt-5 border border-white/10 bg-black/30 p-3 font-mono text-[11px] text-white/46 transition group-hover:border-[#00e0aa]/30 group-hover:text-[#9fffe7]">
                  &gt; {module.preview}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {module.tags.map((tag) => (
                    <span key={tag} className="border border-white/10 bg-black/24 px-2.5 py-1.5 font-mono text-[10px] text-white/42">
                      {tag}
                    </span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
      <section id="workflow" className="border-b border-white/10 bg-[#080a0c] px-3 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#00e0aa] sm:text-xs sm:tracking-[0.2em]" data-reveal>
            Process
          </p>
          <div className="mt-8 grid gap-px overflow-hidden border border-white/10 bg-white/10 lg:grid-cols-3" data-reveal>
            {workflow.map((step, index) => (
              <div key={step} className="glow-card bg-[#050607] p-4 sm:p-7">
                <p className="font-mono text-sm text-[#5f73ff]">0{index + 1}</p>
                <p className="mt-5 text-base leading-7 text-white/78 sm:mt-8 sm:text-xl sm:leading-8">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end" data-reveal>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00e0aa]">
                Access
              </p>
              <h2 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
                Credit-based intelligence for solo analysts and teams.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-white/52">
              All subscription plans and credit purchases are priced excluding
              applicable taxes. Final taxes are calculated during checkout based
              on your billing location.
            </p>
          </div>

          <div className="mt-10 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3" data-reveal>
            {plans.map((plan) => (
              <article key={plan.name} className="glow-card bg-[#080a0c] p-6">
                <h3 className={`subscription-rank ${plan.tier} text-2xl font-semibold`} data-rank={plan.name}>
                  <span>{plan.name}</span><CurrentPlanBadge plan={plan.id} />
                  <i aria-hidden="true" />
                  <i aria-hidden="true" />
                  <i aria-hidden="true" />
                  <i aria-hidden="true" />
                  <i aria-hidden="true" />
                  <i aria-hidden="true" />
                </h3>
                <p className="mt-6 font-mono text-sm text-white/42">{plan.credits} credits</p>
                <p className="mt-3 flex items-end gap-2 text-5xl font-semibold">
                  {plan.price}
                  <span className="pb-1 text-sm font-bold uppercase tracking-[0.16em] text-white/42">
                    /mo
                  </span>
                </p>
                <a
                  href={`/cart/?plan=${plan.name.toLowerCase()}`} className="mt-8 inline-flex w-full items-center justify-center border border-white/16 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] transition hover:border-white hover:bg-white hover:text-black"
                >
                  Add to Cart
                </a>
              </article>
            ))}
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1fr]" data-reveal>
            <aside className="glow-card border border-[#00e0aa]/40 bg-[#00e0aa]/10 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00e0aa]">
                Credit rules
              </p>
              <div className="mt-6 space-y-4 text-sm leading-7 text-white/70">
                <p>1 credit per search.</p>
                <p>5 credits per export.</p>
                <p>
                  Extra credits can only be purchased from an active account. An
                  account requires an active subscription plan.
                </p>
              </div>
            </aside>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00e0aa]">
                Add-on credits
              </p>
              <div className="mt-5 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3">
                {creditPacks.map((pack) => (
                  <article key={pack.name} className="glow-card bg-[#050607] p-5">
                    <h3 className="text-xl font-semibold">{pack.name}</h3>
                    <p className="mt-5 font-mono text-sm text-white/42">
                      {pack.credits} extra credits
                    </p>
                    <p className="mt-3 text-4xl font-semibold">{pack.price}</p>
                    <a
                      href={`/cart/?pack=extra-${pack.credits}`} className="mt-6 inline-flex w-full items-center justify-center border border-white/16 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] transition hover:border-white hover:bg-white hover:text-black"
                    >
                      Add Credits
                    </a>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="border-t border-white/10 bg-[#080a0c] px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.75fr_1fr]">
          <div data-reveal>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00e0aa]">
              FAQ
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              Knowledge Base.
            </h2>
          </div>

          <div className="space-y-3" data-reveal>
            {faqs.map((faq) => (
              <details key={faq.question} className="glow-card group border border-white/10 bg-[#050607] p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-lg font-semibold text-white">
                  <span>{faq.question}</span>
                  <span className="grid size-9 shrink-0 place-items-center border border-white/16 font-mono text-sm text-[#00e0aa] transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-5 border-t border-white/10 pt-5 text-sm leading-7 text-white/54">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}






