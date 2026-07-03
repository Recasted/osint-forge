import Link from "next/link";

import { InteractiveEffects } from "../interactive-effects";
import { ToolSidebar } from "../tool-sidebar";

type ToolSearchPageProps = {
  title: string;
  eyebrow: string;
  description: string;
  placeholder: string;
  examples: string[];
};

export function ToolSearchPage({
  title,
  eyebrow,
  description,
  placeholder,
  examples,
}: ToolSearchPageProps) {
  return (
    <main className="min-h-screen bg-[#050607] px-4 py-4 pb-24 text-[#f3f4f0] sm:px-8 lg:px-10 xl:pb-5">
      <InteractiveEffects />
      <ToolSidebar />

      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-3 border border-white/10 bg-black/30 px-3 py-3 backdrop-blur sm:px-4">
          <Link href="/" className="flex items-center gap-3" aria-label="OSINT Forge home">
            <span className="grid size-9 place-items-center bg-[#f3f4f0] text-sm font-black text-[#050607]">
              OF
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] sm:text-sm sm:tracking-[0.18em]">
              OSINT Forge
            </span>
          </Link>
          <Link
            href="/tools/export/"
            className="border border-white/20 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition hover:border-white hover:bg-white hover:text-black sm:px-4 sm:text-xs sm:tracking-[0.14em]"
          >
            Export
          </Link>
        </header>

        <section className="py-12 sm:py-20" data-reveal>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#00e0aa] sm:text-xs sm:tracking-[0.2em]">
            {eyebrow}
          </p>
          <h1 className="mt-4 max-w-3xl text-[clamp(2.35rem,12vw,4.4rem)] font-semibold leading-[1.02] tracking-normal text-white">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/62 sm:mt-6 sm:text-base sm:leading-8">
            {description}
          </p>

          <form className="glow-card mt-8 border border-white/12 bg-[#080a0c] p-3 sm:mt-10 sm:p-4">
            <label className="text-xs font-bold uppercase tracking-[0.18em] text-white/42">
              Search input
            </label>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                className="min-h-11 flex-1 border border-white/10 bg-black px-3 font-mono text-xs text-white outline-none transition focus:border-[#00e0aa] sm:min-h-12 sm:px-4 sm:text-sm"
                placeholder={placeholder}
                type="search"
              />
              <button
                className="min-h-11 border border-[#00e0aa]/40 px-5 text-xs font-black uppercase tracking-[0.12em] text-[#00e0aa] transition hover:bg-[#00e0aa] hover:text-black sm:min-h-12 sm:px-6 sm:text-sm sm:tracking-[0.14em]"
                type="button"
              >
                Search
              </button>
            </div>
          </form>

          <div className="mt-8 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3" data-reveal>
            {examples.map((example) => (
              <article key={example} className="glow-card bg-[#050607] p-5">
                <p className="font-mono text-sm text-white/54">{example}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
