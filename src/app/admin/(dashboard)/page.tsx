import React from "react";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import {
  ShoppingBag,
  CreditCard,
  Package,
  Clock,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  MapPin,
  Settings,
  Eye,
  FileCheck,
} from "lucide-react";

export default async function AdminOverviewPage() {
  const [orders, products, shippingAreas] = await Promise.all([
    db.getOrders(),
    db.getProducts(),
    db.getShippingAreas(),
  ]);

  const totalOrders = orders.length;
  const pendingPaymentOrders = orders.filter(
    (o) => o.payment_status === "awaiting_review"
  );
  const preparingOrders = orders.filter(
    (o) => o.fulfillment_status === "preparing"
  );
  const totalRevenue = orders
    .filter((o) => o.payment_status === "paid" || o.fulfillment_status === "delivered")
    .reduce((sum, o) => sum + o.total_amount, 0);

  const publishedProducts = products.filter((p) => p.status === "published");
  const draftProducts = products.filter((p) => p.status === "draft");

  const recentOrders = orders.slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#291D11]">
            مرحباً بكِ في إدارة آرتيك 👋
          </h2>
          <p className="text-xs text-[#8A7968] mt-1">
            ملخص مبيعات المشغولات اليدوية وحالة الطلبات والتوصيل داخل دمياط
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 bg-[#C8692F] hover:bg-[#B35822] text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-warm-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مشغولة جديدة</span>
          </Link>
        </div>
      </div>

      {/* Pending Payment Review Alert (If Any) */}
      {pendingPaymentOrders.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 shadow-warm-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-amber-950">
                يوجد {pendingPaymentOrders.length} طلب بانتظار مراجعة إشعار التحويل اليدوي!
              </h3>
              <p className="text-xs text-amber-800/80 mt-0.5">
                قام العملاء برفع إشعارات تحويل إنستاباي أو فودافون كاش وتتطلب اعتمادكِ أو رفضكِ.
              </p>
            </div>
          </div>
          <Link
            href="/admin/orders?status=awaiting_review"
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shrink-0"
          >
            مراجعة الإشعارات الآن
          </Link>
        </div>
      )}

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#E8DED1] shadow-warm-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#E8DED1] flex items-center justify-center text-[#C8692F] shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[#8A7968] block">إجمالي الطلبات</span>
            <span className="font-serif font-bold text-2xl text-[#291D11]">
              {totalOrders}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E8DED1] shadow-warm-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[#8A7968] block">بانتظار مراجعة الدفع</span>
            <span className="font-serif font-bold text-2xl text-amber-800">
              {pendingPaymentOrders.length}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E8DED1] shadow-warm-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[#8A7968] block">قيد التجهيز يدوياً</span>
            <span className="font-serif font-bold text-2xl text-purple-900">
              {preparingOrders.length}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E8DED1] shadow-warm-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[#8A7968] block">المبيعات المؤكدة</span>
            <span className="font-serif font-bold text-xl text-emerald-900">
              {totalRevenue} ج.م
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Orders & Quick Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E8DED1] p-6 shadow-warm-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#C8692F]" />
              <h3 className="font-serif font-bold text-base text-[#291D11]">
                أحدث الطلبات المستلمة
              </h3>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs text-[#C8692F] hover:underline font-medium"
            >
              عرض جميع الطلبات ({totalOrders})
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8A7968]">
              لا توجد طلبات بعد. ستظهر هنا بمجرد أن يقوم العملاء بالطلب.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="border-b border-[#F0EAE1] text-[#8A7968]">
                    <th className="pb-3 font-semibold">رقم الطلب</th>
                    <th className="pb-3 font-semibold">العميل</th>
                    <th className="pb-3 font-semibold">المنطقة</th>
                    <th className="pb-3 font-semibold">الإجمالي</th>
                    <th className="pb-3 font-semibold">حالة الشحن</th>
                    <th className="pb-3 font-semibold">حالة الدفع</th>
                    <th className="pb-3 font-semibold text-left">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EAE1]">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#FAF7F2] transition-colors">
                      <td className="py-3.5 font-mono font-bold text-[#C8692F]">
                        {ord.order_number}
                      </td>
                      <td className="py-3.5 font-medium text-[#291D11]">
                        {ord.customer_name}
                      </td>
                      <td className="py-3.5 text-[#6E5F50]">
                        {ord.shipping_area_name_ar}
                      </td>
                      <td className="py-3.5 font-bold text-[#291D11]">
                        {ord.total_amount} ج.م
                      </td>
                      <td className="py-3.5">
                        <span className="bg-[#FAF7F2] text-[#6E5F50] px-2 py-0.5 rounded-md font-medium text-[11px] border border-[#E8DED1]">
                          {ord.fulfillment_status === "new"
                            ? "جديد"
                            : ord.fulfillment_status === "preparing"
                            ? "تجهيز"
                            : ord.fulfillment_status === "shipped"
                            ? "شحن"
                            : ord.fulfillment_status === "delivered"
                            ? "تم التسليم"
                            : "مؤكد"}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${
                            ord.payment_status === "paid"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : ord.payment_status === "awaiting_review"
                              ? "bg-amber-50 text-amber-800 border border-amber-300 font-bold"
                              : "bg-stone-100 text-stone-700"
                          }`}
                        >
                          {ord.payment_status === "paid"
                            ? "معتمد"
                            : ord.payment_status === "awaiting_review"
                            ? "بانتظار المراجعة"
                            : "غير مدفوع"}
                        </span>
                      </td>
                      <td className="py-3.5 text-left">
                        <Link
                          href={`/admin/orders/${ord.id}`}
                          className="text-[#C8692F] hover:text-[#B35822] p-1 inline-block"
                          title="عرض تفاصيل الطلب"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Products Status & Quick Actions */}
        <div className="space-y-6">
          {/* Products Summary Card */}
          <div className="bg-white rounded-3xl border border-[#E8DED1] p-6 shadow-warm-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[#291D11] flex items-center gap-2">
                <Package className="w-4 h-4 text-[#C8692F]" />
                <span>حالة كتالوج المشغولات</span>
              </h3>
              <Link
                href="/admin/products"
                className="text-xs text-[#C8692F] hover:underline font-medium"
              >
                إدارة
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E8DED1]">
                <span className="text-[#8A7968] block">معروض للبيع</span>
                <span className="font-bold text-lg text-emerald-800">
                  {publishedProducts.length} منتج
                </span>
              </div>
              <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E8DED1]">
                <span className="text-[#8A7968] block">مسودات (تحتاج تسعير)</span>
                <span className="font-bold text-lg text-amber-800">
                  {draftProducts.length} مسودة
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#8A7968] leading-tight">
              تم استيراد صور المنتجات من جوجل درايف مع الحفاظ على المسودات غير المسعرة حتى تقومي بتحديد أسعارها وأوقات تنفيذها.
            </p>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white rounded-3xl border border-[#E8DED1] p-6 shadow-warm-xs space-y-3">
            <h3 className="font-serif font-bold text-base text-[#291D11]">
              روابط سريعة للإدارة
            </h3>
            <div className="space-y-2 text-xs">
              <Link
                href="/admin/shipping"
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#FAF7F2] border border-[#F0EAE1] transition-colors"
              >
                <div className="flex items-center gap-2.5 text-[#291D11]">
                  <MapPin className="w-4 h-4 text-[#7A7452]" />
                  <span>تعديل رسوم مناطق دمياط ({shippingAreas.length} منطقة)</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#8A7968]" />
              </Link>

              <Link
                href="/admin/settings"
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#FAF7F2] border border-[#F0EAE1] transition-colors"
              >
                <div className="flex items-center gap-2.5 text-[#291D11]">
                  <CreditCard className="w-4 h-4 text-[#C8692F]" />
                  <span>بيانات تحويل إنستاباي وفودافون كاش</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#8A7968]" />
              </Link>

              <Link
                href="/admin/settings"
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#FAF7F2] border border-[#F0EAE1] transition-colors"
              >
                <div className="flex items-center gap-2.5 text-[#291D11]">
                  <Settings className="w-4 h-4 text-[#B8862B]" />
                  <span>إعدادات الواتساب وحساب إنستغرام</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#8A7968]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
