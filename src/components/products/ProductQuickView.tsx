"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { X, Check, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types";

export function ProductQuickView({ product, onClose }: { product: Product; onClose: () => void }) {
  const { locale, t } = useLanguage();
  const ar = locale === "ar";
  const { addItem } = useCart();
  const panel = useRef<HTMLDivElement>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [variant, setVariant] = useState(product.variants?.find((item) => item.is_available !== false) || null);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [added, setAdded] = useState(false);
  const images = product.images?.length ? product.images : [{ id: "cover", url: "/demo-media/logo-67c9bd5fb43debcf.png" }];
  const price = variant?.price_override && variant.price_override > 0 ? variant.price_override : product.base_price;
  const stock = variant?.stock_quantity ?? product.stock_quantity;
  const limit = product.is_made_to_order || stock == null ? 99 : Math.max(0, stock);
  const unavailable = product.status !== "published" || price <= 0 || limit === 0 || Boolean(product.variants?.length && !variant);
  useEffect(() => {
    const focus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("button")?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const items = panel.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input, textarea');
      if (!items?.length) return;
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", key);
    return () => { document.body.style.overflow = overflow; document.removeEventListener("keydown", key); focus?.focus(); };
  }, [onClose]);
  return createPortal(<div className="product-quick-backdrop" onClick={onClose}><div ref={panel} role="dialog" aria-modal="true" aria-labelledby={`quick-title-${product.id}`} className="product-quick-panel" onClick={(event) => event.stopPropagation()}>
    <button className="product-quick-close" onClick={onClose} aria-label={ar ? "إغلاق المعاينة" : "Close quick view"}><X size={20} /></button>
    <div className="product-quick-gallery"><div className="product-quick-image"><Image src={images[imageIndex].url} alt={ar ? product.name_ar : product.name_en} fill sizes="(max-width: 700px) 90vw, 460px" className="object-contain" /></div><div className="product-quick-thumbs">{images.map((image, index) => <button key={image.id} onClick={() => setImageIndex(index)} aria-label={`${ar ? "الصورة" : "Image"} ${index + 1}`} aria-pressed={index === imageIndex}><Image src={image.url} alt="" width={54} height={54} /></button>)}</div></div>
    <div className="product-quick-copy"><span className="atelier-eyebrow">{ar ? "من مختارات آرتيك" : "AN ARTIQUE PIECE"}</span><h2 id={`quick-title-${product.id}`}>{ar ? product.name_ar : product.name_en}</h2><p>{ar ? product.description_ar : product.description_en}</p><strong className="product-quick-price">{price} {t.currency}</strong>
      <div className="product-facts"><span>{ar ? "التجهيز" : "Preparation"}<b>{product.is_made_to_order ? `${product.preparation_days} ${ar ? "أيام عمل" : "working days"}` : ar ? "جاهزة للشحن" : "Ready to ship"}</b></span><span>{ar ? "الخامة" : "Material"}<b>{(ar ? product.material_ar : product.material_en) || (ar ? "اسألنا عن تفاصيل الخامة" : "Ask us about the material")}</b></span><span>{ar ? "المقاس" : "Dimensions"}<b>{(ar ? product.dimensions_ar : product.dimensions_en) || (ar ? "يُؤكد عند الطلب" : "Confirmed on request")}</b></span></div>
      {Boolean(product.variants?.length) && <div className="product-quick-variants"><span>{ar ? "اللون / الخيار" : "Color / option"}</span>{product.variants?.map((item) => <button key={item.id} disabled={item.is_available === false} aria-pressed={variant?.id === item.id} onClick={() => { setVariant(item); setQuantity(1); setAdded(false); }}>{ar ? item.name_ar : item.name_en}</button>)}</div>}
      {product.allow_custom_notes && <label className="product-quick-note">{ar ? "لمستك الخاصة (اختياري)" : "Your personal touch (optional)"}<textarea value={note} onChange={(event) => { setNote(event.target.value); setAdded(false); }} maxLength={500} rows={2} placeholder={ar ? "لون مفضل، مناسبة أو طلب خاص…" : "Preferred color, occasion or a special request…"} /></label>}
      <div className="product-quick-buy"><label>{ar ? "الكمية" : "Quantity"}<input type="number" min={1} max={Math.max(1, limit)} value={quantity} onChange={(event) => { setQuantity(Math.min(Math.max(1, Math.floor(Number(event.target.value) || 1)), Math.max(1, limit))); setAdded(false); }} /></label><button className="atelier-button" disabled={unavailable || added} onClick={() => { addItem(product, quantity, variant, note); setAdded(true); }}>{added ? <Check size={17} /> : <ShoppingBag size={17} />}{unavailable ? ar ? "غير متاحة حاليًا" : "Currently unavailable" : added ? ar ? "تمت الإضافة" : "Added" : t.products.addToCart}</button></div>
      <span role="status" className="product-quick-status">{added && (ar ? "القطعة واختياراتك محفوظة في السلة." : "Your piece and selections are saved in the cart.")}</span>
      <div className="product-quick-links"><Link href={`/products/${product.slug}`}>{ar ? "كل التفاصيل والعناية ↗" : "Full details & care ↗"}</Link>{added && <Link href="/cart">{ar ? "انتقل إلى السلة ↗" : "View your cart ↗"}</Link>}</div>
    </div>
  </div></div>, document.body);
}
