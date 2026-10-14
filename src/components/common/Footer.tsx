"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { MapPin, Heart, ShieldCheck, PhoneCall } from "lucide-react";
import { InstagramIcon } from "./InstagramIcon";

export function Footer() {
  const { locale, t } = useLanguage();

  return (
    <footer className="bg-[#23180E] text-[#E8DED1] pt-16 pb-12 border-t border-[#3A2A1A] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#3A2A1A]">
          {/* Col 1: Brand story */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#FAF7F2] p-1">
                <Image
                  src="/demo-media/logo-67c9bd5fb43debcf.png"
                  alt="Artique Logo"
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </div>
              <span className="font-serif text-2xl font-bold text-[#FAF7F2]">{t.brand}</span>
            </div>
            <p className="text-sm leading-relaxed text-[#BFAEA0] max-w-md">
              {locale === "ar"
                ? "براند مصري للمشغولات اليدوية وفنون الكروشيه من دمياط. نصنع كل قطعة بشغف وعناية فائقة لنقدم لكم قطعاً تدوم وتبقى ذكرى دافئة في بيوتكم."
                : "Handcrafted artisan crochet brand based in Damietta, Egypt. Every stitch is woven with passion and dedication to deliver timeless handmade pieces."}
            </p>
            <div className="flex items-center gap-2 text-xs text-[#C8692F] font-semibold bg-[#2E2013] py-1.5 px-3 rounded-full w-fit border border-[#4A3522]">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{t.badges.damiettaOnly}</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#FAF7F2]">
              {locale === "ar" ? "روابط سريعة" : "Quick Links"}
            </h4>
            <ul className="space-y-2 text-sm text-[#BFAEA0]">
              <li>
                <Link href="/" className="hover:text-[#C8692F] transition-colors">
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-[#C8692F] transition-colors">
                  {t.nav.products}
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-[#C8692F] transition-colors">
                  {t.nav.cart}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Payment & Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#FAF7F2]">
              {locale === "ar" ? "طرق الدفع والتواصل" : "Payment & Social"}
            </h4>
            <div className="space-y-2 text-sm text-[#BFAEA0]">
              <a
                href="https://www.instagram.com/artique_11/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#C8692F] transition-colors"
              >
                <InstagramIcon className="w-4 h-4 text-[#C8692F]" />
                <span>@artique_11</span>
              </a>
              <div className="pt-2">
                <span className="text-xs text-[#8A7969] block mb-1">
                  {locale === "ar" ? "وسائل الدفع المعتمدة:" : "Accepted Payments:"}
                </span>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <span className="bg-[#2E2013] border border-[#4A3522] px-2 py-0.5 rounded text-[#D9CBB7]">InstaPay</span>
                  <span className="bg-[#2E2013] border border-[#4A3522] px-2 py-0.5 rounded text-[#D9CBB7]">Vodafone Cash</span>
                  <span className="bg-[#2E2013] border border-[#4A3522] px-2 py-0.5 rounded text-[#D9CBB7]">
                    {locale === "ar" ? "الدفع عند الاستلام" : "Cash on Delivery"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A7969]">
          <p>© {new Date().getFullYear()} {t.brand}. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-[#C8692F] fill-[#C8692F]" />
            <span>in Damietta, Egypt</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
