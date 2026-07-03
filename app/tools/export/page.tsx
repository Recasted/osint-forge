import Link from "next/link";

import { InteractiveEffects } from "../../interactive-effects";
import { ToolSidebar } from "../../tool-sidebar";
import { ExportConsole } from "./export-console";

export default function ExportPage() {
  return (
    <main className="min-h-screen bg-[#050607] px-5 py-5 text-[#f3f4f0] sm:px-8 lg:px-10">
      <InteractiveEffects />
      <ToolSidebar />

      <div className="mx-auto max-w-6xl">
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
            href="/tools/people/"
            className="border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:border-white hover:bg-white hover:text-black"
          >
            Search
          </Link>
        </header>

        <ExportConsole />
      </div>
    </main>
  );
}
