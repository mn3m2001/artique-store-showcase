"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";

export function KineticMarquee({
  theme = "yellow",
  reverse = false,
  customText,
}: {
  theme?: "yellow" | "dark";
  reverse?: boolean;
  customText?: string;
}) {
  const { locale } = useLanguage();
  const ar = locale === "ar";

  const defaultTextAr =
    "✦ مشغولات يدوية فاخرة ✦ صُنع بحب في دمياط ✦ خيوط قطنية نقية 100% ✦ قطع حصرية ومحدودة ✦ كل غرزة تحكي قصة ✦ جودة تدوم طويلاً ✦";
  const defaultTextEn =
    "✦ ARTIQUE HANDMADE CRAFTS ✦ CRAFTED WITH CARE IN DAMIETTA ✦ 100% LUXURY NATURAL YARNS ✦ LIMITED EDITION PIECES ✦ EVERY STITCH TELLS A STORY ✦";

  const content = customText || (ar ? defaultTextAr : defaultTextEn);

  return (
    <div
      className={`kinetic-marquee-wrap ${
        theme === "yellow" ? "kinetic-marquee-yellow" : "kinetic-marquee-dark"
      }`}
      aria-hidden="true"
    >
      <div className={`kinetic-marquee-track ${reverse ? "reverse" : ""}`}>
        <span>{content}</span>
        <span>{content}</span>
        <span>{content}</span>
        <span>{content}</span>
      </div>
      <div className={`kinetic-marquee-track ${reverse ? "reverse" : ""}`}>
        <span>{content}</span>
        <span>{content}</span>
        <span>{content}</span>
        <span>{content}</span>
      </div>
    </div>
  );
}
