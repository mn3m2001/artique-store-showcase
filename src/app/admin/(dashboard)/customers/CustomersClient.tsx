"use client";

import React, { useState } from "react";
import { CustomerSummary } from "@/types";
import { Search, User, Phone, Mail, ShoppingBag, Calendar } from "lucide-react";

export function CustomersClient({
  customers,
}: {
  customers: CustomerSummary[];
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = customers.filter((c) => {
    const q = searchTerm.toLowerCase().trim();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#291D11]">
          سجل العملاء ({customers.length})
        </h2>
        <p className="text-xs text-[#8A7968] mt-1">
          بيانات العملاء الذين قاموا بالطلب من المتجر وتاريخ تعاملاتهم (مجمعة بناءً على رقم الهاتف الفريد)
        </p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-3xl border border-[#E8DED1] shadow-warm-xs">
        <div className="relative">
          <input
            type="text"
            placeholder="البحث باسم العميل أو رقم الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF7F2] border border-[#E8DED1] rounded-2xl px-4 py-2 text-xs text-[#291D11] pl-9 focus:outline-none focus:border-[#C8692F]"
          />
          <Search className="w-4 h-4 text-[#8A7968] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Customers List Container */}
      <div className="bg-white rounded-3xl border border-[#E8DED1] shadow-warm-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-[#8A7968] text-xs">
            لا يوجد عملاء يطابقون البحث.
          </div>
        ) : (
          <>
            {/* Mobile Card View (< md) */}
            <div className="md:hidden divide-y divide-[#F0EAE1]">
              {filtered.map((customer) => (
                <div key={customer.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#291D11]">
                      {customer.name}
                    </span>
                    <span className="font-mono font-bold text-xs text-[#C8692F]">
                      {customer.total_spent} ج.م
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <a
                      href={`tel:${customer.phone}`}
                      className="font-mono text-[#C8692F] hover:underline"
                      dir="ltr"
                    >
                      {customer.phone}
                    </a>
                    <span className="bg-[#FAF7F2] border border-[#E8DED1] px-2 py-0.5 rounded-lg text-[11px] text-[#6E5F50]">
                      {customer.orders_count} طلب
                    </span>
                  </div>

                  {customer.email && (
                    <div className="text-[11px] text-[#8A7968] truncate" dir="ltr">
                      {customer.email}
                    </div>
                  )}

                  <div className="text-[10px] text-[#8A7968] text-left pt-1">
                    آخر طلب: {new Date(customer.last_order_at).toLocaleDateString("ar-EG")}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-right min-w-[600px]">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#E8DED1] text-[#8A7968]">
                    <th className="py-3.5 px-4 font-semibold">اسم العميل</th>
                    <th className="py-3.5 px-4 font-semibold">رقم الهاتف</th>
                    <th className="py-3.5 px-4 font-semibold">البريد الإلكتروني</th>
                    <th className="py-3.5 px-4 font-semibold">عدد الطلبات</th>
                    <th className="py-3.5 px-4 font-semibold">إجمالي المشتريات</th>
                    <th className="py-3.5 px-4 font-semibold">آخر طلب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EAE1]">
                  {filtered.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-[#FAF7F2]/60 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-[#291D11]">
                        {customer.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#6E5F50]" dir="ltr">
                        {customer.phone}
                      </td>
                      <td className="py-3.5 px-4 text-[#6E5F50]">
                        {customer.email || "—"}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#291D11]">
                        {customer.orders_count} طلب
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#C8692F]">
                        {customer.total_spent} ج.م
                      </td>
                      <td className="py-3.5 px-4 text-[#8A7968]">
                        {new Date(customer.last_order_at).toLocaleDateString("ar-EG")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
