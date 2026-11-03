"use client";

import { useEffect } from "react";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const VISIBLE: Keyframe = { opacity: 1, transform: "none", clipPath: "inset(0 0 0 0)" };
const FROM: Record<string, Keyframe> = {
  up: { opacity: 0, transform: "translateY(40px)" },
  left: { opacity: 0, transform: "translateX(-48px)" },
  right: { opacity: 0, transform: "translateX(48px)" },
  zoom: { opacity: 0, transform: "scale(0.94)" },
  clip: { opacity: 1, clipPath: "inset(0 100% 0 0)" },
  fade: { opacity: 0 },
};

/**
 * Reveals elements marked with `data-reveal` when they scroll into view.
 * Mounted once in the site layout; watches the DOM so elements added later
 * (route changes, tab switches) are picked up too.
 *
 * It never writes attributes or classes onto the watched elements — that would
 * break React hydration for parts of the page that hydrate after this runs.
 * Animations are played with the Web Animations API (`fill: "forwards"`) instead.
 * Content stays visible without JS: the initial hidden state only applies under `html.reveal-ready`.
 */
export function RevealObserver() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    const watched = new WeakSet<Element>();

    const reveal = (el: HTMLElement) => {
      const delay = parseFloat(getComputedStyle(el).getPropertyValue("--d")) || 0;
      const from = FROM[el.dataset.reveal ?? "up"] ?? FROM.up;
      el.animate([from, VISIBLE], { duration: 1100, delay, easing: EASE, fill: "forwards" });
      el.querySelectorAll(".reveal-img").forEach((img) =>
        img.animate([{ transform: "scale(1.15)" }, { transform: "scale(1)" }], { duration: 1800, delay, easing: EASE, fill: "forwards" }),
      );
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io.unobserve(e.target);
          reveal(e.target as HTMLElement);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    const scan = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        if (watched.has(el)) return;
        watched.add(el);
        io.observe(el);
      });
    };

    scan();
    root.classList.add("reveal-ready");

    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      root.classList.remove("reveal-ready");
    };
  }, []);

  return null;
}
