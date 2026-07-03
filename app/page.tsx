import { InteractiveEffects } from "./interactive-effects";
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

const workflow = [
  "Enter a person, company, domain, handle, IP, wallet, or loose clue.",
  "OSINT Forge enriches, clusters, scores, and flags the highest-value connections.",
  "Analysts review evidence, preserve source material, and export a structured brief.",
];

const plans = [
  { name: "Core", credits: "200", price: "$4.99" },
  { name: "Professional", credits: "450", price: "$14.99" },
  { name: "Enterprise", credits: "1000", price: "$39.99" },
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

const socialLinks = [
  { label: "Telegram Updates", href: "https://t.me/osintforgeupdates" },
  { label: "Community Channel", href: "https://t.me/OsintForgeChat" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050607] text-[#f3f4f0]">
      <InteractiveEffects />
      <ToolSidebar />
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_16%,rgba(64,92,255,0.28),transparent_28%),radial-gradient(circle_at_20%_80%,rgba(0,224,170,0.14),transparent_26%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:44px_44px]" />
        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-10">
          <header className="flex items-center justify-between gap-5 border border-white/10 bg-black/30 px-4 py-3 backdrop-blur">
            <a href="#" className="flex items-center gap-3" aria-label="OSINT Forge home">
              <span className="grid size-9 place-items-center bg-[#f3f4f0] text-sm font-black text-[#050607]">
                OF
              </span>
              <span className="text-sm font-semibold uppercase tracking-[0.18em]">
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
              <a
                className="telegram-nav-link"
                href="https://t.me/osintforgeupdates"
                target="_blank"
                rel="noreferrer"
              >
                Updates
              </a>
              <a
                className="telegram-nav-link"
                href="https://t.me/OsintForgeChat"
                target="_blank"
                rel="noreferrer"
              >
                Chat
              </a>
            </nav>
            <a
              href="#pricing"
              className="border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:border-white hover:bg-white hover:text-black"
            >
              Get Access
            </a>
          </header>

          <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1fr_470px]">
            <div className="lg:pt-4" data-reveal>
              <p className="mb-5 inline-flex border border-[#5f73ff]/50 bg-[#5f73ff]/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#aeb8ff]">
                OSINT intelligence platform
              </p>
              <h1 className="max-w-4xl text-5xl font-semibold leading-[0.98] tracking-normal text-white sm:text-7xl lg:text-8xl">
                Investigate anyone. Map anything. Prove every link.
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-white/62 sm:text-lg">
                Search across open-source signals, resolve hidden relationships,
                preserve evidence, and produce case-ready intelligence reports
                from one focused workspace.
              </p>

              <div className="mt-9 max-w-2xl border border-white/12 bg-[#080a0c] p-3 shadow-2xl shadow-black/40">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex min-h-12 flex-1 items-center border border-white/10 bg-black px-4 font-mono text-sm text-white/44">
                    domain, handle, IP, wallet, person, company...
                  </div>
                  <a
                    href="#capabilities"
                    className="inline-flex min-h-12 items-center justify-center bg-white px-6 text-sm font-black uppercase tracking-[0.14em] text-black transition hover:bg-[#00e0aa]"
                  >
                    Start Search
                  </a>
                </div>
              </div>

              <div className="mt-10 grid max-w-3xl gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-3" data-reveal>
                {stats.map((stat) => (
                  <div key={stat.label} className="glow-card bg-[#07090a] p-5">
                    <p className="text-3xl font-semibold text-white">{stat.value}</p>
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

            <aside className="glow-card border border-white/12 bg-[#07090a]/92 p-4 shadow-2xl shadow-black/50 backdrop-blur" data-reveal>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#00e0aa]">
                    Case Console
                  </p>
                  <h2 className="mt-2 text-xl font-semibold">Target cluster 7A</h2>
                </div>
                <span className="border border-[#00e0aa]/40 px-3 py-1 text-xs font-bold text-[#00e0aa]">
                  Live
                </span>
              </div>

              <div className="mt-5 border border-white/10 bg-black p-4">
                <div className="mb-4 flex items-center justify-between text-xs text-white/42">
                  <span>Relationship graph</span>
                  <span>confidence 91%</span>
                </div>
                <div className="relative h-72 overflow-hidden border border-white/10 bg-[#080d10]">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(0,224,170,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(0,224,170,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
                  <span className="absolute left-[42%] top-[38%] size-16 border border-white/70 bg-white/12" />
                  <span className="absolute left-[15%] top-[16%] size-10 border border-[#00e0aa]/70 bg-[#00e0aa]/12" />
                  <span className="absolute right-[18%] top-[20%] size-12 border border-[#5f73ff]/80 bg-[#5f73ff]/14" />
                  <span className="absolute bottom-[18%] left-[22%] size-12 border border-[#f0b35a]/70 bg-[#f0b35a]/12" />
                  <span className="absolute bottom-[16%] right-[16%] size-9 border border-white/45 bg-white/10" />
                  <span className="absolute left-[21%] top-[26%] h-px w-[210px] rotate-[18deg] bg-white/30" />
                  <span className="absolute right-[24%] top-[34%] h-px w-[154px] rotate-[-22deg] bg-[#5f73ff]/60" />
                  <span className="absolute bottom-[31%] left-[32%] h-px w-[160px] rotate-[-38deg] bg-[#f0b35a]/60" />
                  <span className="absolute bottom-[30%] right-[22%] h-px w-[125px] rotate-[35deg] bg-white/30" />
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {["Alias reuse detected", "Registrant overlap", "Archive evidence sealed"].map(
                  (item, index) => (
                    <div key={item} className="flex items-center justify-between border border-white/10 bg-black px-4 py-3 text-sm">
                      <span className="text-white/68">{item}</span>
                      <span className="font-mono text-xs text-white/38">0{index + 1}</span>
                    </div>
                  ),
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section id="capabilities" className="border-b border-white/10 px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1fr]">
            <div data-reveal>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00e0aa]">
                Capabilities
              </p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
                Built for investigators who need answers, not another tab stack.
              </h2>
            </div>
            <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2" data-reveal>
              {capabilities.map((item) => (
                <article key={item.title} className="glow-card bg-[#080a0c] p-6">
                  <div className="mb-8 h-1 w-16 bg-[#5f73ff]" />
                  <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-white/54">{item.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="border-b border-white/10 bg-[#080a0c] px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00e0aa]" data-reveal>
            Process
          </p>
          <div className="mt-8 grid gap-px overflow-hidden border border-white/10 bg-white/10 lg:grid-cols-3" data-reveal>
            {workflow.map((step, index) => (
              <div key={step} className="glow-card bg-[#050607] p-7">
                <p className="font-mono text-sm text-[#5f73ff]">0{index + 1}</p>
                <p className="mt-8 text-xl leading-8 text-white/78">{step}</p>
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
                <h3 className="text-2xl font-semibold">{plan.name}</h3>
                <p className="mt-6 font-mono text-sm text-white/42">{plan.credits} credits</p>
                <p className="mt-3 flex items-end gap-2 text-5xl font-semibold">
                  {plan.price}
                  <span className="pb-1 text-sm font-bold uppercase tracking-[0.16em] text-white/42">
                    /mo
                  </span>
                </p>
                <a
                  href="#"
                  className="mt-8 inline-flex w-full items-center justify-center border border-white/16 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] transition hover:border-white hover:bg-white hover:text-black"
                >
                  Request Access
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
                      href="#"
                      className="mt-6 inline-flex w-full items-center justify-center border border-white/16 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] transition hover:border-white hover:bg-white hover:text-black"
                    >
                      Buy Credits
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

      <footer id="community" className="relative z-30 border-t border-white/10 bg-[#050607] px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/42">
              Social channels
            </p>
            <p className="mt-2 text-sm text-white/54">
              Follow updates or join the community channel.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="telegram-footer-link"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
