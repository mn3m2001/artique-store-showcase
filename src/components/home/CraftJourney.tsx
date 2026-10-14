"use client";

import React from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { Sparkles, Feather, Layers, Award, Info } from "lucide-react";

interface Step {
  stepNumber: string;
  stepNumberEn: string;
  tagKey: "step1Tag" | "step2Tag" | "step3Tag";
  titleKey: "step1Title" | "step2Title" | "step3Title";
  descKey: "step1Desc" | "step2Desc" | "step3Desc";
  image: string;
}

const JOURNEY_STEPS: Step[] = [
  {
    stepNumber: "٠١",
    stepNumberEn: "01",
    tagKey: "step1Tag",
    titleKey: "step1Title",
    descKey: "step1Desc",
    image: "/demo-media/639d5ea315cc6aa3.webp",
  },
  {
    stepNumber: "٠٢",
    stepNumberEn: "02",
    tagKey: "step2Tag",
    titleKey: "step2Title",
    descKey: "step2Desc",
    image: "/demo-media/58bb70d638680ec1.webp",
  },
  {
    stepNumber: "٠٣",
    stepNumberEn: "03",
    tagKey: "step3Tag",
    titleKey: "step3Title",
    descKey: "step3Desc",
    image: "/demo-media/ac1a3dccf10ca839.webp",
  },
];

export function CraftJourney({ locale = "ar" }: { locale?: string }) {
  const { t } = useLanguage();
  const isAr = locale === "ar";
  const journeyTrans = t.common?.journey;

  return (
    <section className="py-20 bg-gradient-to-b from-[#FAF7F2] via-[#F5ECE1]/60 to-[#FAF7F2] border-y border-[#E8DED1] relative overflow-hidden">
      {/* Subtle background ambient gradients */}
      <div className="absolute top-1/2 -start-24 w-80 h-80 bg-[#C8692F]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -end-24 w-80 h-80 bg-[#B8862B]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 bg-[#F3ECE1] text-[#7A7452] border border-[#E0D3C1] px-4 py-1.5 rounded-full text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-[#C8692F]" />
            <span>{journeyTrans?.badge || (isAr ? "رحلة الغرزة في آرتيك" : "The Artique Stitch Journey")}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#291D11] leading-tight">
            {journeyTrans?.title || (isAr ? "من بكرة الخيط إلى تحفة تدوم أجيالاً" : "From A Thread To A Timeless Keepsake")}
          </h2>

          <p className="text-sm sm:text-base text-[#6E5F50] leading-relaxed">
            {journeyTrans?.desc ||
              (isAr
                ? "نؤمن بأن المشغولات اليدوية ليست مجرد منتجات، بل حكايات من الصبر والجمال تولد على مهل بين الخيط والإبرة."
                : "We believe handmade crafts are never just products, but stories of patience and passion woven with devotion.")}
          </p>
        </div>

        {/* 3-Step Interactive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {JOURNEY_STEPS.map((step, idx) => {
            const title = journeyTrans?.[step.titleKey] || "";
            const desc = journeyTrans?.[step.descKey] || "";
            const tag = journeyTrans?.[step.tagKey] || "";

            return (
              <div
                key={step.stepNumber}
                className="group relative bg-white/90 backdrop-blur-xs rounded-3xl p-6 sm:p-7 border border-[#E8DED1] hover:border-[#C8692F] shadow-warm-sm hover:shadow-warm-md transition-all duration-300 flex flex-col justify-between"
              >
                {/* Top Step Number Badge */}
                <div className="flex items-center justify-between gap-4 mb-5">
                  <span className="font-serif text-3xl font-extrabold text-[#C8692F]/40 group-hover:text-[#C8692F] transition-colors">
                    {isAr ? step.stepNumber : step.stepNumberEn}
                  </span>
                  <span className="text-[11px] font-bold text-[#7A7452] bg-[#FAF7F2] border border-[#E0D3C1] px-2.5 py-1 rounded-full">
                    {tag}
                  </span>
                </div>

                {/* Photo Showcase */}
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#F3ECE1] mb-6 border border-[#E8DED1]">
                  <Image
                    src={step.image}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#291D11]/30 via-transparent to-transparent opacity-60 group-hover:opacity-20 transition-opacity" />
                </div>

                {/* Content */}
                <div className="space-y-2.5 flex-1">
                  <h3 className="font-serif text-xl font-bold text-[#291D11] group-hover:text-[#C8692F] transition-colors">
                    {title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6E5F50] leading-relaxed">
                    {desc}
                  </p>
                </div>

                {/* Bottom Indicator */}
                <div className="mt-5 pt-4 border-t border-[#F3ECE1] flex items-center gap-2 text-xs font-semibold text-[#C8692F]">
                  {idx === 0 && <Feather className="w-3.5 h-3.5" />}
                  {idx === 1 && <Layers className="w-3.5 h-3.5" />}
                  {idx === 2 && <Award className="w-3.5 h-3.5" />}
                  <span>
                    {isAr ? `المرحلة ${idx + 1} من الإبداع` : `Stage ${idx + 1} of Craftsmanship`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Honest Photo Documentation Note */}
        <div className="mt-12 bg-white/60 backdrop-blur-xs rounded-2xl p-4 border border-[#E8DED1] max-w-2xl mx-auto flex items-center gap-3 text-xs text-[#8A7968]">
          <Info className="w-4 h-4 text-[#C8692F] shrink-0" />
          <p>
            {journeyTrans?.photoNote ||
              (isAr
                ? "ملاحظة توثيقية: صور كواليس لف الخيوط وخطوات الحياكة والتغليف موثقة بصدق من أعمال آرتيك الحقيقية، ويمكن تخصيصها ورفع صور إضافية من لوحة الإدارة."
                : "Documentation note: Workshop crafting, stitch closeups, and packaging photos are authentic Artique works and can be updated via the admin dashboard.")}
          </p>
        </div>
      </div>
    </section>
  );
}
