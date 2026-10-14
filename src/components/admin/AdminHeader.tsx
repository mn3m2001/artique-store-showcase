"use client";

import React from "react";
import { logoutAdminAction } from "@/app/admin/actions";
import { LogOut, User, Bell, Menu } from "lucide-react";

export function AdminHeader({
  onToggleMobileNav,
}: {
  onToggleMobileNav?: () => void;
}) {
  return (
    <header className="min-h-16 bg-white border-b border-[#E8DED1] px-3 sm:px-6 flex items-center justify-between gap-2 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onToggleMobileNav}
          className="lg:hidden p-2 rounded-xl text-[#291D11] hover:bg-[#FAF7F2] border border-[#E8DED1] transition-colors cursor-pointer"
          aria-label="فتح القائمة"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="font-serif font-bold text-sm sm:text-base text-[#291D11] truncate">
          لوحة تحكم مالكة المتجر
        </h1>
        <span className="hidden sm:inline bg-[#FAF7F2] text-[#7A7452] border border-[#E8DED1] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
          إصدار الإدارة 1.0
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* User Info */}
        <div className="flex items-center gap-2 text-xs text-[#291D11] bg-[#FAF7F2] py-1.5 px-3 rounded-xl border border-[#E8DED1]">
          <div className="w-6 h-6 rounded-full bg-[#C8692F] text-white flex items-center justify-center font-bold text-[10px]">
            A
          </div>
          <span className="font-medium hidden sm:inline">المديرة (Admin)</span>
        </div>

        {/* Logout Button */}
        <form action={logoutAdminAction}>
          <button
            type="submit"
            className="flex items-center gap-1.5 text-xs text-[#8A7968] hover:text-rose-600 bg-white hover:bg-rose-50 border border-[#E8DED1] hover:border-rose-200 py-1.5 px-3 rounded-xl transition-all font-medium cursor-pointer"
            title="تسجيل الخروج"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">تسجيل الخروج</span>
          </button>
        </form>
      </div>
    </header>
  );
}
