"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShippingArea, StoreSettings } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { submitCheckoutAction } from "./actions";
import {
  MapPin,
  CreditCard,
  Phone,
  Mail,
  User,
  FileText,
  AlertCircle,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

export function CheckoutClient({
  shippingAreas,
  settings,
}: {
  shippingAreas: ShippingArea[];
  settings: StoreSettings;
}) {
  const { locale, t } = useLanguage();
  const { items, subtotal, clearCart, isHydrated } = useCart();
  const router = useRouter();

  // Payment availability
  const isInstaPayConfigured = Boolean(
    settings.instapay_enabled &&
    settings.instapay_address &&
    settings.instapay_address.trim().length > 0
  );

  const isVodafoneCashConfigured = Boolean(
    settings.vodafone_cash_enabled &&
    settings.vodafone_cash_number &&
    settings.vodafone_cash_number.trim().length > 0 &&
    settings.vodafone_cash_number !== "01000000000"
  );

  const initialMethod = isInstaPayConfigured
    ? "instapay"
    : isVodafoneCashConfigured
    ? "vodafone_cash"
    : "cod";

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [shippingAreaId, setShippingAreaId] = useState<string>(
    shippingAreas.length > 0 ? shippingAreas[0].id : ""
  );
  const [shippingAddressDetailed, setShippingAddressDetailed] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [giftMessage, setGiftMessage] = useState("");
  const [giftWrapping, setGiftWrapping] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"instapay" | "vodafone_cash" | "cod">(initialMethod);

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const idempotencyKey = useRef("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");


  const selectedArea = shippingAreas.find((a) => a.id === shippingAreaId);
  const deliveryFee = selectedArea ? selectedArea.delivery_fee : 0;
  const grandTotal = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (items.length === 0) {
      setErrorMessage(locale === "ar" ? "سلة التسوق فارغة." : "Cart is empty.");
      return;
    }

    if (!shippingAreaId) {
      setErrorMessage(locale === "ar" ? "يرجى اختيار منطقة التوصيل في دمياط." : "Please select your Damietta delivery area.");
      return;
    }

    if (settings.require_email_at_checkout && !customerEmail.trim()) {
      setErrorMessage(locale === "ar" ? "البريد الإلكتروني مطلوب وفقاً لإعدادات المتجر." : "Email is required per store settings.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerName,
        customerPhone,
        customerEmail: customerEmail.trim() || undefined,
        shippingAreaId,
        shippingAddressDetailed,
        customerNotes: [customerNotes.trim(), giftMessage.trim() ? `رسالة الهدية / Gift message: ${giftMessage.trim()}` : "", giftWrapping ? "طلب تغليف هدية / Gift wrapping requested — التفاصيل والتكلفة تحتاج تأكيد المتجر" : ""].filter(Boolean).join("\n") || undefined,
        paymentMethod,
        idempotencyKey: idempotencyKey.current || (idempotencyKey.current = crypto.randomUUID()),
        items: items.map((i) => ({
          productId: i.product.id,
          variantId: i.variant?.id || null,
          quantity: i.quantity,
          customNote: i.customNote || null,
        })),
      };

      const res = await submitCheckoutAction(payload);

      if (res.success && res.orderId) {
        clearCart();
        router.push(`/order/${res.orderId}`);
      } else {
        setErrorMessage(res.error || "فشل إرسال الطلب. يرجى مراجعة البيانات.");
        setIsSubmitting(false);
      }
    } catch (err: unknown) {
      setErrorMessage((err instanceof Error ? err.message : "حدث خطأ غير متوقع") || "حدث خطأ غير متوقع في الشبكة.");
      setIsSubmitting(false);
    }
  };

  if (isHydrated && items.length === 0) {
    return (
      <div className="liquid-card bg-white rounded-3xl p-12 text-center border border-[#E8DED1] space-y-4 max-w-lg mx-auto shadow-warm-sm">
        <h3 className="font-serif text-2xl font-bold text-[#291D11]">{t.cart.empty}</h3>
        <p className="text-xs text-[#6E5F50]">
          {locale === "ar"
            ? "لا توجد منتجات في سلتك لإتمام الطلب."
            : "No items in cart to checkout."}
        </p>
        <Link
          href="/products"
          className="inline-block bg-[#C8692F] hover:bg-[#AF5722] text-white px-6 py-3 rounded-full text-xs font-bold transition-all shadow-xs"
        >
          {t.cart.startShopping}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Checkout Top Header Bar with Artique Brand & Back to Cart Link */}
      <div className="liquid-card bg-white rounded-3xl p-4 sm:p-6 border border-[#E8DED1] shadow-warm-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#C8692F]/20 bg-[#FAF7F2] shrink-0">
            <Image
              src="/demo-media/5415cb931ba250dc.webp"
              alt="Artique"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg sm:text-xl text-[#291D11]">
              {locale === "ar" ? "إتمام الطلب والتوصيل" : "Checkout & Delivery"}
            </h1>
            <p className="text-xs text-[#8A7968]">
              {locale === "ar" ? "مشغولات آرتيك اليدوية • محافظة دمياط" : "Artique Handmade Crafts • Damietta Governorate"}
            </p>
          </div>
        </div>

        <Link
          href="/cart"
          className="liquid-card inline-flex items-center gap-2 text-xs font-semibold text-[#6E5F50] hover:text-[#C8692F] bg-[#FAF7F2] hover:bg-[#F0EAE1] border border-[#E8DED1] px-4 py-2.5 rounded-2xl transition-all"
        >
          {locale === "ar" ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{locale === "ar" ? "العودة إلى سلة التسوق" : "Back to Shopping Cart"}</span>
          <span className="bg-[#C8692F] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {items.reduce((s, i) => s + i.quantity, 0)}
          </span>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* 1. Customer & Delivery Information Form */}
        <div className="lg:col-span-7 space-y-8">
        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-xs font-medium">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Section 1: Contact Details */}
        <div className="liquid-card bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DED1] shadow-warm-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F0E6D8]">
            <User className="w-5 h-5 text-[#C8692F]" />
            <h2 className="font-serif text-lg font-bold text-[#291D11]">
              {t.checkout.customerInfo}
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#291D11] mb-1.5">
                {t.checkout.fullName} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={locale === "ar" ? "أدخل اسمك ثلاثي أو ثنائي" : "Your full name"}
                className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl border border-[#E0D3C1] focus:border-[#C8692F] focus:bg-white text-sm outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#291D11] mb-1.5">
                  {t.checkout.phone} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="01012345678"
                  className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl border border-[#E0D3C1] focus:border-[#C8692F] focus:bg-white text-sm outline-none transition-all"
                />
                <span className="text-[10px] text-[#8C7A6B] mt-1 block">
                  {t.checkout.phoneHelp}
                </span>
              </div>

              <div>
                <label className="block font-bold text-[#291D11] mb-1.5">
                  {t.checkout.email}{" "}
                  {settings.require_email_at_checkout ? (
                    <span className="text-red-500">*</span>
                  ) : (
                    <span className="text-[#8C7A6B] font-normal">{t.checkout.emailOptional}</span>
                  )}
                </label>
                <input
                  type="email"
                  required={settings.require_email_at_checkout}
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-[#FAF7F2] rounded-xl border border-[#E0D3C1] focus:border-[#C8692F] focus:bg-white text-sm outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Damietta Delivery Area & Address */}
        <div className="liquid-card bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DED1] shadow-warm-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F0E6D8]">
            <MapPin className="w-5 h-5 text-[#C8692F]" />
            <h2 className="font-serif text-lg font-bold text-[#291D11]">
              {t.checkout.deliveryArea}
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            {/* Damietta Governorate Restriction Pill */}
            <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E0D3C1] text-[#7A7452] flex items-center gap-2 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#C8692F] shrink-0" />
              <span>{t.checkout.damiettaAlert}</span>
            </div>

            <div>
              <label className="block font-bold text-[#291D11] mb-1.5">
                {locale === "ar" ? "اختر المركز / المدينة في دمياط" : "Select Damietta Area"}{" "}
                <span className="text-red-500">*</span>
              </label>
              {shippingAreas.length > 0 ? (
                <select
                  required
                  value={shippingAreaId}
                  onChange={(e) => setShippingAreaId(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[#FAF7F2] rounded-xl border border-[#E0D3C1] focus:border-[#C8692F] focus:bg-white text-sm font-semibold text-[#291D11] outline-none cursor-pointer"
                >
                  {shippingAreas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {locale === "ar" ? area.name_ar : area.name_en} — ({area.delivery_fee} {t.currency})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-xs font-semibold">
                  {t.checkout.noShippingConfigured}
                </div>
              )}
              {selectedArea && <p className="text-[11px] text-[#8A7968] mt-2">{locale === "ar" ? `تقدير التوصيل: ${selectedArea.estimated_days_min}–${selectedArea.estimated_days_max} أيام بعد انتهاء تجهيز القطع.` : `Estimated delivery: ${selectedArea.estimated_days_min}–${selectedArea.estimated_days_max} days after the pieces are ready.`}</p>}
            </div>

            <div>
              <label className="block font-bold text-[#291D11] mb-1.5">
                {t.checkout.detailedAddress} <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={shippingAddressDetailed}
                onChange={(e) => setShippingAddressDetailed(e.target.value)}
                placeholder={t.checkout.detailedAddressPlaceholder}
                className="w-full p-4 bg-[#FAF7F2] rounded-xl border border-[#E0D3C1] focus:border-[#C8692F] focus:bg-white text-sm outline-none transition-all"
              />
            </div>

            <div>
              <label className="block font-bold text-[#291D11] mb-1.5">
                {t.checkout.notes}
              </label>
              <textarea
                rows={2}
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder={locale === "ar" ? "أي تعليمات بخصوص ميعاد الاستلام أو علامات مميزة..." : "Optional delivery instructions..."}
                className="w-full p-3 bg-[#FAF7F2] rounded-xl border border-[#E0D3C1] focus:border-[#C8692F] focus:bg-white text-xs outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Payment Method Selection */}
        <div className="liquid-card bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DED1] space-y-4">
          <h2 className="font-serif text-lg font-bold">{locale === "ar" ? "هدية لشخص مميز؟" : "A gift for someone special?"}</h2>
          <label className="block text-xs font-semibold">{locale === "ar" ? "رسالة الهدية (اختياري)" : "Gift message (optional)"}<textarea rows={2} maxLength={300} value={giftMessage} onChange={(event) => setGiftMessage(event.target.value)} className="mt-2 w-full border border-[#E0D3C1] rounded-xl p-3" placeholder={locale === "ar" ? "اكتب الرسالة التي تحب أن تصل مع هديتك…" : "Write a message for your gift…"} /></label>
          {settings.gift_wrap_available && <label className="flex gap-2 items-center text-xs"><input type="checkbox" checked={giftWrapping} onChange={(event) => setGiftWrapping(event.target.checked)} />{locale === "ar" ? "أرغب في تغليف هدية — التفاصيل والتكلفة بعد تأكيد المتجر" : "Request gift wrapping — details and cost confirmed by the shop"}</label>}
          <p className="text-[11px] text-[#8A7968]">{locale === "ar" ? "أي تجهيز إضافي يتم تأكيده معك قبل التنفيذ، ولا تُضاف رسوم تلقائيًا هنا." : "Additional preparation is confirmed with you before execution; no extra charge is added automatically here."}</p>
        </div>
        <div className="liquid-card bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DED1] shadow-warm-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F0E6D8]">
            <CreditCard className="w-5 h-5 text-[#C8692F]" />
            <h2 className="font-serif text-lg font-bold text-[#291D11]">
              {t.checkout.paymentMethod}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* InstaPay */}
            <label
              className={`liquid-option p-4 rounded-2xl border-2 flex flex-col justify-between gap-3 transition-all ${
                !isInstaPayConfigured
                  ? "border-[#E8DED1] bg-stone-50 opacity-60 cursor-not-allowed"
                  : paymentMethod === "instapay"
                  ? "border-[#C8692F] bg-[#FAF7F2] shadow-xs cursor-pointer"
                  : "border-[#E8DED1] bg-white hover:border-[#D9CBB7] cursor-pointer"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#291D11]">{t.checkout.instapay}</span>
                <input
                  type="radio"
                  name="payment"
                  disabled={!isInstaPayConfigured}
                  checked={paymentMethod === "instapay"}
                  onChange={() => setPaymentMethod("instapay")}
                  className="accent-[#C8692F] w-4 h-4"
                />
              </div>
              <span className="text-[11px] text-[#6E5F50]">
                {isInstaPayConfigured
                  ? locale === "ar"
                    ? "تحويل فوري عبر تطبيق InstaPay"
                    : "Direct transfer via InstaPay"
                  : locale === "ar"
                  ? "غير متاح حالياً"
                  : "Currently unavailable"}
              </span>
            </label>

            {/* Vodafone Cash */}
            <label
              className={`liquid-option p-4 rounded-2xl border-2 flex flex-col justify-between gap-3 transition-all ${
                !isVodafoneCashConfigured
                  ? "border-[#E8DED1] bg-stone-50 opacity-60 cursor-not-allowed"
                  : paymentMethod === "vodafone_cash"
                  ? "border-[#C8692F] bg-[#FAF7F2] shadow-xs cursor-pointer"
                  : "border-[#E8DED1] bg-white hover:border-[#D9CBB7] cursor-pointer"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#291D11]">{t.checkout.vodafoneCash}</span>
                <input
                  type="radio"
                  name="payment"
                  disabled={!isVodafoneCashConfigured}
                  checked={paymentMethod === "vodafone_cash"}
                  onChange={() => setPaymentMethod("vodafone_cash")}
                  className="accent-[#C8692F] w-4 h-4"
                />
              </div>
              <span className="text-[11px] text-[#6E5F50]">
                {isVodafoneCashConfigured
                  ? locale === "ar"
                    ? "تحويل لمحفظة فودافون كاش"
                    : "Vodafone Cash Wallet"
                  : locale === "ar"
                  ? "في انتظار إدخال الرقم من الإدارة"
                  : "Awaiting owner setup"}
              </span>
            </label>

            {/* COD */}
            <label
              className={`liquid-option p-4 rounded-2xl border-2 cursor-pointer flex flex-col justify-between gap-3 transition-all ${
                paymentMethod === "cod"
                  ? "border-[#C8692F] bg-[#FAF7F2] shadow-xs"
                  : "border-[#E8DED1] bg-white hover:border-[#D9CBB7]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#291D11]">{t.checkout.cod}</span>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="accent-[#C8692F] w-4 h-4"
                />
              </div>
              <span className="text-[11px] text-[#6E5F50]">
                {locale === "ar" ? "سداد نقدي عند الاستلام بدمياط" : "Cash on delivery in Damietta"}
              </span>
            </label>
          </div>

          {/* Payment Method Details Box with Copy Buttons */}
          <div className="liquid-card p-4 bg-[#FAF7F2] rounded-2xl border border-[#E0D3C1] text-xs text-[#6E5F50] space-y-3">
            {paymentMethod === "instapay" && (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#291D11]">
                    {locale === "ar" ? "بيانات التحويل عبر InstaPay:" : "InstaPay Transfer Details:"}
                  </span>
                  <span className="text-[10px] text-[#7A7452] bg-white px-2 py-0.5 rounded-md border border-[#E0D3C1]">
                    تحويل فوري
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-[#E0D3C1] flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-[#8C7A6B] block">
                      {locale === "ar" ? "عنوان الدفع اللحظي (IPA):" : "Payment Address:"}
                    </span>
                    <span className="font-mono font-bold text-sm text-[#291D11]" dir="ltr">
                      {settings.instapay_address}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(settings.instapay_address, "instapay")}
                    className="inline-flex items-center gap-1.5 text-xs bg-[#FAF7F2] hover:bg-[#F0EAE1] text-[#291D11] border border-[#E0D3C1] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedField === "instapay" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#C8692F]" />
                        <span>نسخ العنوان</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] leading-relaxed">
                  {settings.instapay_instructions_ar ||
                    "يرجى تحويل إجمالي المبلغ لحساب إنستاباي أعلاه، ثم رفع صورة إشعار التحويل من صفحة تأكيد الطلب لتسريع المراجعة."}
                </p>
              </>
            )}

            {paymentMethod === "vodafone_cash" && (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#291D11]">
                    {locale === "ar" ? "بيانات التحويل لمحفظة فودافون كاش:" : "Vodafone Cash Transfer Details:"}
                  </span>
                  <span className="text-[10px] text-[#7A7452] bg-white px-2 py-0.5 rounded-md border border-[#E0D3C1]">
                    محفظة إلكترونية
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-[#E0D3C1] flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-[#8C7A6B] block">
                      {locale === "ar" ? "رقم محفظة فودافون كاش:" : "Wallet Number:"}
                    </span>
                    <span className="font-mono font-bold text-sm text-[#291D11]" dir="ltr">
                      {settings.vodafone_cash_number}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(settings.vodafone_cash_number, "vodafone")}
                    className="inline-flex items-center gap-1.5 text-xs bg-[#FAF7F2] hover:bg-[#F0EAE1] text-[#291D11] border border-[#E0D3C1] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedField === "vodafone" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#C8692F]" />
                        <span>نسخ الرقم</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] leading-relaxed">
                  {settings.vodafone_cash_instructions_ar ||
                    "يرجى تحويل إجمالي المبلغ للرقم أعلاه، وإرفاق صورة رسالة التحويل من صفحة تأكيد الطلب للمراجعة."}
                </p>
              </>
            )}

            {paymentMethod === "cod" && (
              <>
                <span className="font-bold text-[#291D11] block">
                  {locale === "ar" ? "الدفع عند الاستلام داخل دمياط:" : "Cash On Delivery Notice:"}
                </span>
                <p>{t.checkout.codNotice}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Order Review & Final Total Sidebar */}
      <div className="liquid-card lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DED1] shadow-warm-sm space-y-6 sticky top-28">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0E6D8]">
          <h3 className="font-serif text-lg font-bold text-[#291D11]">
            {t.checkout.summary}
          </h3>
          <span className="text-xs text-[#8C7A6B]">
            {items.length} {locale === "ar" ? "مشغولات" : "items"}
          </span>
        </div>

        {/* Order Items Preview with Images & Variant Details */}
        <div className="max-h-72 overflow-y-auto divide-y divide-[#F0E6D8] pe-1">
          {items.map((item) => {
            const coverImg =
              item.product.images?.find((img) => img.is_cover)?.url ||
              item.product.images?.[0]?.url ||
              "/demo-media/5415cb931ba250dc.webp";

            return (
              <div key={item.id} className="py-3.5 flex gap-3 items-center text-xs">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#E8DED1] shrink-0">
                  <Image
                    src={coverImg}
                    alt={item.product.name_ar}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <span className="font-bold text-[#291D11] block truncate">
                    {locale === "ar" ? item.product.name_ar : item.product.name_en}
                  </span>
                  {item.variant && (
                    <span className="text-[11px] text-[#C8692F] font-semibold block">
                      {locale === "ar" ? item.variant.name_ar : item.variant.name_en}
                    </span>
                  )}
                  <span className="text-[#8C7A6B] block">
                    {item.quantity} × {item.unitPrice} {t.currency}
                  </span>
                  {item.customNote && (
                    <span className="text-[10px] text-[#7A7452] block italic bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#E8DED1] mt-1">
                      طلب خاص: {item.customNote}
                    </span>
                  )}
                </div>
                <span className="font-bold text-[#291D11] shrink-0">
                  {item.unitPrice * item.quantity} {t.currency}
                </span>
              </div>
            );
          })}
        </div>

        {/* Detailed Price Calculation */}
        <div className="pt-4 border-t border-[#F0E6D8] space-y-3 text-sm">
          <div className="flex justify-between text-[#6E5F50]">
            <span>{t.cart.subtotal}</span>
            <span className="font-bold text-[#291D11]">{subtotal} {t.currency}</span>
          </div>

          <div className="flex justify-between text-[#6E5F50]">
            <div className="flex flex-col">
              <span className="font-medium">{t.cart.shippingFee}</span>
              {selectedArea && (
                <span className="text-[11px] text-[#8C7A6B]">
                  {locale === "ar" ? selectedArea.name_ar : selectedArea.name_en} • مدة التوصيل {selectedArea.estimated_days_min}-{selectedArea.estimated_days_max} أيام
                </span>
              )}
            </div>
            <span className="font-bold text-[#7A7452]">{deliveryFee} {t.currency}</span>
          </div>

          <div className="pt-4 border-t border-[#F0E6D8] flex justify-between items-baseline font-serif">
            <span className="text-lg font-bold text-[#291D11]">{t.cart.total}</span>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-[#C8692F]">{grandTotal}</span>
              <span className="text-sm font-bold text-[#C8692F] ms-1">{t.currency}</span>
            </div>
          </div>
        </div>

        {/* Submit Order Button */}
        <button
          type="submit"
          disabled={isSubmitting || items.length === 0}
          className={`w-full py-4 px-6 rounded-full font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
            isSubmitting
              ? "bg-[#D9CBB7] text-[#6E5F50] cursor-wait"
              : "bg-[#C8692F] hover:bg-[#AF5722] text-white hover:shadow-lg"
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{t.checkout.submitting}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>{t.checkout.placeOrderBtn}</span>
            </>
          )}
        </button>

        <p className="text-[11px] text-[#8C7A6B] text-center leading-relaxed">
          بالضغط على تأكيد الطلب، يتم حفظ طلبكم وحجز المشغولات، وسيتم توجيهكم لصفحة التأكيد وتعليمات الدفع.
        </p>
      </div>
    </form>
  </div>
  );
}
