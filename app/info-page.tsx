import Link from "next/link";
import { ReactNode } from "react";

import { InteractiveEffects } from "./interactive-effects";
import { SiteFooter } from "./site-footer";
import { ToolSidebar } from "./tool-sidebar";

type InfoSection = {
  title: string;
  body: ReactNode;
};

type InfoPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  sections: InfoSection[];
  children?: ReactNode;
};

export function InfoPage({ eyebrow, title, description, sections, children }: InfoPageProps) {
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
            <Link href="/account/" className="border border-white/20 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition hover:border-white hover:bg-white hover:text-black sm:px-4 sm:text-xs sm:tracking-[0.14em]">
              Account
            </Link>
          </header>

          <section className="py-14 sm:py-20" data-reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#00e0aa] sm:text-xs sm:tracking-[0.22em]">{eyebrow}</p>
            <h1 className="mt-4 max-w-4xl text-[clamp(2.4rem,10vw,5rem)] font-semibold leading-[1.02] tracking-normal text-white">{title}</h1>
            <p className="mt-6 max-w-3xl text-sm leading-7 text-white/62 sm:text-base sm:leading-8">{description}</p>
          </section>

          {children}

          <section className="grid gap-px overflow-hidden border border-white/10 bg-white/10" data-reveal>
            {sections.map((section) => (
              <article id={section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")} key={section.title} className="legal-card bg-[#080a0c] p-5 sm:p-7">
                <h2 className="text-2xl font-semibold text-white">{section.title}</h2>
                <div className="mt-4 text-sm leading-7 text-white/58">{section.body}</div>
              </article>
            ))}
          </section>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

