"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Order, StoreSettings } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { uploadPaymentProofAction } from "./actions";
import {
  CheckCircle2,
  Copy,
  MessageCircle,
  Clock,
  Truck,
  CreditCard,
  MapPin,
  Upload,
  AlertTriangle,
  FileCheck,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import { InstagramIcon } from "@/components/common/InstagramIcon";

export function OrderClient({
  order,
  settings,
}: {
  order: Order;
  settings: StoreSettings;
}) {
  const { locale, t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const isAr = locale === "ar";

  // Fulfillment status labels & badges
  const fulfillmentStatusMap: Record<
    string,
    { labelAr: string; labelEn: string; color: string; bg: string }
  > = {
    new: {
      labelAr: "طلب جديد",
      labelEn: "New Order",
      color: "text-amber-800",
      bg: "bg-amber-50 border-amber-200",
    },
    confirmed: {
      labelAr: "تم التأكيد",
      labelEn: "Confirmed",
      color: "text-blue-800",
      bg: "bg-blue-50 border-blue-200",
    },
    preparing: {
      labelAr: "قيد التجهيز يدوياً",
      labelEn: "Preparing Craft",
      color: "text-purple-800",
      bg: "bg-purple-50 border-purple-200",
    },
    shipped: {
      labelAr: "تم الشحن مع المندوب",
      labelEn: "Out for Delivery",
      color: "text-indigo-800",
      bg: "bg-indigo-50 border-indigo-200",
    },
    delivered: {
      labelAr: "تم التوصيل بنجاح",
      labelEn: "Delivered",
      color: "text-emerald-800",
      bg: "bg-emerald-50 border-emerald-200",
    },
    cancelled: {
      labelAr: "تم الإلغاء",
      labelEn: "Cancelled",
      color: "text-rose-800",
      bg: "bg-rose-50 border-rose-200",
    },
  };

  // Payment status labels & badges
  const paymentStatusMap: Record<
    string,
    { labelAr: string; labelEn: string; color: string; bg: string }
  > = {
    unpaid: {
      labelAr: "بانتظار التحصيل عند الاستلام",
      labelEn: "Unpaid (Due on Delivery)",
      color: "text-stone-800",
      bg: "bg-stone-100 border-stone-200",
    },
    awaiting_proof: {
      labelAr: "بانتظار رفع إشعار التحويل",
      labelEn: "Awaiting Receipt Upload",
      color: "text-amber-800",
      bg: "bg-amber-50 border-amber-300",
    },
    awaiting_review: {
      labelAr: "بانتظار المراجعة اليدوية من الإدارة",
      labelEn: "Awaiting Manual Review",
      color: "text-blue-800",
      bg: "bg-blue-50 border-blue-300",
    },
    verified: {
      labelAr: "تم التحقق والسداد بنجاح",
      labelEn: "Verified & Paid",
      color: "text-emerald-800",
      bg: "bg-emerald-50 border-emerald-200",
    },
    paid: {
      labelAr: "تم تأكيد الدفع بنجاح",
      labelEn: "Payment Verified",
      color: "text-emerald-800",
      bg: "bg-emerald-50 border-emerald-200",
    },
    rejected: {
      labelAr: "إشعار مرفوض (يرجى إعادة الرفع)",
      labelEn: "Receipt Rejected (Please re-upload)",
      color: "text-rose-800",
      bg: "bg-rose-50 border-rose-300",
    },
    refunded: {
      labelAr: "مسترجع",
      labelEn: "Refunded",
      color: "text-purple-800",
      bg: "bg-purple-50 border-purple-200",
    },
  };

  const currentFulfillment =
    fulfillmentStatusMap[order.fulfillment_status] || fulfillmentStatusMap.new;
  const currentPayment =
    paymentStatusMap[order.payment_status] || paymentStatusMap.unpaid;

  // Build copyable order summary
  const orderSummaryText = isAr
    ? `🧶 طلب جديد من متجر آرتيك (Artique)
رقم الطلب: ${order.order_number}
اسم العميل: ${order.customer_name}
رقم الهاتف: ${order.customer_phone}
منطقة التوصيل: محافظة دمياط - ${order.shipping_area_name_ar}
العنوان التفصيلي: ${order.shipping_address_detailed}
${order.customer_notes ? `ملاحظات: ${order.customer_notes}\n` : ""}
المنتجات:
${(order.items || [])
  .map(
    (item) =>
      `- ${item.product_name_ar}${
        item.variant_name_ar ? ` (${item.variant_name_ar})` : ""
      } × ${item.quantity} = ${item.unit_price * item.quantity} ج.م`
  )
  .join("\n")}

قيمة المنتجات: ${order.subtotal_amount} ج.م
رسوم التوصيل: ${order.delivery_fee} ج.م
الإجمالي الكلي: ${order.total_amount} ج.م
طريقة الدفع: ${
        order.payment_method === "instapay"
          ? "إنستاباي (InstaPay)"
          : order.payment_method === "vodafone_cash"
          ? "فودافون كاش (Vodafone Cash)"
          : "الدفع نقداً عند الاستلام"
      }`
    : `🧶 Order from Artique
Order Ref: ${order.order_number}
Customer: ${order.customer_name}
Phone: ${order.customer_phone}
Delivery: Damietta - ${order.shipping_area_name_en}
Address: ${order.shipping_address_detailed}
${order.customer_notes ? `Notes: ${order.customer_notes}\n` : ""}
Items:
${(order.items || [])
  .map(
    (item) =>
      `- ${item.product_name_en}${
        item.variant_name_en ? ` (${item.variant_name_en})` : ""
      } x ${item.quantity} = ${item.unit_price * item.quantity} EGP`
  )
  .join("\n")}

Subtotal: ${order.subtotal_amount} EGP
Delivery Fee: ${order.delivery_fee} EGP
Total: ${order.total_amount} EGP
Payment Method: ${
        order.payment_method === "instapay"
          ? "InstaPay"
          : order.payment_method === "vodafone_cash"
          ? "Vodafone Cash"
          : "Cash on Delivery"
      }`;

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(orderSummaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
    }
  };

  const handleUploadProof = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadError("");
    setUploadSuccess(false);

    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("proofFile") as HTMLInputElement;

    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      setUploadError(
        isAr ? "يرجى اختيار صورة الإشعار أولاً." : "Please select a proof image."
      );
      return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("orderId", order.id);
    formData.append("file", file);

    setUploading(true);

    try {
      const res = await uploadPaymentProofAction(formData);
      if (res.success) {
        setUploadSuccess(true);
        form.reset();
        // Page will refresh automatically via revalidatePath
      } else {
        setUploadError(res.error || "فشل رفع الإشعار.");
      }
    } catch (err: unknown) {
      setUploadError((err instanceof Error ? err.message : "حدث خطأ غير متوقع") || "حدث خطأ أثناء الرفع.");
    } finally {
      setUploading(false);
    }
  };

  // WhatsApp link if configured and enabled
  const whatsappUrl =
    settings.whatsapp_enabled && settings.whatsapp_phone
      ? `https://wa.me/2${settings.whatsapp_phone.replace(/\D/g, "")}?text=${encodeURIComponent(
          orderSummaryText
        )}`
      : null;

  const instagramUrl = settings.instagram_url || "https://www.instagram.com/artique_11/";

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#8A7968]">
        <Link href="/" className="hover:text-[#C8692F] transition-colors">
          {t.nav.home}
        </Link>
        <span>/</span>
        <span className="text-[#291D11] font-semibold">
          {isAr ? "تفاصيل الطلب" : "Order Confirmation"}
        </span>
      </div>

      {/* Main Order Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DED1] shadow-warm-sm text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-[#C8692F] via-[#B8862B] to-[#7A7452]" />

        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#291D11]">
          {isAr ? "تم استلام طلبك بنجاح!" : "Thank You! Order Received"}
        </h1>
        <p className="text-sm text-[#6E5F50] mt-2 max-w-xl mx-auto">
          {isAr
            ? "شكراً لثقتك في آرتيك ودعمك للمشغولات اليدوية المصرية. تم تسجيل طلبك وسنبدأ تجهيزه بعناية."
            : "Thank you for supporting handcrafted Artique pieces. Your order is registered and will be crafted with care."}
        </p>

        {/* Order Reference Badge */}
        <div className="mt-6 inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-4 bg-[#FAF7F2] px-6 py-3 rounded-2xl border border-[#E8DED1]">
          <span className="text-xs text-[#8A7968] font-medium">
            {isAr ? "رقم الطلب المرجعي:" : "Order Reference:"}
          </span>
          <span className="font-mono text-xl font-bold text-[#C8692F] tracking-wider">
            {order.order_number}
          </span>
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 text-xs bg-white text-[#291D11] hover:text-[#C8692F] px-3 py-1.5 rounded-lg border border-[#E8DED1] transition-colors shadow-2xs font-medium cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">
                  {isAr ? "تم النسخ!" : "Copied!"}
                </span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{isAr ? "نسخ ملخص الطلب" : "Copy Summary"}</span>
              </>
            )}
          </button>
        </div>

        {/* Status Badges */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto text-xs">
          <div
            className={`p-3 rounded-xl border flex flex-col items-center gap-1 ${currentFulfillment.bg}`}
          >
            <span className="text-[11px] text-[#8A7968]">
              {isAr ? "حالة تنفيذ الطلب" : "Fulfillment Status"}
            </span>
            <span className={`font-bold ${currentFulfillment.color}`}>
              {isAr ? currentFulfillment.labelAr : currentFulfillment.labelEn}
            </span>
          </div>

          <div
            className={`p-3 rounded-xl border flex flex-col items-center gap-1 ${currentPayment.bg}`}
          >
            <span className="text-[11px] text-[#8A7968]">
              {isAr ? "حالة الدفع" : "Payment Status"}
            </span>
            <span className={`font-bold ${currentPayment.color}`}>
              {isAr ? currentPayment.labelAr : currentPayment.labelEn}
            </span>
          </div>
        </div>
      </div>

      {/* Communications / Contact Channels (Instagram & WhatsApp) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DED1] shadow-warm-sm space-y-4">
        <h2 className="font-serif text-lg font-bold text-[#291D11] flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-[#C8692F]" />
          {isAr
            ? "التواصل مع صانعة القطع ومتابعة الطلب"
            : "Connect with the Crafter"}
        </h2>

        <p className="text-xs sm:text-sm text-[#6E5F50] leading-relaxed">
          {isAr
            ? "قناتنا الأساسية للتواصل المباشر هي منصة إنستغرام. لتأكيد طلبك أو الاستفسار عن تفاصيل التخصيص والألوان، يرجى الضغط على زر إنستغرام ونسخ رقم الطلب لإرساله في رسالة خاصة."
            : "Our primary direct communication channel is Instagram. To confirm your order or discuss color customization, click Instagram and paste your order reference in a DM."}
        </p>

        {/* Clarification Alert */}
        <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8DED1] text-xs text-[#8A7968] flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-[#B8862B] shrink-0 mt-0.5" />
          <p>
            {isAr
              ? "ملاحظة هامة: الضغط على زر إنستغرام يفتح صفحة حساب آرتيك (@artique_11) ولا يرسل رسالة تلقائية بدون كتابتك. يرجى لصق رقم الطلب المنسوخ أعلاه في محادثتك."
              : "Important note: Clicking the Instagram button opens Artique's official profile page (@artique_11). It does not send an automatic message; please paste your copied order number in your message."}
          </p>
        </div>

        <div className="pt-2 flex flex-wrap gap-3">
          {/* Instagram Button */}
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[200px] flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white font-medium py-3 px-5 rounded-2xl text-xs sm:text-sm hover:opacity-95 transition-opacity shadow-warm-sm"
          >
            <InstagramIcon className="w-4 h-4" />
            <span>
              {isAr ? "مراسلة آرتيك على إنستغرام" : "Message on Instagram"}
            </span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>

          {/* WhatsApp Button (Only shown if configured and enabled) */}
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[200px] flex items-center justify-center gap-2.5 bg-[#25D366] text-white font-medium py-3 px-5 rounded-2xl text-xs sm:text-sm hover:bg-[#1EBE5D] transition-colors shadow-warm-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>
                {isAr ? "مراسلة عبر واتساب (رسالة جاهزة)" : "Chat on WhatsApp"}
              </span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          )}
        </div>
      </div>

      {/* Payment Instructions & Proof Upload (For InstaPay & Vodafone Cash) */}
      {(order.payment_method === "instapay" ||
        order.payment_method === "vodafone_cash") && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DED1] shadow-warm-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-[#F0EAE1] pb-4">
            <CreditCard className="w-5 h-5 text-[#C8692F]" />
            <h2 className="font-serif text-lg font-bold text-[#291D11]">
              {order.payment_method === "instapay"
                ? isAr
                  ? "بيانات تحويل إنستاباي (InstaPay)"
                  : "InstaPay Transfer Details"
                : isAr
                ? "بيانات تحويل فودافون كاش (Vodafone Cash)"
                : "Vodafone Cash Transfer Details"}
            </h2>
          </div>

          {/* Payment Account Details */}
          <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E8DED1] space-y-3">
            {order.payment_method === "instapay" ? (
              <>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-[#8A7968]">
                    {isAr ? "معرف / هاتف إنستاباي:" : "InstaPay Handle / Phone:"}
                  </span>
                  <span className="font-mono font-bold text-[#291D11] text-base">
                    {settings.instapay_address || settings.instapay_number || "artique@instapay"}
                  </span>
                </div>
                {settings.instapay_account_name && (
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-[#8A7968]">
                      {isAr ? "اسم الحساب:" : "Account Holder:"}
                    </span>
                    <span className="font-bold text-[#291D11]">
                      {settings.instapay_account_name}
                    </span>
                  </div>
                )}
                {(settings.instapay_instructions_ar || settings.instapay_instructions_en || settings.instapay_instructions) && (
                  <p className="text-xs text-[#6E5F50] border-t border-[#E8DED1] pt-2 mt-2 leading-relaxed">
                    {isAr
                      ? settings.instapay_instructions_ar || settings.instapay_instructions
                      : settings.instapay_instructions_en || settings.instapay_instructions_ar || settings.instapay_instructions}
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-[#8A7968]">
                    {isAr ? "رقم محفظة فودافون كاش:" : "Vodafone Cash Wallet:"}
                  </span>
                  <span className="font-mono font-bold text-[#291D11] text-base">
                    {settings.vodafone_cash_number || "01000000000"}
                  </span>
                </div>
                {(settings.vodafone_cash_instructions_ar || settings.vodafone_cash_instructions_en || settings.vodafone_cash_instructions) && (
                  <p className="text-xs text-[#6E5F50] border-t border-[#E8DED1] pt-2 mt-2 leading-relaxed">
                    {isAr
                      ? settings.vodafone_cash_instructions_ar || settings.vodafone_cash_instructions
                      : settings.vodafone_cash_instructions_en || settings.vodafone_cash_instructions_ar || settings.vodafone_cash_instructions}
                  </p>
                )}
              </>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-[#E8DED1] text-xs sm:text-sm">
              <span className="font-semibold text-[#291D11]">
                {isAr ? "المبلغ المطلوب تحويله بدقة:" : "Exact Amount to Transfer:"}
              </span>
              <span className="font-mono font-bold text-[#C8692F] text-lg">
                {order.total_amount} {t.currency}
              </span>
            </div>
          </div>

          {/* Proof Upload Form */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-[#291D11] flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#C8692F]" />
              {isAr ? "رفع صورة إشعار التحويل (سكرين شوت)" : "Upload Payment Receipt"}
            </h3>

            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p>
                {isAr
                  ? "تنبيه أمان: رفع صورة الإشعار لا يعتمد الدفع فورياً؛ بل يُسجل الطلب كـ (قيد المراجعة اليدوية) وتقوم إدارة المتجر بمطابقة التحويل يدوياً قبل اعتماده."
                  : "Security notice: Uploading a screenshot sets payment status to 'Awaiting Manual Review'. The shop owner verifies the transfer manually before approving."}
              </p>
            </div>

            <form onSubmit={handleUploadProof} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="file"
                  name="proofFile"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploading}
                  className="flex-1 text-xs file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-medium file:bg-[#FAF7F2] file:text-[#291D11] file:cursor-pointer hover:file:bg-[#F0EAE1] border border-[#E8DED1] rounded-xl p-2 cursor-pointer bg-white"
                />
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-[#C8692F] text-white px-6 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#B35822] disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-2 shrink-0"
                >
                  {uploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{isAr ? "جارٍ الرفع..." : "Uploading..."}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isAr ? "إرسال الإشعار للمراجعة" : "Submit Receipt"}</span>
                    </>
                  )}
                </button>
              </div>

              {uploadError && (
                <p className="text-xs text-rose-600 font-medium">{uploadError}</p>
              )}
              {uploadSuccess && (
                <p className="text-xs text-emerald-700 font-medium">
                  {isAr
                    ? "✓ تم رفع إشعار التحويل بنجاح! سيتم مراجعته من قبل إدارة المتجر."
                    : "✓ Payment proof submitted successfully! The owner will review it shortly."}
                </p>
              )}
            </form>

            {/* List of Previous Uploaded Proofs */}
            {order.proofs && order.proofs.length > 0 && (
              <div className="pt-3 space-y-2">
                <h4 className="text-xs font-semibold text-[#8A7968]">
                  {isAr ? "الإشعارات المرفوعة لهذا الطلب:" : "Uploaded Receipts:"}
                </h4>
                <div className="space-y-2">
                  {order.proofs.map((proof) => (
                    <div
                      key={proof.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DED1] text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <FileCheck className="w-4 h-4 text-[#7A7452]" />
                        <span className="text-[#291D11]">
                          {new Date(proof.uploaded_at).toLocaleString(
                            isAr ? "ar-EG" : "en-US",
                            { dateStyle: "short", timeStyle: "short" }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                            proof.status === "accepted"
                              ? "bg-emerald-100 text-emerald-800"
                              : proof.status === "rejected"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {proof.status === "accepted"
                            ? isAr
                              ? "تم القبول والاعتماد"
                              : "Accepted"
                            : proof.status === "rejected"
                            ? isAr
                              ? `مرفوض: ${proof.rejection_reason || "بيانات غير مطابقة"}`
                              : `Rejected: ${proof.rejection_reason || "Mismatch"}`
                            : isAr
                            ? "قيد المراجعة اليدوية"
                            : "Pending Review"}
                        </span>
                        <a
                          href={proof.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#C8692F] hover:underline text-[11px] font-medium"
                        >
                          {isAr ? "عرض" : "View"}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Items & Breakdown */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DED1] shadow-warm-sm space-y-6">
        <h2 className="font-serif text-lg font-bold text-[#291D11]">
          {isAr ? "تفاصيل المنتجات والعنوان" : "Order Details & Delivery"}
        </h2>

        {/* Customer & Address Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FAF7F2] p-4 sm:p-5 rounded-2xl border border-[#E8DED1] text-xs sm:text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#8A7968]">
              <MapPin className="w-4 h-4 text-[#C8692F]" />
              <span className="font-medium">
                {isAr ? "عنوان التوصيل (محافظة دمياط):" : "Delivery Address (Damietta):"}
              </span>
            </div>
            <p className="font-bold text-[#291D11]">
              {isAr ? order.shipping_area_name_ar : order.shipping_area_name_en}
            </p>
            <p className="text-[#6E5F50]">{order.shipping_address_detailed}</p>
          </div>

          <div className="space-y-2">
            <span className="text-[#8A7968] font-medium block">
              {isAr ? "بيانات المستلم:" : "Recipient:"}
            </span>
            <p className="font-bold text-[#291D11]">{order.customer_name}</p>
            <p className="font-mono text-[#6E5F50]" dir="ltr">
              {order.customer_phone}
            </p>
            {order.customer_email && (
              <p className="text-[#6E5F50]">{order.customer_email}</p>
            )}
          </div>
        </div>

        {/* Items List */}
        <div className="divide-y divide-[#F0EAE1]">
          {(order.items || []).map((item) => (
            <div key={item.id} className="py-4 flex gap-4 items-center">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#E8DED1] shrink-0 border border-[#E8DED1]">
                <Image
                  src={item.product_cover_image || "/demo-media/5415cb931ba250dc.webp"}
                  alt={item.product_name_ar}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-serif font-bold text-sm text-[#291D11] truncate">
                  {isAr ? item.product_name_ar : item.product_name_en}
                </h4>
                {(item.variant_name_ar || item.variant_name_en) && (
                  <p className="text-xs text-[#8A7968]">
                    {isAr ? item.variant_name_ar : item.variant_name_en}
                  </p>
                )}
                {item.custom_note && (
                  <p className="text-xs text-[#7A7452] bg-[#FAF7F2] p-1.5 rounded-lg mt-1 border border-[#E8DED1]">
                    {isAr ? "ملاحظة التخصيص:" : "Custom Note:"} {item.custom_note}
                  </p>
                )}
              </div>
              <div className="text-end shrink-0">
                <span className="text-xs text-[#8A7968] block">
                  {item.quantity} × {item.unit_price} {t.currency}
                </span>
                <span className="font-serif font-bold text-sm text-[#291D11]">
                  {item.quantity * item.unit_price} {t.currency}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Totals Summary */}
        <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E8DED1] space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between text-[#6E5F50]">
            <span>{isAr ? "مجموع المنتجات:" : "Subtotal:"}</span>
            <span>
              {order.subtotal_amount} {t.currency}
            </span>
          </div>
          <div className="flex justify-between text-[#6E5F50]">
            <span>{isAr ? "رسوم التوصيل داخل دمياط:" : "Damietta Delivery Fee:"}</span>
            <span>
              {order.delivery_fee} {t.currency}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-[#E8DED1] font-bold text-base text-[#291D11]">
            <span>{isAr ? "الإجمالي الكلي:" : "Total Amount:"}</span>
            <span className="text-[#C8692F]">
              {order.total_amount} {t.currency}
            </span>
          </div>
        </div>
      </div>

      {/* Return to Shop CTA */}
      <div className="text-center pb-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-[#FAF7F2] hover:bg-[#F0EAE1] text-[#291D11] border border-[#E8DED1] px-6 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-colors"
        >
          <span>{isAr ? "تصفح المزيد من أعمال آرتيك" : "Continue Shopping"}</span>
          <ChevronRight className={`w-4 h-4 ${isAr ? "rotate-180" : ""}`} />
        </Link>
      </div>
    </div>
  );
}
