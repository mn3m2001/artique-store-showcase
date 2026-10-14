"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowRight, Moon, Pause, Play, Sun, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { Product, StoreSettings } from "@/types";
import { AtelierScene } from "./AtelierScene";

export function AtelierExperience({ products, settings }: { products: Product[]; settings: StoreSettings }) {
  const { locale } = useLanguage();
  const ar = locale === "ar";
  const track = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [night, setNight] = useState(false);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const select = useCallback((product: Product) => setSelected(product), []);
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => setFailed(true), []);
  const enabled = settings.enable_3d_hero !== false;
  const phase = progress < .32 ? 0 : progress < .72 ? 1 : 2;
  const chapters = ar ? ["أهلًا في الأتيليه", "من الخيط إلى الحكاية", "قطع تستحق الاقتراب"] : ["Welcome to the atelier", "From thread to story", "A closer look at the craft"];
  const headings = ar
    ? ["عالم صغير.\nصُنع على مهل.", "هنا تبدأ\nكل حكاية.", "اقترب.\nواختر حكايتك."]
    : ["A little world.\nMade slowly.", "Every story\nstarts here.", "Come closer.\nFind your piece."];

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!track.current) return;
        const bounds = track.current.getBoundingClientRect();
        setProgress(Math.max(0, Math.min(1, -bounds.top / Math.max(1, bounds.height - window.innerHeight + 80))));
      });
    };
    window.addEventListener("scroll", update, { passive: true }); window.addEventListener("resize", update); update();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);

  useEffect(() => {
    if (!selected) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.querySelector<HTMLElement>("button")?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
      if (event.key !== "Tab") return;
      const controls = dialog.current?.querySelectorAll<HTMLElement>("button, a[href]");
      if (!controls?.length) return;
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", key);
    return () => { document.body.style.overflow = overflow; document.removeEventListener("keydown", key); previous?.focus(); };
  }, [selected]);

  const imageFor = (product: Product) => product.images?.find((image) => image.is_cover)?.url || product.images?.[0]?.url || settings.hero_image_url;
  return (
    <section ref={track} className={`atelier-track ${night ? "atelier-night" : ""}`} aria-label={ar ? "جولة في أتيليه آرتيك" : "Explore the Artique atelier"}>
      <div className="atelier-stage">
        <div className={`atelier-fallback ${ready && !failed ? "is-ready" : ""}`} aria-hidden="true">
          <Image src={settings.brand_story_image_url || settings.hero_image_url} alt="" fill priority sizes="100vw" className="object-cover" />
        </div>
        {enabled && !failed && <AtelierScene products={products} progress={progress} night={night} paused={paused || Boolean(selected)} onSelect={select} onReady={onReady} onError={onError} />}
        <div className="atelier-vignette" />
        <div className="atelier-topline"><span>ARTIQUE / THE CRAFT ATELIER</span><span>{ar ? "دمياط، مصر • صُنع باليد" : "DAMIETTA, EGYPT • MADE BY HAND"}</span></div>
        <div className="atelier-copy" key={phase}>
          <div className="atelier-eyebrow"><span className="atelier-dot" />{chapters[phase]}<span className="atelier-chapter">0{phase + 1} / 03</span></div>
          <h1>{phase === 0 ? (ar ? settings.hero_title_ar : settings.hero_title_en) || headings[0] : headings[phase]}</h1>
          <p>{phase === 0
            ? ar ? "ادخل عالم آرتيك. خيوط دافئة، تفاصيل تحمل أثر اليد، وقطع تحكي شيئًا منك." : "Step into Artique. Warm threads, thoughtful details, and pieces that tell a little of your story."
            : phase === 1
            ? ar ? "على هذه الطاولة، يتحوّل الخيط إلى هدية، وركن دافئ، وتفصيلة تبقى." : "At this table, a simple thread becomes a gift, a warm corner, a detail to keep."
            : ar ? "الصور داخل الأتيليه هي مشغولاتنا الحقيقية. اضغط على قطعة لتكتشف تفاصيلها." : "The pictures in the atelier show our actual work. Select a piece to discover its details."}</p>
          <div className="atelier-actions"><Link href="#categories" className="atelier-button">{ar ? "اكتشف التشكيلة" : "Explore the collections"}{ar ? <ArrowLeft size={17} /> : <ArrowRight size={17} />}</Link><Link href="/products" className="atelier-text-link">{ar ? "اذهب إلى المتجر" : "Visit the shop"}</Link></div>
        </div>
        <div className="atelier-controls">
          {enabled && ready && !failed && <><button onClick={() => setNight((value) => !value)} aria-pressed={night} aria-label={ar ? "تبديل إضاءة الأتيليه" : "Change atelier lighting"}>{night ? <Sun size={16} /> : <Moon size={16} />}<span>{ar ? night ? "ضوء النهار" : "ضوء المساء" : night ? "Daylight" : "Evening light"}</span></button><button onClick={() => setPaused((value) => !value)} aria-pressed={paused} aria-label={ar ? paused ? "تشغيل الجولة" : "إيقاف الجولة" : paused ? "Play tour" : "Pause tour"}>{paused ? <Play size={15} /> : <Pause size={15} />}</button></>}
        </div>
        <div className="atelier-bottom">
          <a href="#categories" className="atelier-scroll"><span>{ar ? "مرّر لتقترب" : "SCROLL TO COME CLOSER"}</span><ArrowDown size={18} /></a>
          <div className="atelier-chapters">{chapters.map((chapter, index) => <span key={chapter} className={index === phase ? "active" : ""}>0{index + 1}<span>{chapter}</span></span>)}</div>
        </div>
        <div className="atelier-progress" style={{ transform: `scaleX(${progress})` }} />
        <div className="atelier-mobile-shortcuts"><Link href="#categories">{ar ? "التصنيفات" : "Collections"}</Link><Link href="/products">{ar ? "تسوّق الآن ↗" : "Shop now ↗"}</Link></div>
        <div className="atelier-pieces" aria-label={ar ? "القطع المعروضة في الأتيليه" : "Pieces in the atelier"}>
          {products.slice(0, 3).map((product) => <button key={product.id} onClick={() => select(product)} aria-label={`${ar ? "اكتشف" : "Discover"} ${ar ? product.name_ar : product.name_en}`}><Image src={imageFor(product)} alt="" width={44} height={50} /><span>{ar ? product.name_ar : product.name_en}</span><span>↗</span></button>)}
        </div>
      </div>
      {selected && <div className="atelier-modal-backdrop" onClick={() => setSelected(null)}><div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="atelier-product-title" className="atelier-modal" onClick={(event) => event.stopPropagation()}>
        <button className="atelier-modal-close" onClick={() => setSelected(null)} aria-label={ar ? "إغلاق تفاصيل القطعة" : "Close piece details"}><X size={20} /></button>
        <div className="atelier-modal-image"><Image src={imageFor(selected)} alt={ar ? selected.name_ar : selected.name_en} fill sizes="(max-width: 700px) 90vw, 400px" className="object-cover" /></div>
        <div className="atelier-modal-content"><span className="atelier-eyebrow">{ar ? "من داخل الأتيليه" : "FROM THE ATELIER"}</span><h2 id="atelier-product-title">{ar ? selected.name_ar : selected.name_en}</h2><p>{ar ? selected.description_ar : selected.description_en}</p><strong>{selected.base_price} {ar ? "ج.م" : "EGP"}</strong><Link className="atelier-button" href={`/products/${selected.slug}`}>{ar ? "التفاصيل واختيار القطعة" : "Details & choose your piece"}{ar ? <ArrowLeft size={17} /> : <ArrowRight size={17} />}</Link></div>
      </div></div>}
    </section>
  );
}
