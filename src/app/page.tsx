import React from "react";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { AtelierHome } from "@/components/home/AtelierHome";
import { db, isDemoMode } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const isDemo = isDemoMode();
  const settings = await db.getSettings();
  const categories = await db.getCategories();
  const featuredProducts = await db.getProducts({ featuredOnly: true, status: "published" });

  return (
    <div className="storefront-shell flex-1 flex flex-col min-h-screen bg-[#FAF7F2]">
      <Header
        immersive
        isDemo={isDemo}
        announcement={{
          enabled: settings.announcement_bar_enabled,
          textAr: settings.announcement_bar_ar,
          textEn: settings.announcement_bar_en,
        }}
      />

      <AtelierHome
        settings={settings}
        categories={categories}
        featuredProducts={featuredProducts}
        isDemo={isDemo}
      />

      <Footer />
    </div>
  );
}
