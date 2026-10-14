"use client";

import React, { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export function KineticCursor() {
  const { locale } = useLanguage();
  const ar = locale === "ar";

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const [cursorMode, setCursorMode] = useState<"default" | "view" | "ring">("default");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only run on non-touch devices with fine pointers
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let dotX = mouseX;
    let dotY = mouseY;
    let ringX = mouseX;
    let ringY = mouseY;

    let animationFrameId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) setIsVisible(true);

      // Check hovered element for cursor mode
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const closestView = target.closest('[data-cursor="view"]');
      const closestRing = target.closest('[data-cursor="ring"], .k-btn-primary, .k-card-preview-viewport');
      const closestInteractive = target.closest('a, button, input, select');

      if (closestView) {
        setCursorMode("view");
      } else if (closestRing) {
        setCursorMode("ring");
      } else if (closestInteractive) {
        setCursorMode("ring");
      } else {
        setCursorMode("default");
      }
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    const render = () => {
      // Smooth lerp physics
      dotX += (mouseX - dotX) * 0.75;
      dotY += (mouseY - dotY) * 0.75;

      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="kinetic-cursor-wrapper" aria-hidden="true">
      {/* Center Dot / Dynamic Capsule */}
      <div
        ref={dotRef}
        className={`k-cursor-dot ${cursorMode === "view" ? "is-view" : ""} ${
          cursorMode === "ring" ? "is-hover-ring" : ""
        }`}
      >
        {cursorMode === "view" && (
          <span className="k-cursor-badge-text">
            {ar ? "معاينة القطعة" : "VIEW PIECE"}
          </span>
        )}

        {cursorMode === "ring" && (
          <div className="k-cursor-rotator">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-white/80">
              <path
                id="k-circle-path"
                d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                fill="none"
              />
              <text fontSize="8.5" fontWeight="bold" letterSpacing="0.16em">
                <textPath href="#k-circle-path">
                  ✦ EXPLORE ✦ ARTIQUE ✦ DAMIETTA
                </textPath>
              </text>
            </svg>
          </div>
        )}
      </div>

      {/* Outer Trailing Ring */}
      <div
        ref={ringRef}
        className="k-cursor-ring"
        style={{
          opacity: cursorMode === "default" ? 0.8 : 0,
        }}
      />
    </div>
  );
}
