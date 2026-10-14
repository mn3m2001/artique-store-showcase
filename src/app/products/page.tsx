import React from "react";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { ProductsClient } from "./ProductsClient";
import { db, isDemoMode } from "@/lib/db";

export const dynamic = "force-dynamic";

interface ProductsPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const isDemo = isDemoMode();
  const { category } = await searchParams;

  const categories = await db.getCategories();
  const settings = await db.getSettings();
  // Fetch all published products for the storefront
  const products = await db.getProducts({ status: "published" });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#FAF7F2]">
      <Header isDemo={isDemo} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        <ProductsClient
          initialProducts={products}
          categories={categories}
          initialCategorySlug={category || ""}
          enable3D={settings.enable_3d_hero}
        />
      </main>

      <Footer />
    </div>
  );
}
