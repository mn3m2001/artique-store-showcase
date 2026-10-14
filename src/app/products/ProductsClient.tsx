"use client";

import React, { useState, useMemo } from "react";
import { Category, Product } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { ProductCard } from "@/components/products/ProductCard";
import Image from "next/image";
import Link from "next/link";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";

export function ProductsClient({
  initialProducts,
  categories,
  initialCategorySlug = "",
  enable3D = true,
}: {
  initialProducts: Product[];
  categories: Category[];
  initialCategorySlug?: string;
  enable3D?: boolean;
}) {
  const { locale, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategorySlug);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc">("newest");
  const [typeFilter, setTypeFilter] = useState<"all" | "ready" | "made_to_order">("all");

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      // Category filter
      if (selectedCategory) {
        const cat = categories.find((c) => c.slug === selectedCategory);
        if (cat && product.category_id !== cat.id) return false;
      }

      // Ready-made vs Made-to-order filter
      if (typeFilter === "ready" && product.is_made_to_order) return false;
      if (typeFilter === "made_to_order" && !product.is_made_to_order) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchAr = product.name_ar.toLowerCase().includes(q) || product.description_ar.toLowerCase().includes(q);
        const matchEn = product.name_en.toLowerCase().includes(q) || product.description_en.toLowerCase().includes(q);
        if (!matchAr && !matchEn) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "price_asc") return a.base_price - b.base_price;
      if (sortBy === "price_desc") return b.base_price - a.base_price;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [initialProducts, categories, selectedCategory, typeFilter, searchQuery, sortBy]);

  return (
    <div className="atelier-catalog space-y-8">
      {/* Bilingual Catalog Heading */}
      <div className="atelier-catalog-heading">
      <div className="space-y-2 text-center sm:text-start">
        <span className="text-xs font-bold uppercase tracking-wider text-[#C8692F]">
          {locale === "ar" ? "متجر المشغولات اليدوية" : "Artisan Handmade Shop"}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#291D11]">
          {locale === "ar" ? "كافة إبداعات آرتيك" : "All Artique Creations"}
        </h1>
        <p className="text-sm text-[#6E5F50] max-w-2xl">
          {locale === "ar"
            ? "كل قطعة تم نسجها يدوياً بخيوط مختارة بعناية. اختر من القطع الجاهزة للتسليم الفوري أو اطلب تفصيل قطعتك الخاصة بألوانك المفضلة."
            : "Every piece is handcrafted stitch by stitch with carefully sourced yarns. Choose ready-to-ship keepsakes or order custom pieces in your favorite palette."}
        </p>
      </div>

      <div className="atelier-catalog-visual">
        {initialProducts.slice(0, 2).map((product, index) => <div key={product.id} className={`atelier-catalog-photo photo-${index}`}><Image src={product.images?.find((image) => image.is_cover)?.url || product.images?.[0]?.url || "/demo-media/logo-67c9bd5fb43debcf.png"} alt={locale === "ar" ? product.name_ar : product.name_en} fill sizes="180px" className="object-cover" /></div>)}
        <Link href="/" className="atelier-text-link">{locale === "ar" ? enable3D ? "ارجع إلى الأتيليه التفاعلي ↗" : "ارجع إلى أتيليه آرتيك ↗" : "Back to the Artique atelier ↗"}</Link>
      </div>
      </div>
      {/* Search & Filter Header Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E8DED1] shadow-warm-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-[#8C7A6B] absolute top-1/2 -translate-y-1/2 start-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.products.searchPlaceholder}
              className="w-full ps-11 pe-4 py-3 bg-[#FAF7F2] rounded-xl border border-[#E0D3C1] focus:border-[#C8692F] focus:bg-white text-sm outline-none transition-all placeholder:text-[#8C7A6B]"
            />
          </div>

          {/* Type Filter (All / Ready / Made to Order) */}
          <div className="md:col-span-3 flex items-center bg-[#FAF7F2] p-1 rounded-xl border border-[#E0D3C1]">
            <button
              onClick={() => setTypeFilter("all")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                typeFilter === "all" ? "bg-white text-[#291D11] shadow-xs" : "text-[#6E5F50]"
              }`}
            >
              {t.products.filterAll}
            </button>
            <button
              onClick={() => setTypeFilter("ready")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                typeFilter === "ready" ? "bg-white text-[#291D11] shadow-xs" : "text-[#6E5F50]"
              }`}
            >
              {t.badges.readyMade}
            </button>
            <button
              onClick={() => setTypeFilter("made_to_order")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                typeFilter === "made_to_order" ? "bg-white text-[#291D11] shadow-xs" : "text-[#6E5F50]"
              }`}
            >
              {t.badges.madeToOrder}
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-3 flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "price_asc" | "price_desc")}
              className="w-full py-3 px-3 bg-[#FAF7F2] rounded-xl border border-[#E0D3C1] focus:border-[#C8692F] text-xs font-semibold text-[#291D11] outline-none cursor-pointer"
            >
              <option value="newest">{t.products.sortNewest}</option>
              <option value="price_asc">{t.products.sortPriceAsc}</option>
              <option value="price_desc">{t.products.sortPriceDesc}</option>
            </select>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("")}
            className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all ${
              selectedCategory === ""
                ? "bg-[#C8692F] text-white shadow-xs"
                : "bg-[#FAF7F2] text-[#6E5F50] hover:bg-[#F3ECE1] border border-[#E0D3C1]"
            }`}
          >
            {t.products.filterAll}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.slug)}
              className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all ${
                selectedCategory === c.slug
                  ? "bg-[#C8692F] text-white shadow-xs"
                  : "bg-[#FAF7F2] text-[#6E5F50] hover:bg-[#F3ECE1] border border-[#E0D3C1]"
              }`}
            >
              {locale === "ar" ? c.name_ar : c.name_en}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-semibold text-[#6E5F50] px-1">
        <span>
          {locale === "ar"
            ? `عرض ${filteredProducts.length} قطعة من المشغولات`
            : `Showing ${filteredProducts.length} craft items`}
        </span>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-16 text-center border border-[#E8DED1] space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#F3ECE1] mx-auto flex items-center justify-center text-[#C8692F]">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#291D11]">{t.products.noProducts}</h3>
          <p className="text-xs text-[#6E5F50]">
            {locale === "ar"
              ? "جرب إزالة كلمات البحث أو تصفية تصنيف مختلف."
              : "Try adjusting your search query or selecting a different category."}
          </p>
        </div>
      )}
    </div>
  );
}
