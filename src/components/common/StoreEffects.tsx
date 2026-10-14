"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function StoreEffects() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;
    const observed = new WeakSet<Element>();
    const animations = new Set<Animation>();
    const reveal = new IntersectionObserver((entries) => {
      if (reduced.matches) return;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target as HTMLElement;
        const index = Array.from(element.parentElement?.children || []).indexOf(element);
        const animation = element.animate([
          { opacity: 0, transform: "translateY(28px) scale(.98)" },
          { opacity: 1, transform: "translateY(0) scale(1)" },
        ], { duration: 650, delay: Math.min(index, 5) * 65, easing: "cubic-bezier(.2,.75,.2,1)", fill: "backwards" });
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
        reveal.unobserve(element);
      }
    }, { threshold: .08 });
    const scan = () => document.querySelectorAll(".craft-card, .atelier-category, main section > div:not(.atelier-stage):not(.atelier-product-grid):not(.atelier-category-grid), .store-hero-copy").forEach((element) => {
      if (!observed.has(element)) { observed.add(element); reveal.observe(element); }
    });
    scan();
    const changes = new MutationObserver(scan);
    changes.observe(document.body, { childList: true, subtree: true });
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const move = (event: PointerEvent) => {
      if (!finePointer.matches || reduced.matches) return;
      const card = (event.target as Element).closest<HTMLElement>(".craft-card, .atelier-category");
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      card.style.setProperty("--tilt-x", `${(0.5 - y) * 7}deg`);
      card.style.setProperty("--tilt-y", `${(x - 0.5) * 7}deg`);
      card.style.setProperty("--glow-x", `${x * 100}%`);
      card.style.setProperty("--glow-y", `${y * 100}%`);
    };
    const leave = (event: PointerEvent) => {
      const card = (event.target as Element).closest<HTMLElement>(".craft-card, .atelier-category");
      if (!card || card.contains(event.relatedTarget as Node)) return;
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    };
    const disableMotion = () => { if (reduced.matches) animations.forEach((animation) => animation.cancel()); };
    reduced.addEventListener("change", disableMotion);
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerout", leave, { passive: true });
    return () => {
      reveal.disconnect(); changes.disconnect();
      animations.forEach((animation) => animation.cancel());
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerout", leave);
      reduced.removeEventListener("change", disableMotion);
    };
  }, [pathname]);
  return null;
}
