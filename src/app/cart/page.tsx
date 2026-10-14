"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import {
  ShoppingBag,
  Trash2,
  ArrowLeft,
  MapPin,
} from "lucide-react";

export default function CartPage() {
  const { locale, t } = useLanguage();
  const { items, updateQuantity, removeItem, clearCart, subtotal, isHydrated } = useCart();

  return (
    <div className="atelier-purchase flex-1 flex flex-col min-h-screen bg-[#FAF7F2]">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C8692F]">
            {locale === "ar" ? "سلة التسوق" : "Shopping bag"}
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#291D11]">
            {t.cart.title}
          </h1>
        </div>

        {!isHydrated ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E8DED1] shadow-warm-sm animate-pulse space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center pb-4 border-b border-[#F0E6D8]">
              <div className="h-5 w-32 bg-[#FAF7F2] rounded-xl" />
              <div className="h-4 w-20 bg-[#FAF7F2] rounded-lg" />
            </div>
            <div className="space-y-4">
              <div className="h-24 bg-[#FAF7F2] rounded-2xl" />
              <div className="h-24 bg-[#FAF7F2] rounded-2xl" />
            </div>
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Items List */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DED1] shadow-warm-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#F0E6D8]">
                <span className="text-xs font-bold text-[#8C7A6B]">
                  {items.length} {items.length > 1 ? t.cart.items : t.cart.item}
                </span>
                <button
                  onClick={clearCart}
                  className="text-xs font-semibold text-[#8C7A6B] hover:text-[#C8692F] transition-colors"
                >
                  {t.cart.clear}
                </button>
              </div>

              <div className="divide-y divide-[#F0E6D8]">
                {items.map((item) => {
                  const name = locale === "ar" ? item.product.name_ar : item.product.name_en;
                  const variantName = item.variant
                    ? locale === "ar"
                      ? item.variant.name_ar
                      : item.variant.name_en
                    : null;
                  const coverImage =
                    item.product.images?.find((img) => img.is_cover)?.url ||
                    item.product.images?.[0]?.url ||
                    "/demo-media/5415cb931ba250dc.webp";

                  return (
                    <div key={item.id} className="py-5 flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-center justify-between">
                      <div className="flex gap-4 items-center">
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-[#F3ECE1] border border-[#E8DED1] shrink-0">
                          <Image src={coverImage} alt={name} fill sizes="80px" className="object-cover" />
                        </div>
                        <div className="space-y-1">
                          <Link href={`/products/${item.product.slug}`} className="font-serif font-bold text-[#291D11] hover:text-[#C8692F] transition-colors text-base line-clamp-1">
                            {name}
                          </Link>
                          {variantName && (
                            <span className="text-xs font-semibold text-[#8C7A6B] block">
                              {variantName}
                            </span>
                          )}
                          {item.customNote && (
                            <span className="text-xs text-[#7A7452] bg-[#F3ECE1] px-2 py-0.5 rounded-md inline-block">
                              {locale === "ar" ? `ملاحظة: ${item.customNote}` : `Note: ${item.customNote}`}
                            </span>
                          )}
                          <div className="text-sm font-bold text-[#291D11] pt-1">
                            {item.unitPrice} <span className="text-xs font-semibold text-[#C8692F]">{t.currency}</span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity & Delete */}
                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="flex items-center bg-[#FAF7F2] border border-[#E0D3C1] rounded-full p-1">
                          <button
                            aria-label={locale === "ar" ? `تقليل كمية ${name}` : `Decrease quantity of ${name}`}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-[#291D11] hover:bg-white transition-colors"
                          >
                            -
                          </button>
                          <span aria-live="polite" className="w-8 text-center text-xs font-bold text-[#291D11]">
                            {item.quantity}
                          </span>
                          <button
                            aria-label={locale === "ar" ? `زيادة كمية ${name}` : `Increase quantity of ${name}`}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-[#291D11] hover:bg-white transition-colors"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-[#8C7A6B] hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                          title={t.cart.remove}
                          aria-label={`${t.cart.remove}: ${name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DED1] shadow-warm-sm space-y-6">
              <h3 className="font-serif text-lg font-bold text-[#291D11] pb-3 border-b border-[#F0E6D8]">
                {t.checkout.summary}
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[#6E5F50]">
                  <span>{t.cart.subtotal}</span>
                  <span className="font-bold text-[#291D11]">{subtotal} {t.currency}</span>
                </div>
                <div className="flex justify-between text-[#6E5F50] text-xs">
                  <span>{t.cart.shippingFee}</span>
                  <span className="text-[#7A7452] font-semibold">{t.cart.shippingCalculatedAtCheckout}</span>
                </div>
                <div className="pt-3 border-t border-[#F0E6D8] flex justify-between items-baseline font-serif">
                  <span className="text-base font-bold text-[#291D11]">{t.cart.total}</span>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-[#C8692F]">{subtotal}</span>
                    <span className="text-xs font-bold text-[#C8692F] ms-1">{t.currency}</span>
                    <span className="text-[10px] text-[#8C7A6B] block font-sans">
                      {locale === "ar" ? "+ رسوم التوصيل لمدينتك" : "+ area delivery fee"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Damietta Delivery Notice */}
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8DED1] text-xs text-[#7A7452] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#291D11]">
                  <MapPin className="w-3.5 h-3.5 text-[#C8692F]" />
                  <span>{locale === "ar" ? "توصيل دمياط" : "Damietta delivery"}</span>
                </div>
                <p className="leading-relaxed">
                  {locale === "ar"
                    ? "يتم التوصيل لجميع مناطق دمياط (دمياط الجديدة، رأس البر، كفر سعد، فارسكور، وباقي المراكز)."
                    : "Delivery across Damietta, including New Damietta, Ras El Bar, Kafr Saad, Faraskour and surrounding areas."}
                </p>
              </div>

              <Link
                href="/checkout"
                className="w-full py-4 px-6 bg-[#C8692F] hover:bg-[#AF5722] text-white rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>{t.cart.checkoutBtn}</span>
                <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 sm:p-16 text-center border border-[#E8DED1] space-y-4 max-w-xl mx-auto shadow-warm-sm">
            <div className="w-16 h-16 rounded-full bg-[#F3ECE1] mx-auto flex items-center justify-center text-[#C8692F]">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#291D11]">{t.cart.empty}</h3>
            <p className="text-xs text-[#6E5F50] leading-relaxed">
              {locale === "ar"
                ? "تصفح أحدث المشغولات اليدوية وأضف ما يعجبك إلى السلة."
                : "Browse our latest handcrafted crochet pieces and pick your favorites."}
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-[#291D11] hover:bg-[#3D2C1C] text-white px-7 py-3.5 rounded-full text-xs font-bold transition-all shadow-xs"
              >
                <span>{t.cart.startShopping}</span>
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
