"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export function KineticPreloader({
  previewImage = "/demo-media/58bb70d638680ec1.webp",
}: {
  previewImage?: string;
}) {
  const { locale } = useLanguage();
  const ar = locale === "ar";

  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Generate 120 grid tiles (12 cols x 10 rows) for the curtain effect
  const tiles = useMemo(() => Array.from({ length: 120 }, (_, i) => i), []);

  useEffect(() => {
    setIsMounted(true);

    // Fast, smooth counter simulation up to 100%
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsFinished(true), 400);
          return 100;
        }
        // Organic accelerated increment
        const increment = Math.max(1, Math.floor(Math.random() * 8) + 2);
        return Math.min(100, prev + increment);
      });
    }, 35);

    return () => clearInterval(interval);
  }, []);

  if (!isMounted) return null;
  if (isFinished) return null;

  const handleSkip = () => {
    setProgress(100);
    setIsFinished(true);
  };

  return (
    <div
      id="page-transition"
      className={progress >= 100 ? "is-finished" : ""}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* 20x10 Grid Tiles Curtain */}
      <div className="pt-grid" aria-hidden="true">
        {tiles.map((i) => {
          // Staggered vanish effect when progress reaches 100%
          const isReceding = progress >= 100;
          const delay = (i % 20) * 0.02 + Math.floor(i / 20) * 0.03;
          return (
            <div
              key={i}
              className={`ptc ${isReceding ? "is-receding" : ""}`}
              style={{
                transitionDelay: `${delay}s`,
              }}
            />
          );
        })}
      </div>

      {/* Main Preloader Content */}
      <div className="pt-preloader">
        {/* Top Left Title */}
        <h2 className="pt-title">
          <span className="pt-title-mark" />
          <span>{ar ? "آرتيك — أتيليه الخيوط الحركي" : "ARTIQUE / KINETIC ATELIER"}</span>
        </h2>

        {/* Top Right Floating Brand Card */}
        <div className="pt-brand-stage" aria-hidden="true">
          <div className="pt-brand-accent" />
          <div className="pt-brand-card">
            <span className="text-[9px] text-[#FF3B1F] font-bold">EST. 2024</span>
            <span className="text-[12px] font-black text-[#151515] tracking-widest">ARTIQUE</span>
            <span className="text-[8px] text-[#666]">DAMIETTA</span>
          </div>
        </div>

        {/* Bottom Digital Metric & Ruler System */}
        <div className="pt-loader">
          {/* Progress Number */}
          <div className="pt-progress font-mono">
            {progress < 10 ? `0${progress}` : progress}
            <span className="text-sm font-sans text-[#FF3B1F] ml-1">%</span>
          </div>

          {/* Digital Precision Measurement Ruler */}
          <div className="pt-ruler">
            <div className="pt-ticks-container">
              {Array.from({ length: 41 }, (_, i) => (
                <div
                  key={i}
                  className={`pt-tick ${i % 5 === 0 ? "major" : ""}`}
                  style={{
                    backgroundColor: i % 10 === 0 ? "#FFCC19" : "#FFFFFF",
                  }}
                />
              ))}
            </div>

            {/* Red Dynamic Indicator Marker */}
            <div
              className="pt-marker"
              style={{
                left: `${progress}%`,
              }}
            />
          </div>
        </div>

        {/* Skip button for user accessibility */}
        <button
          onClick={handleSkip}
          className="pt-skip-btn"
          aria-label={ar ? "تخطي شاشة البداية" : "Skip preloader"}
        >
          {ar ? "تخطي ↗" : "SKIP ↗"}
        </button>
      </div>
    </div>
  );
}
