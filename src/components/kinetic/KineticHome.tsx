"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  MapPin,
  Scissors,
  ShieldCheck,
  Package,
  Layers,
} from "lucide-react";
import type { Category, Product, StoreSettings } from "@/types";
import { useLanguage } from "@/context/LanguageContext";

import { KineticPreloader } from "./KineticPreloader";
import { KineticCursor } from "./KineticCursor";
import { KineticFilmGrain } from "./KineticFilmGrain";
import { KineticMarquee } from "./KineticMarquee";
import { KineticHeroSpiral } from "./KineticHeroSpiral";
import { KineticProductCard } from "./KineticProductCard";
import { KineticScrambleText } from "./KineticScrambleText";

export function KineticHome({
  settings,
  categories,
  featuredProducts,
  isDemo,
}: {
  settings: StoreSettings;
  categories: Category[];
  featuredProducts: Product[];
  isDemo: boolean;
}) {
  const { locale } = useLanguage();
  const ar = locale === "ar";
  const Arrow = ar ? ArrowLeft : ArrowRight;

  const trackRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Scroll tracking for pinned hero sequence
  useEffect(() => {
    let frame = 0;
    const handleScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!trackRef.current) return;
        const bounds = trackRef.current.getBoundingClientRect();
        const totalScrollable = bounds.height - window.innerHeight;
        const progress = Math.max(
          0,
          Math.min(1, -bounds.top / Math.max(1, totalScrollable))
        );
        setScrollProgress(progress);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    handleScroll();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Determine current chapter (0, 1, or 2)
  const phase = scrollProgress < 0.35 ? 0 : scrollProgress < 0.72 ? 1 : 2;

  const chaptersAr = [
    {
      eyebrow: "01 / البداية والروح",
      title: "عالم من خيوط\nالدهشة والتمهل.",
      subtitle: "كل قطعة تبدأ من بكرة خيط واحدة، وتكتمل بأثر اليد والاهتمام بالتفاصيل.",
    },
    {
      eyebrow: "02 / الحِرفة والنسيج",
      title: "صُنع في دمياط.\nحِرفة تتحدى السرعة.",
      subtitle: "نصنع قطعاً تعيش معك وتمنح مساحتك دفئاً لا تقدمه خطوط الإنتاج الآلية.",
    },
    {
      eyebrow: "03 / التشكيلة الحصرية",
      title: "اقترب.\nواختر قطعتك.",
      subtitle: "مشغولات كروشيه مختارة بعناية. تصفح تفاصيل كل قطعة واطلبها لبابك.",
    },
  ];

  const chaptersEn = [
    {
      eyebrow: "01 / THE ESSENCE",
      title: "CRAFT /\nREINVENTED.",
      subtitle: "Every piece begins with a single thread, shaped with patience and devotion.",
    },
    {
      eyebrow: "02 / SLOW MAKING",
      title: "MADE IN DAMIETTA.\nINTENTIONAL CRAFT.",
      subtitle: "Handcrafted textiles designed to bring genuine warmth to your everyday moments.",
    },
    {
      eyebrow: "03 / THE COLLECTION",
      title: "COME CLOSER.\nFIND YOUR PIECE.",
      subtitle: "Limited handcrafted editions. Explore every stitch and bring one home.",
    },
  ];

  const currentChapter = ar ? chaptersAr[phase] : chaptersEn[phase];

  return (
    <div className="kinetic-theme">
      {/* 1. Digital Preloader with ruler & grid curtain */}
      <KineticPreloader previewImage={settings.hero_image_url} />

      {/* 2. Interactive Custom Cursor with rotating text ring */}
      <KineticCursor />

      {/* 3. Cinematic Film Grain Micro-Noise Overlay */}
      <KineticFilmGrain />

      {/* 4. Top Electric Yellow Marquee Banner */}
      <KineticMarquee theme="yellow" />

      {/* 5. Fixed Geographic Metrics on Desktop Edge */}
      <div className="kinetic-fixed-datas" aria-hidden="true">
        <span>31.4175° N, 31.8144° E</span>
        <span>•</span>
        <span>DAMIETTA, EGYPT</span>
        <span>•</span>
        <span>100% HANDMADE</span>
      </div>

      {/* 6. Main Hero Pinned Scroll Track */}
      <section
        ref={trackRef}
        className="kinetic-hero-track"
        aria-label={ar ? "الواجهة الحركية الرئيسية" : "Kinetic hero experience"}
      >
        <div className="kinetic-hero-sticky">
          {/* Three.js 3D WebGL Spiral Vortex */}
          <KineticHeroSpiral scrollProgress={scrollProgress} />

          {/* Foreground Kinetic Typography */}
          <div className="kinetic-hero-content">
            {/* Topline Badge & Status */}
            <div className="k-hero-top">
              <div className="k-hero-badge">
                <span className="k-hero-badge-dot" />
                <span>
                  {ar
                    ? "أتيليه آرتيك الحركي • دمياط، مصر"
                    : "ARTIQUE KINETIC ATELIER • DAMIETTA, EG"}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <KineticScrambleText text="#slowcraft" />
                <KineticScrambleText text="#bespoke" />
              </div>
            </div>

            {/* Giant Title & Phase Story */}
            <div className="k-hero-center">
              <h1 className="k-hero-giant-title">
                {currentChapter.title.split("\n").map((line, idx) => (
                  <span key={idx} className="block">
                    {line}{" "}
                    {idx === 0 && <span className="accent-red">✦</span>}
                  </span>
                ))}
              </h1>

              <p className="k-hero-sub">{currentChapter.subtitle}</p>

              <div className="k-hero-actions">
                <Link href="#showcase" className="k-btn-primary" data-cursor="ring">
                  <span>{ar ? "اكتشف المشغولات" : "EXPLORE PIECES"}</span>
                  <Arrow size={18} />
                </Link>

                <Link href="/products" className="k-btn-secondary" data-cursor="ring">
                  <span>{ar ? "المتجر الكامل" : "FULL SHOP"}</span>
                  <ArrowUpRight size={17} />
                </Link>
              </div>
            </div>

            {/* Bottom Stepper & Scroll Notice */}
            <div className="k-hero-bottom">
              <div className="k-scroll-indicator">
                <ArrowDown size={14} className="text-[#FF3B1F] animate-bounce" />
                <span>{ar ? "مرّر لتكتشف الأتيليه" : "SCROLL TO DISCOVER"}</span>
              </div>

              <div className="k-chapters-stepper">
                <span className={phase === 0 ? "active" : ""}>
                  01 / {ar ? "الروح" : "ESSENCE"}
                </span>
                <span className={phase === 1 ? "active" : ""}>
                  02 / {ar ? "الحرفة" : "CRAFT"}
                </span>
                <span className={phase === 2 ? "active" : ""}>
                  03 / {ar ? "القطع" : "EDITIONS"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Secondary Dark Marquee Divider */}
      <KineticMarquee theme="dark" reverse={true} />

      {/* 8. Trust Metrics Bar */}
      <section className="bg-[#191919] border-b border-white/10 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-around gap-6 text-xs sm:text-sm text-white/80">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-[#FF3B1F]" />
            <span>{ar ? "توصيل لجميع مناطق دمياط" : "Delivery throughout Damietta"}</span>
          </div>
          <div className="flex items-center gap-3">
            <Scissors className="w-5 h-5 text-[#FFCC19]" />
            <span>{ar ? "شُغل يدوي مصري خالص 100%" : "100% Handcrafted in Egypt"}</span>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#55DC7D]" />
            <span>{ar ? "سداد بإنستاباي وفودافون كاش أو عند الاستلام" : "InstaPay, Vodafone Cash & COD"}</span>
          </div>
        </div>
      </section>

      {/* 9. WPKoi Showcase Products Grid */}
      <section id="showcase" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#FF3B1F] mb-2">
              <span className="w-2 h-2 bg-[#FF3B1F]" />
              {ar ? "مختارات الأتيليه" : "THE SHOWCASE ARCHIVE"}
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
              {ar ? "قطع تستحق التمهل." : "CURATED PIECES."}
            </h2>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#FFCC19] hover:underline"
          >
            <span>{ar ? "عرض جميع المعروضات ↗" : "VIEW ALL PIECES ↗"}</span>
          </Link>
        </div>

        {/* The Showcase Cards with Long Vertical Previews */}
        <div className="kinetic-showcase-grid">
          {featuredProducts.slice(0, 6).map((product) => (
            <KineticProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 10. Collections / Categories Explorer */}
      <section className="bg-[#181818] border-t border-b border-white/10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <span className="text-xs font-mono text-[#FFCC19] tracking-widest uppercase block mb-2">
              02 / {ar ? "عوالم وتصنيفات" : "COLLECTIONS"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold uppercase text-white">
              {ar ? "اختر التشكيلة المناسبة لك" : "EXPLORE THE COLLECTIONS"}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.slice(0, 4).map((cat, index) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group relative bg-[#202020] border border-white/10 rounded-xl overflow-hidden p-6 flex flex-col justify-between min-h-[300px] hover:border-[#FF3B1F] transition-all duration-300"
                data-cursor="ring"
              >
                <div className="flex justify-between items-start">
                  <span className="font-mono text-2xl font-black text-white/30 group-hover:text-[#FF3B1F] transition-colors">
                    0{index + 1}
                  </span>
                  <ArrowUpRight className="w-5 h-5 text-white/50 group-hover:text-[#FF3B1F] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </div>

                <div className="relative w-full h-36 my-4 rounded-lg overflow-hidden">
                  <Image
                    src={cat.cover_image}
                    alt={ar ? cat.name_ar : cat.name_en}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, 25vw"
                  />
                </div>

                <div>
                  <span className="text-[10px] font-mono tracking-widest text-[#A0A0A0] uppercase block">
                    {ar ? cat.name_en : "ARTIQUE CRAFT"}
                  </span>
                  <h3 className="text-xl font-bold text-white group-hover:text-[#FFCC19] transition-colors mt-1">
                    {ar ? cat.name_ar : cat.name_en}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 11. Editorial Craft Journey & Brand Story */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-[480px] sm:h-[560px] rounded-2xl overflow-hidden border border-white/15">
            <Image
              src={settings.hero_image_url || "/demo-media/639d5ea315cc6aa3.webp"}
              alt={ar ? "مشغولات آرتيك اليدوية" : "Artique handcrafted crafts"}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-xs font-mono text-[#FFCC19] tracking-widest block mb-1">
                HANDCRAFTED IN DAMIETTA
              </span>
              <p className="text-lg font-bold text-white">
                {ar
                  ? "كل غرزة ننسجها، نحرص أن تكون إضافة جميلة ويومية لبيتك أو هدية تخلد المشاعر."
                  : "Every stitch is placed with intention, making something that lasts."}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <span className="text-xs font-mono text-[#FF3B1F] tracking-widest uppercase block">
              03 / {ar ? "قصة العلامة" : "THE ARTIQUE STORY"}
            </span>

            <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight leading-tight">
              {ar ? "وراء كل خيط،\nيدٌ وقلب." : "BEHIND EVERY THREAD,\nA HEART AND HAND."}
            </h2>

            <p className="text-white/70 text-base sm:text-lg leading-relaxed">
              {ar
                ? settings.brand_story_ar ||
                  "آرتيك وُلدت من شغف بالخيوط والألوان. نختار الخامات القطنية النقية بعناية فائقة ونصنع كل قطعة يدوياً في دمياط دون استعجال، لتصل إليك قطعة متفردة لا تشبه أي شيء آخر."
                : settings.brand_story_en ||
                  "Artique was born from a passion for textures, colors, and the tactile joy of handmade crochet. Crafted in Damietta with love."}
            </p>

            <div className="pt-4 flex flex-wrap gap-4">
              <a
                href={settings.instagram_url || "https://www.instagram.com/artique_11/"}
                target="_blank"
                rel="noopener noreferrer"
                className="k-btn-secondary"
                data-cursor="ring"
              >
                <span>{ar ? "متابعة كواليس الأتيليه على إنستغرام" : "INSTAGRAM ATELIER"}</span>
                <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 12. Bottom Statement / Signoff */}
      <footer className="border-t border-white/10 bg-[#121212] py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="text-5xl sm:text-7xl font-black tracking-widest uppercase text-white block">
            ARTIQUE
          </span>
          <p className="text-sm font-mono text-white/50 tracking-wider">
            {ar
              ? "مشغولات يدوية من دمياط • كروشيه فاخر • صُنع بحب"
              : "HANDMADE CROCHET FROM DAMIETTA • LUXURY FIBERS • CRAFTED WITH LOVE"}
          </p>

          <div className="pt-6">
            <Link
              href="/products"
              className="k-btn-primary inline-flex"
              data-cursor="ring"
            >
              <span>{ar ? "تسوّق الآن من الكتالوج" : "SHOP THE CATALOG"}</span>
              <Arrow size={16} />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
