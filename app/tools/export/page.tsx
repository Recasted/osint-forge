import type { Metadata } from "next";

export const metadata: Metadata = { title: "Report Export | OSINT Forge" };
import Link from "next/link";

import { InteractiveEffects } from "../../interactive-effects";
import { ToolSidebar } from "../../tool-sidebar";
import { ExportConsole } from "./export-console";

export default function ExportPage() {
  return (
    <main className="min-h-screen bg-[#050607] px-4 py-4 pb-24 text-[#f3f4f0] sm:px-8 lg:px-10 xl:pb-5">
      <InteractiveEffects />
      <ToolSidebar />

      <div className="mx-auto max-w-6xl">
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
            href="/tools/people/"
            className="border border-white/20 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition hover:border-white hover:bg-white hover:text-black sm:px-4 sm:text-xs sm:tracking-[0.14em]"
          >
            Search
          </Link>
        </header>

        <ExportConsole />
      </div>
    </main>
  );
}

