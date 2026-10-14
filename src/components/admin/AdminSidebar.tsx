"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  MapPin,
  Settings,
  Users,
  ExternalLink,
  Sparkles,
  X,
  MessageSquare,
} from "lucide-react";

export function AdminSidebar({
  pendingReviewCount = 0,
  onClose,
  isMobile = false,
  isDemo = true,
}: {
  pendingReviewCount?: number;
  onClose?: () => void;
  isMobile?: boolean;
  isDemo?: boolean;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      title: "نظرة عامة",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: "إدارة المنتجات",
      href: "/admin/products",
      icon: Package,
    },
    {
      title: "إدارة الطلبات",
      href: "/admin/orders",
      icon: ShoppingBag,
      badge: pendingReviewCount > 0 ? pendingReviewCount : undefined,
    },
    {
      title: "مناطق توصيل دمياط",
      href: "/admin/shipping",
      icon: MapPin,
    },
    {
      title: "سجل العملاء",
      href: "/admin/customers",
      icon: Users,
    },
    {
      title: "إعدادات المتجر والتصميم",
      href: "/admin/settings",
      icon: Settings,
    },
    { title: "آراء العملاء والهدايا", href: "/admin/reviews", icon: MessageSquare },
  ];

  return (
    <aside
      className={`w-64 bg-white border-l border-[#E8DED1] flex flex-col shrink-0 min-h-screen ${
        isMobile ? "w-full min-h-full h-full" : ""
      }`}
    >
      {/* Brand & Store Identity */}
      <div className="p-5 border-b border-[#F0EAE1] flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#C8692F]/20 bg-[#FAF7F2] shrink-0">
            <Image
              src="/demo-media/5415cb931ba250dc.webp"
              alt="Artique"
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <h2 className="font-serif font-bold text-base text-[#291D11] truncate">
              آرتيك • Artique
            </h2>
            <span className="text-[11px] text-[#8A7968] block">
              لوحة الإدارة والمشغولات
            </span>
          </div>
        </div>

        {isMobile && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8A7968] hover:text-[#291D11] hover:bg-[#FAF7F2] transition-colors"
            title="إغلاق القائمة"
            aria-label="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="p-4 space-y-1.5 flex-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              onClick={onClose}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-[#C8692F] text-white shadow-warm-xs"
                  : "text-[#6E5F50] hover:bg-[#FAF7F2] hover:text-[#291D11]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#8A7968]"}`} />
                <span>{item.title}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-white text-[#C8692F]"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Mode Status & Storefront Link */}
      <div className="p-4 border-t border-[#F0EAE1] space-y-3">
        <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E8DED1] text-[11px] space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[#B8862B]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isDemo ? "وضع المعاينة المحلي (Demo)" : "المتجر منشور ومتصل"}</span>
          </div>
          <p className="text-[#8A7968] leading-tight text-[10px]">
            {isDemo ? "التغييرات محفوظة على هذا الجهاز. يمكنك تجربة إدارة المتجر قبل النشر." : "التغييرات والطلبات محفوظة على الإنترنت ومتاحة من أي جهاز."}
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="w-full flex items-center justify-center gap-2 text-xs text-[#291D11] hover:text-[#C8692F] bg-white border border-[#E8DED1] py-2.5 px-3 rounded-xl font-medium transition-colors"
        >
          <span>زيارة المتجر المباشر</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
}
