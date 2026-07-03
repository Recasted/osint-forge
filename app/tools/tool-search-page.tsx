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
    <main className="min-h-screen bg-[#050607] px-5 py-5 text-[#f3f4f0] sm:px-8 lg:px-10">
      <InteractiveEffects />
      <ToolSidebar />

      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between border border-white/10 bg-black/30 px-4 py-3 backdrop-blur">
          <Link href="/" className="flex items-center gap-3" aria-label="OSINT Forge home">
            <span className="grid size-9 place-items-center bg-[#f3f4f0] text-sm font-black text-[#050607]">
              OF
            </span>
            <span className="text-sm font-semibold uppercase tracking-[0.18em]">
              OSINT Forge
            </span>
          </Link>
          <Link
            href="/tools/export/"
            className="border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:border-white hover:bg-white hover:text-black"
          >
            Export
          </Link>
        </header>

        <section className="py-20" data-reveal>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00e0aa]">
            {eyebrow}
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-[0.98] tracking-normal text-white sm:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/62">
            {description}
          </p>

          <form className="glow-card mt-10 border border-white/12 bg-[#080a0c] p-4">
            <label className="text-xs font-bold uppercase tracking-[0.18em] text-white/42">
              Search input
            </label>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                className="min-h-12 flex-1 border border-white/10 bg-black px-4 font-mono text-sm text-white outline-none transition focus:border-[#00e0aa]"
                placeholder={placeholder}
                type="search"
              />
              <button
                className="min-h-12 border border-[#00e0aa]/40 px-6 text-sm font-black uppercase tracking-[0.14em] text-[#00e0aa] transition hover:bg-[#00e0aa] hover:text-black"
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
