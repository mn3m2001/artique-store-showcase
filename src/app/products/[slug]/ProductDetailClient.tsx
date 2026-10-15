"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, ProductVariant } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  Truck,
  ZoomIn,
  X,
  ChevronRight,
  ChevronLeft,
  Info,
  ShieldCheck,
  Scissors,
  Layers,
  Heart,
} from "lucide-react";

export function ProductDetailClient({
  product,
  isDraftPreview = false,
}: {
  product: Product;
  isDraftPreview?: boolean;
}) {
  const { locale, t } = useLanguage();
  const { addItem } = useCart();

  const name = locale === "ar" ? product.name_ar : product.name_en;
  const description =
    locale === "ar" ? product.description_ar : product.description_en;
  const categoryName = product.category
    ? locale === "ar"
      ? product.category.name_ar
      : product.category.name_en
    : null;

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ id: "fallback", url: "/demo-media/5415cb931ba250dc.webp", sort_order: 1, is_cover: true }];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [customNote, setCustomNote] = useState("");
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [activeSpecTab, setActiveSpecTab] = useState<"craft" | "prep" | "care">("craft");

  // Determine current price
  const currentPrice =
    selectedVariant?.price_override && selectedVariant.price_override > 0
      ? selectedVariant.price_override
      : product.base_price;

  const handleAddToCart = () => {
    if (product.status !== "published" || currentPrice <= 0 || isDraftPreview) return;
    addItem(product, quantity, selectedVariant, customNote);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  const isAr = locale === "ar";

  return (
    <div className="atelier-purchase relative pb-24 lg:pb-8">
      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Close image zoom"
          >
            <X className="w-6 h-6" />
          </button>
          <div
            className="relative max-w-4xl max-h-[85vh] w-full h-[80vh] rounded-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[activeImageIndex]?.url}
              alt={name}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
        </div>
      )}

      {/* Bilingual Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-[#8C7A6B] font-medium mb-6">
        <Link href="/" className="hover:text-[#C8692F] transition-colors">
          {t.common.breadcrumb.home}
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-[#C8692F] transition-colors">
          {t.common.breadcrumb.shop}
        </Link>
        {categoryName && (
          <>
            <span>/</span>
            <Link
              href={`/products?category=${product.category?.slug}`}
              className="hover:text-[#C8692F] transition-colors"
            >
              {categoryName}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-[#291D11] font-bold line-clamp-1">{name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* 1. Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Image Stage */}
          <div className="liquid-card relative aspect-[4/5] sm:aspect-square w-full rounded-3xl overflow-hidden bg-white border border-[#E8DED1] shadow-warm-sm group">
            <Image
              src={images[activeImageIndex]?.url || "/demo-media/5415cb931ba250dc.webp"}
              alt={name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover object-center cursor-zoom-in transition-transform duration-500 group-hover:scale-102"
              onClick={() => setLightboxOpen(true)}
            />

            {/* Zoom Trigger Button */}
            <button
              onClick={() => setLightboxOpen(true)}
              className="absolute bottom-4 left-4 p-2.5 rounded-full bg-white/90 backdrop-blur-sm text-[#291D11] hover:text-[#C8692F] shadow-warm-xs border border-[#E8DED1] transition-all cursor-pointer opacity-90 hover:opacity-100"
              title="تكبير الصورة"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {/* Badges Overlay */}
            <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none">
              {product.is_made_to_order ? (
                <span className="inline-flex items-center gap-1.5 bg-[#291D11]/90 backdrop-blur-md text-[#FAF7F2] text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
                  <Clock className="w-3.5 h-3.5 text-[#C8692F]" />
                  <span>
                    {isAr
                      ? `تنفيذ بالطلب (تجهيز: ${product.preparation_days} أيام)`
                      : `Made to order (Crafting: ${product.preparation_days} days)`}
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-[#7A7452]/90 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
                  <Sparkles className="w-3.5 h-3.5 text-[#F6F1E7]" />
                  <span>{t.badges.readyMade}</span>
                </span>
              )}

              {product.status === "draft" && (
                <span className="bg-[#C8692F] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  {t.badges.draft}
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail Track */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? "border-[#C8692F] ring-2 ring-[#C8692F]/20 shadow-xs"
                      : "border-[#E0D3C1] opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Product Meta & Actions */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Category */}
            {categoryName && (
              <Link
                href={`/products?category=${product.category?.slug}`}
                className="inline-block text-xs font-bold text-[#C8692F] hover:underline"
              >
                {categoryName}
              </Link>
            )}

            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#291D11] leading-tight">
              {name}
            </h1>

            {/* Price Display */}
            <div className="flex items-baseline gap-2 pt-1">
              {currentPrice > 0 ? (
                <>
                  <span className="font-serif text-3xl sm:text-4xl font-extrabold text-[#291D11]">
                    {currentPrice}
                  </span>
                  <span className="text-sm font-bold text-[#C8692F]">{t.currency}</span>
                  {selectedVariant?.price_override && selectedVariant.price_override > product.base_price && (
                    <span className="text-xs text-[#8A7968] font-normal mr-2">
                      ({isAr ? "السعر الأساسي:" : "Base:"} {product.base_price} {t.currency})
                    </span>
                  )}
                </>
              ) : (
                <span className="text-sm font-semibold text-[#8C7A6B] italic">
                  {isAr
                    ? "السعر قيد المراجعة في لوحة التحكم"
                    : "Price will be set in admin dashboard"}
                </span>
              )}
            </div>

            {/* Description */}
            {description && (
              <p className="text-sm sm:text-base text-[#6E5F50] leading-relaxed pt-2 border-t border-[#E8DED1]">
                {description}
              </p>
            )}

            {/* Variants Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="pt-4 space-y-2">
                <label className="block text-xs font-bold text-[#291D11]">
                  {t.products.selectVariant}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const vName = isAr ? v.name_ar : v.name_en;

                    // Accurate price delta calculation to avoid misleading (+390) labels:
                    // If base is 280 and large is 390, delta is +110!
                    let deltaLabel = "";
                    if (v.price_override && v.price_override > 0) {
                      const diff = v.price_override - product.base_price;
                      if (diff > 0) {
                        deltaLabel = ` (+${diff} ${t.currency})`;
                      } else if (diff < 0) {
                        deltaLabel = ` (-${Math.abs(diff)} ${t.currency})`;
                      }
                    }

                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border cursor-pointer ${
                          isSelected
                            ? "bg-[#291D11] text-white border-[#291D11] shadow-warm-xs"
                            : "bg-white text-[#4A3B2C] border-[#E0D3C1] hover:border-[#C8692F]"
                        }`}
                      >
                        <span>{vName}</span>
                        {deltaLabel && (
                          <span className={isSelected ? "text-[#E8DED1]" : "text-[#C8692F]"}>
                            {deltaLabel}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom Notes */}
            {product.allow_custom_notes && (
              <div className="pt-2 space-y-1.5">
                <label className="block text-xs font-bold text-[#291D11]">
                  {t.products.customNotes}
                </label>
                <textarea
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder={t.products.customNotesPlaceholder}
                  rows={2}
                  className="liquid-card w-full p-3 bg-white rounded-2xl border border-[#E0D3C1] focus:border-[#C8692F] text-xs outline-none transition-all placeholder:text-[#8C7A6B]"
                />
              </div>
            )}

            {/* Desktop Quantity & Add to Cart */}
            <div className="pt-4 flex items-center gap-4">
              {/* Stepper */}
              <div className="flex items-center bg-white border border-[#E0D3C1] rounded-full p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-[#291D11] hover:bg-[#F3ECE1] transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-sm text-[#291D11]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-[#291D11] hover:bg-[#F3ECE1] transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.status !== "published" || currentPrice <= 0 || isDraftPreview}
                className={`flex-1 py-4 px-6 rounded-full font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  addedSuccess
                    ? "bg-[#7A7452] text-white shadow-lg"
                    : isDraftPreview
                    ? "bg-amber-100 text-amber-800 border border-amber-300 cursor-not-allowed"
                    : product.status === "published" && currentPrice > 0
                    ? "bg-[#C8692F] hover:bg-[#AF5722] text-white hover:shadow-lg"
                    : "bg-[#D9CBB7] text-[#6E5F50] cursor-not-allowed"
                }`}
              >
                {addedSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-white" />
                    <span>{isAr ? "تمت الإضافة للسلة بنجاح!" : "Added to Cart!"}</span>
                  </>
                ) : isDraftPreview ? (
                  <span>{isAr ? "معاينة مسودة (غير متاح للشراء)" : "Preview Only (Draft)"}</span>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>
                      {product.status === "published" && currentPrice > 0
                        ? t.products.addToCart
                        : isAr
                        ? "مسودة غير متاحة للشراء"
                        : "Draft piece unavailable"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Craft Specifications & Timeline Breakdown */}
          <div className="product-facts product-detail-facts"><span>{isAr ? "الخامة" : "Material"}<b>{(isAr ? product.material_ar : product.material_en) || (isAr ? "تُؤكد مع المتجر" : "Confirm with the shop")}</b></span><span>{isAr ? "المقاس" : "Dimensions"}<b>{(isAr ? product.dimensions_ar : product.dimensions_en) || (isAr ? "يُؤكد عند الطلب" : "Confirmed on request")}</b></span><span>{isAr ? "التجهيز" : "Preparation"}<b>{product.is_made_to_order ? `${product.preparation_days} ${isAr ? "أيام عمل" : "working days"}` : isAr ? "جاهزة للشحن" : "Ready to ship"}</b></span></div>
          <div className="pt-6 border-t border-[#E8DED1] space-y-4">
            {/* Tabs for specifications */}
            <div className="flex border-b border-[#E8DED1] text-xs">
              <button
                type="button"
                onClick={() => setActiveSpecTab("craft")}
                className={`pb-2.5 px-3 font-bold border-b-2 transition-colors cursor-pointer ${
                  activeSpecTab === "craft"
                    ? "border-[#C8692F] text-[#C8692F]"
                    : "border-transparent text-[#8A7968] hover:text-[#291D11]"
                }`}
              >
                {isAr ? "المواصفات والخامة" : "Specifications"}
              </button>
              <button
                type="button"
                onClick={() => setActiveSpecTab("prep")}
                className={`pb-2.5 px-3 font-bold border-b-2 transition-colors cursor-pointer ${
                  activeSpecTab === "prep"
                    ? "border-[#C8692F] text-[#C8692F]"
                    : "border-transparent text-[#8A7968] hover:text-[#291D11]"
                }`}
              >
                {isAr ? "التجهيز والتوصيل بدمياط" : "Timeline & Delivery"}
              </button>
              <button
                type="button"
                onClick={() => setActiveSpecTab("care")}
                className={`pb-2.5 px-3 font-bold border-b-2 transition-colors cursor-pointer ${
                  activeSpecTab === "care"
                    ? "border-[#C8692F] text-[#C8692F]"
                    : "border-transparent text-[#8A7968] hover:text-[#291D11]"
                }`}
              >
                {isAr ? "العناية بالغزل" : "Care Guide"}
              </button>
            </div>

            {/* Tab 1: Craft specs */}
            {activeSpecTab === "craft" && (
              <div className="liquid-card bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8DED1] space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#E8DED1]/60">
                  <span className="text-[#8A7968]">{isAr ? "نوع الخيوط / الخامة:" : "Material:"}</span>
                  <span className="font-bold text-[#291D11]">
                    {(isAr ? product.material_ar : product.material_en) || (isAr ? "تواصل معنا لتأكيد خامة هذه القطعة" : "Contact us to confirm this piece’s material")}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E8DED1]/60">
                  <span className="text-[#8A7968]">{isAr ? "الأبعاد والمقاس:" : "Dimensions:"}</span>
                  <span className="font-bold text-[#291D11]">
                    {(isAr ? product.dimensions_ar : product.dimensions_en) || (isAr ? "يُؤكد المقاس مع المتجر قبل التنفيذ" : "Confirm the size with the shop before preparation")}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#8A7968]">{isAr ? "بلد الصنع:" : "Origin:"}</span>
                  <span className="font-bold text-[#291D11]">{isAr ? "محافظة دمياط، مصر" : "Damietta, Egypt"}</span>
                </div>
              </div>
            )}

            {/* Tab 2: Clear distinction between Preparation Time and Delivery Time */}
            {activeSpecTab === "prep" && (
              <div className="liquid-card bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8DED1] space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#C8692F] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#291D11] block">
                      {isAr ? "1. مدة الحياكة والتجهيز اليدوي:" : "1. Handcrafting & Prep Time:"}
                    </span>
                    <p className="text-[#6E5F50] leading-relaxed mt-0.5">
                      {product.is_made_to_order
                        ? isAr
                          ? `تستغرق صناعة هذه القطعة ${product.preparation_days} أيام عمل بعد تأكيد طلبك.`
                          : `Handcrafted in ${product.preparation_days} crafting days upon order confirmation.`
                        : isAr
                        ? "هذه القطعة جاهزة للتسليم الفوري في المخزون."
                        : "Ready to ship immediately from stock."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-2 border-t border-[#E8DED1]/60">
                  <Truck className="w-4 h-4 text-[#7A7452] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#291D11] block">
                      {isAr ? "2. مدة التوصيل داخل محافظة دمياط:" : "2. Damietta Delivery:"}
                    </span>
                    <p className="text-[#6E5F50] leading-relaxed mt-0.5">
                      {isAr
                        ? "مدة ورسوم التوصيل حسب المنطقة المختارة عند إتمام الطلب، وتُحسب بعد انتهاء التجهيز."
                        : "Delivery time and fee depend on the area selected at checkout, after preparation is complete."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Care Guide */}
            {activeSpecTab === "care" && (
              <div className="liquid-card bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8DED1] space-y-2 text-xs text-[#6E5F50] leading-relaxed">
                <p>
                  {(isAr ? product.care_instructions_ar : product.care_instructions_en) || (isAr
                    ? "اطلب من المتجر تعليمات العناية المناسبة لخامة هذه القطعة قبل غسلها."
                    : "Ask the shop for care instructions specific to this piece’s material before washing.")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Mobile Buy Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md p-3.5 border-t border-[#E8DED1] z-40 flex items-center justify-between gap-3 shadow-warm-lg">
        <div className="shrink-0">
          <span className="text-[11px] text-[#8A7968] block">
            {isAr ? "الإجمالي" : "Total"}
          </span>
          <span className="font-serif font-extrabold text-lg text-[#291D11]">
            {currentPrice > 0 ? `${currentPrice * quantity} ${t.currency}` : "—"}
          </span>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.status !== "published" || currentPrice <= 0 || isDraftPreview}
          className={`flex-1 py-3 px-5 rounded-full font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
            addedSuccess
              ? "bg-[#7A7452] text-white"
              : isDraftPreview
              ? "bg-amber-100 text-amber-800"
              : product.status === "published" && currentPrice > 0
              ? "bg-[#C8692F] text-white"
              : "bg-[#D9CBB7] text-[#6E5F50]"
          }`}
        >
          {addedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>{isAr ? "تمت الإضافة!" : "Added!"}</span>
            </>
          ) : isDraftPreview ? (
            <span>{isAr ? "معاينة مسودة" : "Draft Preview"}</span>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>{t.products.addToCart}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
