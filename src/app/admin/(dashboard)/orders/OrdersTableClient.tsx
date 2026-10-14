"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Order } from "@/types";
import {
  Search,
  Download,
  Eye,
  Filter,
  CreditCard,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from "lucide-react";

export function OrdersTableClient({
  initialOrders,
}: {
  initialOrders: Order[];
}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [fulfillmentFilter, setFulfillmentFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");

  const filtered = orders.filter((o) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      o.order_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.includes(q);

    const matchesFulfillment =
      fulfillmentFilter === "all" ? true : o.fulfillment_status === fulfillmentFilter;
    const matchesPayment =
      paymentFilter === "all" ? true : o.payment_status === paymentFilter;
    const matchesMethod =
      methodFilter === "all" ? true : o.payment_method === methodFilter;

    return matchesSearch && matchesFulfillment && matchesPayment && matchesMethod;
  });

  // Export to CSV with UTF-8 BOM and formula injection protection
  const handleExportCSV = () => {
    // Sanitizes CSV fields against formula injection attacks (=, +, -, @, \t, \r)
    const sanitize = (val: string | number | null | undefined): string => {
      if (val === null || val === undefined) return '""';
      let str = String(val).replace(/"/g, '""');
      if (/^[=\+\-@\t\r]/.test(str)) {
        str = "'" + str;
      }
      return `"${str}"`;
    };

    const headers = [
      "رقم الطلب",
      "تاريخ الطلب",
      "اسم العميل",
      "الهاتف",
      "البريد الإلكتروني",
      "المنطقة (دمياط)",
      "العنوان التفصيلي",
      "طريقة الدفع",
      "حالة الدفع",
      "حالة الشحن والتنفيذ",
      "قيمة المنتجات",
      "رسوم التوصيل",
      "الإجمالي (ج.م)",
      "ملاحظات العميل",
      "ملخص المنتجات",
    ];

    const rows = filtered.map((o) => {
      const itemsSummary = (o.items || [])
        .map((i) => `${i.product_name_ar} (${i.quantity})`)
        .join(" | ");

      return [
        sanitize(o.order_number),
        sanitize(new Date(o.created_at).toLocaleDateString("ar-EG")),
        sanitize(o.customer_name),
        sanitize(o.customer_phone),
        sanitize(o.customer_email || ""),
        sanitize(o.shipping_area_name_ar),
        sanitize(o.shipping_address_detailed),
        sanitize(
          o.payment_method === "instapay"
            ? "إنستاباي"
            : o.payment_method === "vodafone_cash"
            ? "فودافون كاش"
            : "دفع عند الاستلام"
        ),
        sanitize(o.payment_status),
        sanitize(o.fulfillment_status),
        o.subtotal_amount,
        o.delivery_fee,
        o.total_amount,
        sanitize(o.customer_notes || ""),
        sanitize(itemsSummary),
      ].join(",");
    });

    // UTF-8 BOM (\uFEFF) ensures Excel renders Arabic text properly
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `artique_orders_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
      case "verified":
        return {
          label: "دفع مؤكد",
          classes: "bg-emerald-100 text-emerald-800 border-emerald-200",
        };
      case "awaiting_review":
        return {
          label: "مراجعة إشعار",
          classes: "bg-amber-100 text-amber-800 border-amber-300 animate-pulse",
        };
      case "awaiting_proof":
        return {
          label: "بانتظار الإشعار",
          classes: "bg-sky-100 text-sky-800 border-sky-200",
        };
      case "rejected":
        return {
          label: "إشعار مرفوض",
          classes: "bg-rose-100 text-rose-800 border-rose-200",
        };
      case "refunded":
        return {
          label: "مسترجع",
          classes: "bg-purple-100 text-purple-800 border-purple-200",
        };
      default:
        return {
          label: "عند الاستلام",
          classes: "bg-stone-100 text-stone-700 border-stone-200",
        };
    }
  };

  const getFulfillmentStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return { label: "جديد", classes: "bg-blue-50 text-blue-700 border-blue-200" };
      case "confirmed":
        return { label: "مؤكد", classes: "bg-indigo-50 text-indigo-700 border-indigo-200" };
      case "preparing":
        return { label: "قيد التجهيز", classes: "bg-amber-50 text-amber-700 border-amber-200" };
      case "shipped":
        return { label: "مع المندوب", classes: "bg-purple-50 text-purple-700 border-purple-200" };
      case "delivered":
        return { label: "تم التسليم", classes: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "cancelled":
        return { label: "ملغي", classes: "bg-rose-50 text-rose-700 border-rose-200" };
      default:
        return { label: status, classes: "bg-stone-50 text-stone-700 border-stone-200" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#291D11]">
            إدارة ومتابعة الطلبات ({filtered.length})
          </h2>
          <p className="text-xs text-[#8A7968] mt-1">
            سجل طلبات العملاء، تحديث حالات الشحن والدفع، وتصدير التقارير
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-white hover:bg-[#FAF7F2] text-[#291D11] border border-[#E8DED1] text-xs font-semibold py-2.5 px-4 rounded-xl shadow-warm-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-[#C8692F]" />
          <span>تصدير الطلبات (CSV Excel)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#E8DED1] shadow-warm-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative md:col-span-1">
            <input
              type="text"
              placeholder="البحث برقم الطلب، اسم العميل، أو الهاتف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#E8DED1] rounded-2xl px-4 py-2 text-xs text-[#291D11] pl-9 focus:outline-none focus:border-[#C8692F]"
            />
            <Search className="w-4 h-4 text-[#8A7968] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Fulfillment Status Filter */}
          <select
            value={fulfillmentFilter}
            onChange={(e) => setFulfillmentFilter(e.target.value)}
            className="bg-[#FAF7F2] border border-[#E8DED1] rounded-2xl px-3 py-2 text-xs text-[#291D11] focus:outline-none focus:border-[#C8692F]"
          >
            <option value="all">كل حالات الشحن والتنفيذ</option>
            <option value="new">طلب جديد (New)</option>
            <option value="confirmed">تم التأكيد (Confirmed)</option>
            <option value="preparing">قيد التجهيز (Preparing)</option>
            <option value="shipped">تم الشحن (Shipped)</option>
            <option value="delivered">تم التوصيل (Delivered)</option>
            <option value="cancelled">ملغي (Cancelled)</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-[#FAF7F2] border border-[#E8DED1] rounded-2xl px-3 py-2 text-xs text-[#291D11] focus:outline-none focus:border-[#C8692F]"
          >
            <option value="all">كل حالات الدفع</option>
            <option value="awaiting_review">إشعار جاهز للمراجعة (Awaiting Review)</option>
            <option value="awaiting_proof">بانتظار رفع الإشعار (Awaiting Proof)</option>
            <option value="paid">تم تأكيد الدفع (Paid / Verified)</option>
            <option value="unpaid">غير مدفوع / عند الاستلام (Unpaid)</option>
            <option value="rejected">إشعار مرفوض (Rejected)</option>
            <option value="refunded">مسترجع (Refunded)</option>
          </select>

          {/* Payment Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-[#FAF7F2] border border-[#E8DED1] rounded-2xl px-3 py-2 text-xs text-[#291D11] focus:outline-none focus:border-[#C8692F]"
          >
            <option value="all">جميع طرق الدفع</option>
            <option value="instapay">إنستاباي (InstaPay)</option>
            <option value="vodafone_cash">فودافون كاش (Vodafone Cash)</option>
            <option value="cod">الدفع عند الاستلام (Cash on Delivery)</option>
          </select>
        </div>
      </div>

      {/* Orders List Container */}
      <div className="bg-white rounded-3xl border border-[#E8DED1] shadow-warm-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-[#8A7968] text-xs">
            لا توجد طلبات تطابق معايير البحث.
          </div>
        ) : (
          <>
            {/* Mobile Card View (< md) */}
            <div className="md:hidden divide-y divide-[#F0EAE1]">
              {filtered.map((order) => {
                const payBadge = getPaymentStatusBadge(order.payment_status);
                const fulBadge = getFulfillmentStatusBadge(order.fulfillment_status);

                return (
                  <div key={order.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-[#C8692F]">
                        {order.order_number}
                      </span>
                      <span className="text-[11px] text-[#8A7968]">
                        {new Date(order.created_at).toLocaleDateString("ar-EG")}
                      </span>
                    </div>

                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-xs text-[#291D11]">
                          {order.customer_name}
                        </div>
                        <a
                          href={`tel:${order.customer_phone}`}
                          className="font-mono text-xs text-[#C8692F] hover:underline block mt-0.5"
                          dir="ltr"
                        >
                          {order.customer_phone}
                        </a>
                      </div>
                      <div className="text-left font-mono font-bold text-sm text-[#291D11]">
                        {order.total_amount} ج.م
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 items-center text-[10px]">
                      <span className="bg-[#FAF7F2] text-[#6E5F50] border border-[#E8DED1] px-2 py-0.5 rounded-lg">
                        {order.shipping_area_name_ar}
                      </span>
                      <span className="bg-[#FAF7F2] text-[#291D11] border border-[#E8DED1] px-2 py-0.5 rounded-lg font-medium">
                        {order.payment_method === "instapay"
                          ? "إنستاباي"
                          : order.payment_method === "vodafone_cash"
                          ? "فودافون كاش"
                          : "عند الاستلام"}
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg font-bold border ${payBadge.classes}`}>
                        {payBadge.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg font-semibold border ${fulBadge.classes}`}>
                        {fulBadge.label}
                      </span>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 bg-[#FAF7F2] hover:bg-[#F0EAE1] text-[#291D11] border border-[#E8DED1] px-3.5 py-1.5 rounded-xl font-medium text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#C8692F]" />
                        <span>تفاصيل الطلب والإشعار</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-right min-w-[750px]">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#E8DED1] text-[#8A7968]">
                    <th className="py-3.5 px-4 font-semibold">رقم الطلب</th>
                    <th className="py-3.5 px-4 font-semibold">التاريخ</th>
                    <th className="py-3.5 px-4 font-semibold">العميل والهاتف</th>
                    <th className="py-3.5 px-4 font-semibold">المنطقة بدمياط</th>
                    <th className="py-3.5 px-4 font-semibold">طريقة الدفع</th>
                    <th className="py-3.5 px-4 font-semibold">حالة الدفع</th>
                    <th className="py-3.5 px-4 font-semibold">حالة الشحن</th>
                    <th className="py-3.5 px-4 font-semibold">الإجمالي</th>
                    <th className="py-3.5 px-4 font-semibold text-left">التفاصيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EAE1]">
                  {filtered.map((order) => {
                    const payBadge = getPaymentStatusBadge(order.payment_status);
                    const fulBadge = getFulfillmentStatusBadge(order.fulfillment_status);

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-[#FAF7F2]/60 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-[#C8692F]">
                          {order.order_number}
                        </td>
                        <td className="py-3.5 px-4 text-[#8A7968]">
                          {new Date(order.created_at).toLocaleDateString("ar-EG")}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#291D11]">
                            {order.customer_name}
                          </div>
                          <div className="font-mono text-[11px] text-[#6E5F50]" dir="ltr">
                            {order.customer_phone}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#6E5F50]">
                          {order.shipping_area_name_ar}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[11px] text-[#291D11]">
                            {order.payment_method === "instapay"
                              ? "إنستاباي"
                              : order.payment_method === "vodafone_cash"
                              ? "فودافون كاش"
                              : "عند الاستلام"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${payBadge.classes}`}
                          >
                            {payBadge.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${fulBadge.classes}`}
                          >
                            {fulBadge.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-sm text-[#291D11]">
                          {order.total_amount} ج.م
                        </td>
                        <td className="py-3.5 px-4 text-left">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex items-center gap-1 bg-[#FAF7F2] hover:bg-[#F0EAE1] text-[#291D11] border border-[#E8DED1] px-3 py-1.5 rounded-xl transition-colors font-medium text-[11px]"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#C8692F]" />
                            <span>عرض</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
