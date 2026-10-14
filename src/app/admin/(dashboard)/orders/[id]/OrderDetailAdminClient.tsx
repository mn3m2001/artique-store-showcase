"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Order, FulfillmentStatus, PaymentStatus } from "@/types";
import { updateOrderStatusAction, reviewPaymentProofAction } from "../actions";
import {
  ArrowLeft,
  Save,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  FileCheck,
  Calendar,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  History,
} from "lucide-react";

export function OrderDetailAdminClient({
  order: initialOrder,
}: {
  order: Order;
}) {
  const router = useRouter();
  const [order, setOrder] = useState<Order>(initialOrder);

  // Status updates state
  const [fulfillmentStatus, setFulfillmentStatus] = useState<FulfillmentStatus>(
    order.fulfillment_status
  );
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    order.payment_status
  );
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>(
    order.expected_delivery_date || ""
  );
  const [actualDeliveryDate, setActualDeliveryDate] = useState<string>(
    order.actual_delivery_date || ""
  );
  const [internalNotes, setInternalNotes] = useState<string>(
    order.internal_notes || ""
  );
  const [statusComment, setStatusComment] = useState<string>("");

  // Refund details state
  const [refundAmount, setRefundAmount] = useState<number>(
    order.refund_details?.amount ?? order.total_amount
  );
  const [refundReference, setRefundReference] = useState<string>(
    order.refund_details?.reference || ""
  );
  const [refundDate, setRefundDate] = useState<string>(
    order.refund_details?.date || new Date().toISOString().slice(0, 10)
  );
  const [refundReason, setRefundReason] = useState<string>(
    order.refund_details?.reason || ""
  );
  const [refundNotes, setRefundNotes] = useState<string>(
    order.refund_details?.notes || ""
  );

  const [savingStatus, setSavingStatus] = useState(false);
  const [reviewingProofId, setReviewingProofId] = useState<string | null>(null);
  const [rejectionModalProofId, setRejectionModalProofId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Save Order Updates
  const handleSaveOrderSettings = async () => {
    setSavingStatus(true);
    setFeedbackMessage(null);

    if (paymentStatus === "refunded") {
      if (!refundAmount || refundAmount <= 0) {
        setFeedbackMessage({
          type: "error",
          text: "يرجى إدخال مبلغ الاسترداد المالي بشكل صحيح.",
        });
        setSavingStatus(false);
        return;
      }
      if (!refundReason.trim()) {
        setFeedbackMessage({
          type: "error",
          text: "يرجى تحديد سبب استرداد المبلغ للعميل.",
        });
        setSavingStatus(false);
        return;
      }
    }

    try {
      const res = await updateOrderStatusAction(order.id, {
        fulfillmentStatus,
        paymentStatus,
        expectedDeliveryDate: expectedDeliveryDate || null,
        actualDeliveryDate: actualDeliveryDate || null,
        internalNotes: internalNotes || undefined,
        refundDetails:
          paymentStatus === "refunded"
            ? {
                amount: Number(refundAmount),
                reference: refundReference.trim() || undefined,
                date: refundDate || new Date().toISOString().slice(0, 10),
                reason: refundReason.trim(),
                notes: refundNotes.trim() || undefined,
              }
            : null,
        comment: statusComment.trim() || undefined,
      });

      if (res.success && res.order) {
        setOrder(res.order);
        setStatusComment("");
        setFeedbackMessage({
          type: "success",
          text: "تم حفظ تحديثات حالة الطلب والملاحظات بنجاح!",
        });
      } else {
        setFeedbackMessage({
          type: "error",
          text: res.error || "فشل تحديث الطلب.",
        });
      }
    } catch (err: unknown) {
      setFeedbackMessage({
        type: "error",
        text: (err instanceof Error ? err.message : "حدث خطأ غير متوقع") || "حدث خطأ غير متوقع.",
      });
    } finally {
      setSavingStatus(false);
    }
  };

  // Accept Proof
  const handleAcceptProof = async (proofId: string) => {
    if (!window.confirm("هل أنتِ متأكدة من قبول إشعار التحويل واعتماد الدفع؟")) {
      return;
    }

    setReviewingProofId(proofId);
    setFeedbackMessage(null);

    const res = await reviewPaymentProofAction(order.id, proofId, {
      status: "accepted",
    });

    if (res.success && res.order) {
      setOrder(res.order);
      setPaymentStatus(res.order.payment_status);
      setFeedbackMessage({
        type: "success",
        text: "تم قبول إشعار التحويل وتحديث حالة الدفع إلى (تم تأكيد الدفع)!",
      });
    } else {
      setFeedbackMessage({
        type: "error",
        text: res.error || "فشل اعتماد الإشعار.",
      });
    }
    setReviewingProofId(null);
  };

  // Reject Proof
  const handleRejectProofConfirm = async () => {
    if (!rejectionModalProofId) return;
    if (!rejectionReason.trim()) {
      alert("يرجى كتابة سبب الرفض لتوضيحه للعميل.");
      return;
    }

    setReviewingProofId(rejectionModalProofId);
    setFeedbackMessage(null);

    const res = await reviewPaymentProofAction(order.id, rejectionModalProofId, {
      status: "rejected",
      note: rejectionReason.trim(),
    });

    if (res.success && res.order) {
      setOrder(res.order);
      setPaymentStatus(res.order.payment_status);
      setRejectionModalProofId(null);
      setRejectionReason("");
      setFeedbackMessage({
        type: "success",
        text: "تم رفض إشعار التحويل وتوثيق السبب في السجل.",
      });
    } else {
      setFeedbackMessage({
        type: "error",
        text: res.error || "فشل رفض الإشعار.",
      });
    }
    setReviewingProofId(null);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#F0EAE1] pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 text-[#8A7968] hover:text-[#291D11] hover:bg-[#FAF7F2] rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 rotate-180" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-serif text-2xl font-bold text-[#291D11]">
                طلب رقم: {order.order_number}
              </h2>
              <span className="font-mono text-xs text-[#8A7968] bg-[#FAF7F2] px-2.5 py-1 rounded-lg border border-[#E8DED1]">
                {new Date(order.created_at).toLocaleString("ar-EG")}
              </span>
            </div>
            <p className="text-xs text-[#8A7968] mt-1">
              العميل: {order.customer_name} • منطقة {order.shipping_area_name_ar}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/order/${order.id}`}
            target="_blank"
            className="flex items-center gap-1.5 text-xs text-[#6E5F50] hover:text-[#291D11] bg-white border border-[#E8DED1] px-3.5 py-2 rounded-xl transition-colors"
          >
            <span>صفحة تأكيد العميل</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleSaveOrderSettings}
            disabled={savingStatus}
            className="flex items-center gap-2 bg-[#C8692F] hover:bg-[#B35822] text-white text-xs font-semibold px-5 py-2 rounded-xl shadow-warm-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {savingStatus ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>جارٍ الحفظ...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>حفظ التعديلات</span>
              </>
            )}
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-2 ${
            feedbackMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {feedbackMessage.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Products Snapshot, Customer & Proofs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Snapshot Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8DED1] shadow-warm-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-[#291D11]">
              محتويات الطلب المحفوظة (Order Snapshot)
            </h3>
            <p className="text-xs text-[#8A7968]">
              هذه النسخة محفوظة بدقة وقت تقديم الطلب ولا تتأثر بأي تعديلات لاحقة على أسعار أو أسماء المنتجات.
            </p>

            <div className="divide-y divide-[#F0EAE1]">
              {(order.items || []).map((item) => (
                <div key={item.id} className="py-4 flex gap-4 items-center">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#E8DED1] shrink-0">
                    <Image
                      src={item.product_cover_image || "/demo-media/5415cb931ba250dc.webp"}
                      alt={item.product_name_ar}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-[#291D11] truncate">
                      {item.product_name_ar}
                    </h4>
                    {item.variant_name_ar && (
                      <span className="text-[11px] text-[#C8692F] font-semibold block">
                        الخيار / اللون: {item.variant_name_ar}
                      </span>
                    )}
                    {item.custom_note && (
                      <p className="text-[11px] text-[#7A7452] bg-[#FAF7F2] p-1.5 rounded-lg border border-[#E8DED1] mt-1">
                        طلب العميل المخصص: &quot;{item.custom_note}&quot;
                      </p>
                    )}
                  </div>
                  <div className="text-left shrink-0">
                    <span className="text-xs text-[#8A7968] block">
                      {item.quantity} × {item.unit_price} ج.م
                    </span>
                    <span className="font-mono font-bold text-sm text-[#291D11]">
                      {item.quantity * item.unit_price} ج.م
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Subtotals */}
            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8DED1] space-y-2 text-xs">
              <div className="flex justify-between text-[#6E5F50]">
                <span>قيمة المشغولات:</span>
                <span className="font-mono font-bold">{order.subtotal_amount} ج.م</span>
              </div>
              <div className="flex justify-between text-[#6E5F50]">
                <span>رسوم التوصيل ({order.shipping_area_name_ar}):</span>
                <span className="font-mono font-bold">{order.delivery_fee} ج.م</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E8DED1] text-sm font-bold text-[#291D11]">
                <span>الإجمالي الكلي:</span>
                <span className="font-mono text-base text-[#C8692F]">
                  {order.total_amount} ج.م
                </span>
              </div>
            </div>
          </div>

          {/* Payment Proofs Review Card (If Any) */}
          {(order.payment_method === "instapay" ||
            order.payment_method === "vodafone_cash") && (
            <div className="bg-white p-6 rounded-3xl border border-[#E8DED1] shadow-warm-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-[#291D11] flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#C8692F]" />
                  <span>
                    إشعارات الدفع المرفوعة (
                    {order.payment_method === "instapay" ? "إنستاباي" : "فودافون كاش"}
                    )
                  </span>
                </h3>
                <span className="text-[11px] text-[#8A7968]">
                  مراجعة يدوية إلزامية
                </span>
              </div>

              {order.proofs && order.proofs.length > 0 ? (
                <div className="space-y-4">
                  {order.proofs.map((proof) => (
                    <div
                      key={proof.id}
                      className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DED1] space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs text-[#8A7968]">
                          <Clock className="w-4 h-4 text-[#7A7452]" />
                          <span>
                            رُفع في:{" "}
                            {new Date(proof.uploaded_at).toLocaleString("ar-EG")}
                          </span>
                        </div>
                        <span
                          className={`self-start px-2.5 py-1 rounded-lg text-xs font-bold ${
                            proof.status === "accepted"
                              ? "bg-emerald-100 text-emerald-800"
                              : proof.status === "rejected"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800 animate-pulse"
                          }`}
                        >
                          {proof.status === "accepted"
                            ? "مقبول ومعتمد"
                            : proof.status === "rejected"
                            ? `مرفوض (${proof.rejection_reason || "بيانات غير مطابقة"})`
                            : "قيد المراجعة اليدوية"}
                        </span>
                      </div>

                      {/* Image Preview */}
                      <div className="flex gap-4 items-center">
                        <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-[#E8DED1] bg-white shrink-0">
                          <Image
                            src={proof.file_url}
                            alt="Payment Receipt"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="space-y-2">
                          <a
                            href={proof.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-[#C8692F] hover:underline font-semibold"
                          >
                            <span>فتح الصورة بحجم كامل</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <p className="text-[11px] text-[#8A7968]">
                            تحققي من المبلغ ({order.total_amount} ج.م) ورقم هاتف العميل واسم المحول.
                          </p>
                        </div>
                      </div>

                      {/* Action buttons for pending proof */}
                      {proof.status === "pending" && (
                        <div className="pt-2 flex gap-2 border-t border-[#E8DED1]">
                          <button
                            type="button"
                            onClick={() => handleAcceptProof(proof.id)}
                            disabled={reviewingProofId === proof.id}
                            className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold py-2 px-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>قبول واعتماد التحويل</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setRejectionModalProofId(proof.id)}
                            disabled={reviewingProofId === proof.id}
                            className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold py-2 px-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>رفض الإشعار مع ذكر السبب</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DED1] text-xs text-[#8A7968] text-center">
                  لم يقم العميل برفع صورة إشعار التحويل بعد.
                </div>
              )}
            </div>
          )}

          {/* Customer & Delivery Destination Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8DED1] shadow-warm-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-[#291D11]">
              بيانات العميل وعنوان التوصيل داخل دمياط
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8DED1]">
                <div className="flex items-center gap-2 text-[#8A7968] font-semibold">
                  <User className="w-4 h-4 text-[#C8692F]" />
                  <span>بيانات الاتصال:</span>
                </div>
                <p className="font-bold text-sm text-[#291D11]">{order.customer_name}</p>
                <p className="font-mono text-[#6E5F50]" dir="ltr">
                  هاتف: {order.customer_phone}
                </p>
                {order.customer_email && (
                  <p className="text-[#6E5F50]">بريد: {order.customer_email}</p>
                )}
              </div>

              <div className="space-y-1.5 bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8DED1]">
                <div className="flex items-center gap-2 text-[#8A7968] font-semibold">
                  <MapPin className="w-4 h-4 text-[#7A7452]" />
                  <span>العنوان في محافظة دمياط:</span>
                </div>
                <p className="font-bold text-sm text-[#291D11]">
                  {order.shipping_area_name_ar}
                </p>
                <p className="text-[#6E5F50] leading-relaxed">
                  {order.shipping_address_detailed}
                </p>
              </div>
            </div>

            {order.customer_notes && (
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/70 text-xs text-amber-900">
                <span className="font-bold block mb-1">ملاحظات العميل الإضافية:</span>
                <p>{order.customer_notes}</p>
              </div>
            )}
          </div>

          {/* Audit History Log */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8DED1] shadow-warm-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-[#291D11] flex items-center gap-2">
              <History className="w-4 h-4 text-[#7A7452]" />
              <span>سجل تاريخ تغيير الحالات (Audit Log)</span>
            </h3>

            <div className="space-y-3">
              {order.history && order.history.length > 0 ? (
                order.history.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-start gap-3 text-xs p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8DED1]"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#C8692F] mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#291D11]">
                          {h.type === "fulfillment"
                            ? "تحديث حالة الشحن"
                            : "تحديث حالة الدفع"}
                          : {h.new_status}
                        </span>
                        <span className="text-[10px] text-[#8A7968]">
                          {new Date(h.created_at).toLocaleString("ar-EG")}
                        </span>
                      </div>
                      {h.comment && (
                        <p className="text-[11px] text-[#6E5F50] mt-0.5">{h.comment}</p>
                      )}
                      <span className="text-[10px] text-[#8A7968] block mt-0.5">
                        بواسطة: {h.created_by}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#8A7968]">لا يوجد سجل سابق.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Status Updaters & Internal Notes */}
        <div className="space-y-6">
          {/* Status Controls Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8DED1] shadow-warm-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-[#291D11]">
              تحديث الحالات ومواعيد التسليم
            </h3>

            {/* Fulfillment Status */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#291D11]">
                حالة تنفيذ وشحن الطلب
              </label>
              <select
                value={fulfillmentStatus}
                onChange={(e) =>
                  setFulfillmentStatus(e.target.value as FulfillmentStatus)
                }
                className="w-full bg-[#FAF7F2] border border-[#E8DED1] rounded-2xl px-3 py-2.5 text-xs text-[#291D11] focus:outline-none focus:border-[#C8692F]"
              >
                <option value="new">طلب جديد (New)</option>
                <option value="confirmed">تم التأكيد (Confirmed)</option>
                <option value="preparing">قيد التجهيز يدوياً (Preparing)</option>
                <option value="shipped">تم الشحن مع المندوب (Shipped)</option>
                <option value="delivered">تم التوصيل بنجاح (Delivered)</option>
                <option value="cancelled">ملغي (Cancelled)</option>
              </select>
            </div>

            {/* Payment Status */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#291D11]">
                حالة الدفع المالية
              </label>
              <select
                value={paymentStatus}
                onChange={(e) =>
                  setPaymentStatus(e.target.value as PaymentStatus)
                }
                className="w-full bg-[#FAF7F2] border border-[#E8DED1] rounded-2xl px-3 py-2.5 text-xs text-[#291D11] focus:outline-none focus:border-[#C8692F]"
              >
                <option value="unpaid">غير مدفوع (مستحق السداد عند الاستلام)</option>
                <option value="awaiting_proof">بانتظار قيام العميل برفع إشعار التحويل</option>
                <option value="awaiting_review">إشعار جاهز للمراجعة من الإدارة</option>
                <option value="paid">دفع مؤكد ومعتمد (Paid)</option>
                <option value="verified">دفع مؤكد وموثق (Verified)</option>
                <option value="rejected">إشعار مرفوض (Rejected)</option>
                <option value="refunded">مسترجع للعميل (Refunded)</option>
              </select>
            </div>

            {/* Refund Details Sub-form (shown if refunded is selected) */}
            {paymentStatus === "refunded" && (
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
                  <CreditCard className="w-4 h-4 text-purple-700" />
                  <span>بيانات استرداد المبلغ للعميل (إلزامية وموثقة)</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-purple-950 mb-1">
                      المبلغ المسترد (ج.م) *
                    </label>
                    <input
                      type="number"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(Number(e.target.value))}
                      className="w-full bg-white border border-purple-200 rounded-xl px-3 py-1.5 text-xs text-[#291D11] focus:outline-none focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-purple-950 mb-1">
                      تاريخ الاسترداد
                    </label>
                    <input
                      type="date"
                      value={refundDate}
                      onChange={(e) => setRefundDate(e.target.value)}
                      className="w-full bg-white border border-purple-200 rounded-xl px-3 py-1.5 text-xs text-[#291D11] focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-purple-950 mb-1">
                    سبب الاسترداد *
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: إلغاء بناءً على طلب العميل / عيب تصنيع"
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="w-full bg-white border border-purple-200 rounded-xl px-3 py-1.5 text-xs text-[#291D11] focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-purple-950 mb-1">
                    رقم مرجع التحويل / محفظة الإرجاع (اختياري)
                  </label>
                  <input
                    type="text"
                    placeholder="رقم مرجع إنستاباي أو فودافون كاش"
                    value={refundReference}
                    onChange={(e) => setRefundReference(e.target.value)}
                    className="w-full bg-white border border-purple-200 rounded-xl px-3 py-1.5 text-xs text-[#291D11] focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>
            )}

            {/* Status Change Comment */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#291D11]">
                ملاحظة سبب التغيير (تُحفظ في السجل)
              </label>
              <input
                type="text"
                placeholder="مثال: تم الاتصال بالعميل وتأكيد المقاسات"
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8DED1] rounded-2xl px-3 py-2 text-xs text-[#291D11] focus:outline-none focus:border-[#C8692F]"
              />
            </div>

            {/* Expected Delivery Date */}
            <div className="space-y-1.5 pt-2 border-t border-[#F0EAE1]">
              <label className="block text-xs font-semibold text-[#291D11]">
                تاريخ التسليم المتوقع
              </label>
              <input
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8DED1] rounded-2xl px-3 py-2 text-xs text-[#291D11] focus:outline-none focus:border-[#C8692F]"
              />
            </div>

            {/* Actual Delivery Date */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#291D11]">
                تاريخ التسليم الفعلي
              </label>
              <input
                type="date"
                value={actualDeliveryDate}
                onChange={(e) => setActualDeliveryDate(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8DED1] rounded-2xl px-3 py-2 text-xs text-[#291D11] focus:outline-none focus:border-[#C8692F]"
              />
            </div>
          </div>

          {/* Internal Private Notes Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8DED1] shadow-warm-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-[#291D11]">
              ملاحظات داخلية خاصة (لصاحبة المتجر فقط)
            </h3>
            <p className="text-[11px] text-[#8A7968]">
              هذه الملاحظات سرية ولا تظهر للعميل أبداً في أي صفحة.
            </p>
            <textarea
              rows={4}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="مثال: العميل يفضل استلام الطلب مساءً، خيوط القطعة تم حجزها من بكرة كروشيه دمياط..."
              className="w-full bg-[#FAF7F2] border border-[#E8DED1] rounded-2xl p-3 text-xs text-[#291D11] focus:outline-none focus:border-[#C8692F] leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Proof Rejection Reason Modal */}
      {rejectionModalProofId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E8DED1] shadow-warm-lg space-y-4">
            <h3 className="font-serif font-bold text-base text-[#291D11] flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-600" />
              <span>سبب رفض إشعار التحويل</span>
            </h3>
            <p className="text-xs text-[#8A7968]">
              يرجى كتابة سبب عدم اعتماد الإشعار حتى يتم توثيقه في السجل وإبلاغ العميل.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="مثال: المبلغ المحول غير مطابق، أو الصورة غير واضحة..."
              className="w-full bg-[#FAF7F2] border border-[#E8DED1] rounded-2xl p-3 text-xs text-[#291D11] focus:outline-none focus:border-rose-500"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleRejectProofConfirm}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                تأكيد الرفض
              </button>
              <button
                type="button"
                onClick={() => {
                  setRejectionModalProofId(null);
                  setRejectionReason("");
                }}
                className="px-4 bg-[#FAF7F2] hover:bg-[#F0EAE1] text-[#291D11] text-xs font-semibold py-2.5 rounded-xl border border-[#E8DED1] cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
