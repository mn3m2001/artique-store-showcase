"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import {
  ShoppingBag,
  Globe,
  Menu,
  X,
  MapPin,
  Sparkles,
} from "lucide-react";
import { InstagramIcon } from "./InstagramIcon";
import { MobileStoreNav } from "./MobileStoreNav";

export function Header({
  isDemo = false,
  announcement,
  immersive = true,
}: {
  isDemo?: boolean;
  immersive?: boolean;
  announcement?: {
    enabled?: boolean;
    textAr?: string;
    textEn?: string;
  };
}) {
  const { locale, t, setLocale } = useLanguage();
  const { itemCount, isHydrated } = useCart();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    const closeOnDesktop = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeOnDesktop);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeOnDesktop);
    };
  }, [mobileMenuOpen]);

  const toggleLanguage = () => {
    setLocale(locale === "ar" ? "en" : "ar");
  };

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/#categories", label: t.nav.categories },
    { href: "/products", label: t.nav.products },
    { href: "/#story", label: t.nav.story },
  ];

  return (
    <>
      {/* Unified Top Utility & Announcement Bar */}
      <div className={`${immersive ? "hidden" : ""} bg-[#291D11] text-[#FAF7F2] text-xs py-2 px-4 transition-colors border-b border-[#3D2C1C]`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#C8692F] shrink-0" />
            <span>
              {announcement?.enabled && (announcement.textAr || announcement.textEn)
                ? (locale === "ar"
                    ? announcement.textAr || announcement.textEn
                    : announcement.textEn || announcement.textAr)
                : (locale === "ar"
                    ? "التوصيل حصري لمحافظة دمياط | الدفع عبر إنستا باي، فودافون كاش، وعند الاستلام"
                    : "Delivery exclusive to Damietta Governorate, Egypt | InstaPay, Vodafone Cash & COD")}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {isDemo && (
              <span className="inline-flex items-center gap-1 bg-[#C8692F]/20 text-[#E5A882] px-2 py-0.5 rounded text-[11px] font-semibold border border-[#C8692F]/30">
                <Sparkles className="w-3 h-3" />
                {locale === "ar" ? "وضع العرض التجريبي" : "DEMO MODE"}
              </span>
            )}

            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 hover:text-[#C8692F] transition-colors py-0.5 px-2 rounded hover:bg-white/5 cursor-pointer"
              aria-label="Toggle language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="font-semibold">{locale === "ar" ? "English" : "العربية"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <header className="store-header sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DED1] transition-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#F3ECE1] border border-[#E0D3C1] group-hover:border-[#C8692F] transition-all">
              <Image
                src="/demo-media/logo-67c9bd5fb43debcf.png"
                alt="Artique Logo"
                fill
                sizes="48px"
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-tight text-[#291D11] group-hover:text-[#C8692F] transition-colors">
                {t.brand}
              </span>
              <span className="text-[11px] text-[#6E5F50] font-medium hidden sm:block">
                {locale === "ar" ? "مشغولات كروشيه يدوية" : "Handcrafted Crochet"}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-[#4A3B2C]">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`hover:text-[#C8692F] transition-colors py-1 relative ${
                    isActive ? "text-[#C8692F] font-bold" : ""
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C8692F] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Instagram, Cart, Mobile Toggle */}
          <div className="flex items-center gap-3">
            {immersive && <button onClick={toggleLanguage} className="glass-control text-xs font-semibold px-3 py-2" aria-label="Toggle language">{locale === "ar" ? "EN" : "عربي"}</button>}
            {/* Instagram Link */}
            <a
              href="https://www.instagram.com/artique_11/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-[#6E5F50] hover:text-[#C8692F] hover:bg-[#F3ECE1] rounded-full transition-colors hidden sm:flex items-center justify-center"
              title="Instagram @artique_11"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-5 h-5" />
            </a>

            {/* Shopping Cart Button */}
            <Link
              href="/cart"
              className="glass-control relative flex items-center gap-2 bg-[#F3ECE1] hover:bg-[#EBE0D0] text-[#291D11] px-4 py-2.5 rounded-full font-medium text-sm transition-all border border-[#E0D3C1] hover:border-[#C8692F]"
              aria-label={`${t.nav.cart}${isHydrated && itemCount > 0 ? ` (${itemCount})` : ""}`}
            >
              <ShoppingBag className="w-4 h-4 text-[#C8692F]" />
              <span className="hidden sm:inline">{t.nav.cart}</span>
              {isHydrated && itemCount > 0 && (
                <span className="bg-[#C8692F] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="glass-control md:hidden p-2 text-[#291D11] hover:bg-[#F3ECE1] rounded-lg transition-colors"
              aria-label={locale === "ar" ? "قائمة المتجر" : "Store menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="store-mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div id="store-mobile-menu" className="md:hidden bg-[#FAF7F2] border-b border-[#E8DED1] px-4 pt-2 pb-6 space-y-3">
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-base font-medium text-[#291D11] hover:bg-[#F3ECE1] rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-[#E8DED1] flex flex-col gap-2">
                <a
                  href="https://www.instagram.com/artique_11/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 text-base font-medium text-[#291D11] hover:bg-[#F3ECE1] rounded-lg flex items-center gap-2"
                >
                  <InstagramIcon className="w-5 h-5 text-[#C8692F]" />
                  <span>{t.nav.instagram} (@artique_11)</span>
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>
      <MobileStoreNav />
    </>
  );
}
