"use client";

import { useEffect, useState } from "react";

type ThemeMode = "dark" | "light";

function getSavedTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  return window.localStorage.getItem("osint-forge-theme") === "light" ? "light" : "dark";
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem("osint-forge-theme", theme);
}

export function ThemeControl() {
  const [theme, setTheme] = useState<ThemeMode>(getSavedTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <section className="glow-card border border-white/12 bg-[#080a0c] p-5">
      <p className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#00e0aa]">Appearance</p>
      <h2 className="mt-3 text-xl font-semibold text-white">Theme mode</h2>
      <div className="theme-toggle mt-5" role="group" aria-label="Choose site theme">
        <button className={theme === "dark" ? "is-active" : ""} onClick={() => setTheme("dark")} type="button">
          Dark
        </button>
        <button className={theme === "light" ? "is-active" : ""} onClick={() => setTheme("light")} type="button">
          Light
        </button>
      </div>
    </section>
  );
}
