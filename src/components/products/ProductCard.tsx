"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Clock, Sparkles } from "lucide-react";
import { ProductQuickView } from "./ProductQuickView";

export function ProductCard({ product }: { product: Product }) {
  const { locale, t } = useLanguage();
  const { addItem } = useCart();
  const [quickOpen, setQuickOpen] = useState(false);
  const closeQuick = useCallback(() => setQuickOpen(false), []);

  const name = locale === "ar" ? product.name_ar : product.name_en;
  const categoryName = product.category
    ? locale === "ar"
      ? product.category.name_ar
      : product.category.name_en
    : "";

  const coverImage =
    product.images?.find((img) => img.is_cover)?.url ||
    product.images?.[0]?.url ||
    "/demo-media/5415cb931ba250dc.webp";

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.variants?.length) { setQuickOpen(true); return; }
    if (product.status === "published" && product.base_price > 0) {
      addItem(product, 1);
    }
  };

  const isDraft = product.status === "draft";

  return (
    <>
    <div className="craft-card group relative flex flex-col overflow-hidden bg-white">
      {/* Product Image Container */}
      <Link href={`/products/${product.slug}`} className="craft-card-media relative aspect-[4/5] w-full overflow-hidden bg-[#F3ECE1] block">
        <Image
          src={coverImage}
          alt={name}
          fill
          sizes="(max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 inset-x-3 flex items-start justify-between gap-2 pointer-events-none">
          {product.is_made_to_order ? (
            <span className="inline-flex items-center gap-1 bg-[#291D11]/85 backdrop-blur-md text-[#FAF7F2] text-[11px] font-medium px-2.5 py-1 rounded-full shadow-sm">
              <Clock className="w-3 h-3 text-[#C8692F]" />
              <span>{t.badges.madeToOrder}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-[#7A7452]/90 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full shadow-sm">
              <Sparkles className="w-3 h-3 text-[#F6F1E7]" />
              <span>{t.badges.readyMade}</span>
            </span>
          )}

          {isDraft && (
            <span className="bg-[#C8692F] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
              {t.badges.draft}
            </span>
          )}
        </div>
      </Link>
      <button type="button" className="craft-quick-trigger" onClick={() => setQuickOpen(true)} aria-label={`${locale === "ar" ? "معاينة سريعة" : "Quick view"}: ${name}`}>{locale === "ar" ? "معاينة سريعة ↗" : "Quick view ↗"}</button>

      {/* Product Content Details */}
      <div className="craft-card-content p-5 flex flex-col flex-1 justify-between gap-3">
        <div>
          {categoryName && (
            <span className="craft-card-category text-xs font-semibold text-[#8C7A6B] block mb-1">
              {categoryName}
            </span>
          )}
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-serif text-lg font-bold text-[#291D11] hover:text-[#C8692F] transition-colors line-clamp-2 leading-snug">
              {name}
            </h3>
          </Link>
        </div>

        {/* Price & Action */}
        <div className="craft-card-price-row pt-2 border-t border-[#F0E6D8] flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-xs text-[#8C7A6B]">{locale === "ar" ? "السعر" : "Price"}</span>
            <div className="flex items-baseline gap-1">
              {product.base_price > 0 ? (
                <>
                  <span className="font-bold text-lg text-[#291D11]">{product.base_price}</span>
                  <span className="text-xs font-medium text-[#C8692F]">{t.currency}</span>
                </>
              ) : (
                <span className="text-xs font-medium text-[#8C7A6B] italic">
                  {locale === "ar" ? "يحدد السعر في الإدارة" : "Price pending"}
                </span>
              )}
            </div>
          </div>

          {product.status === "published" && product.base_price > 0 && (
            <button
              onClick={handleQuickAdd}
              className="p-2.5 bg-[#FAF7F2] hover:bg-[#C8692F] text-[#291D11] hover:text-white rounded-full border border-[#E0D3C1] hover:border-[#C8692F] transition-all shadow-sm"
              title={t.products.addToCart}
              aria-label={t.products.addToCart}
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
    {quickOpen && <ProductQuickView product={product} onClose={closeQuick} />}
    </>
  );
}
