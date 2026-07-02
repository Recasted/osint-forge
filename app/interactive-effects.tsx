"use client";

import { useEffect } from "react";

export function InteractiveEffects() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    if (reduceMotion.matches) {
      revealTargets.forEach((target) => target.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );

    revealTargets.forEach((target) => observer.observe(target));

    let lastSpark = 0;

    const handlePointerMove = (event: PointerEvent) => {
      document.documentElement.style.setProperty("--cursor-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--cursor-y", `${event.clientY}px`);

      const now = performance.now();
      if (now - lastSpark < 55) {
        return;
      }

      lastSpark = now;
      const spark = document.createElement("span");
      spark.className = "cursor-spark";
      spark.style.left = `${event.clientX}px`;
      spark.style.top = `${event.clientY}px`;
      spark.style.setProperty("--spark-x", `${(Math.random() - 0.5) * 46}px`);
      spark.style.setProperty("--spark-y", `${(Math.random() - 0.5) * 46}px`);
      document.body.appendChild(spark);
      window.setTimeout(() => spark.remove(), 700);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return <div className="cursor-glow" aria-hidden="true" />;
}
