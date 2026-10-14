"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ShoppingBag, Check } from "lucide-react";
import { Product } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { KineticScrambleText } from "./KineticScrambleText";

export function KineticProductCard({
  product,
}: {
  product: Product;
}) {
  const { locale, t } = useLanguage();
  const ar = locale === "ar";
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const name = ar ? product.name_ar : product.name_en;
  const coverImage =
    product.images?.find((img) => img.is_cover)?.url ||
    product.images?.[0]?.url ||
    "/demo-media/58bb70d638680ec1.webp";

  // Simulated slightly higher old price for discount visual flair if published
  const oldPrice = product.base_price > 0 ? Math.round(product.base_price * 1.2) : null;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.status === "published" && product.base_price > 0) {
      addItem(product, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const tagLabel = product.category_id ? `#${product.category_id}` : "#artique";

  return (
    <article className="k-showcase-card" data-cursor="ring">
      {/* Top Header: Title & Prices */}
      <div className="k-card-header">
        <Link href={`/products/${product.slug}`} className="hover:text-[#FF3B1F] transition-colors">
          <h3 className="k-card-title">{name}</h3>
        </Link>

        <div className="k-card-prices">
          {oldPrice && <span className="k-card-price-old">{oldPrice} EGP</span>}
          <span className="k-card-price-current">
            {product.base_price} <span className="text-xs">{ar ? "ج.م" : "EGP"}</span>
          </span>
        </div>
      </div>

      {/* The Signature WPKoi Long Preview Viewport */}
      <Link
        href={`/products/${product.slug}`}
        className="k-card-preview-viewport group"
        data-cursor="view"
      >
        <Image
          src={coverImage}
          alt={name}
          width={600}
          height={800}
          className="k-card-preview-img"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Floating Badges */}
        <div className="k-card-badges">
          <span className="k-card-badge">
            {product.is_made_to_order
              ? ar ? "صُنع حسب الطلب" : "MADE TO ORDER"
              : ar ? "جاهز للتسليم" : "READY TO SHIP"}
          </span>
          {product.is_featured && (
            <span className="k-card-badge text-[#FFCC19] border-[#FFCC19]/40">
              {ar ? "مختار للأتيليه" : "ATELIER PICK"}
            </span>
          )}
        </div>

        {/* Quick Add Button on Image Hover */}
        <button
          onClick={handleQuickAdd}
          className="absolute bottom-4 right-4 z-10 bg-[#FF3B1F] text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-lg hover:scale-110 cursor-pointer"
          aria-label={ar ? "إضافة سريعة إلى السلة" : "Quick add to cart"}
        >
          {added ? <Check className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
        </button>
      </Link>

      {/* Footer: Scramble Tags & Explore Link */}
      <div className="k-card-footer">
        <div className="k-card-tags">
          <KineticScrambleText text={tagLabel} />
          <KineticScrambleText text="#damietta" />
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="k-card-explore-link"
        >
          <span>{ar ? "استكشف" : "EXPLORE"}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}
