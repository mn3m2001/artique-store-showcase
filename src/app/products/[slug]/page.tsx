import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isAdmin as hasAdminSession } from "@/lib/auth";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { ProductDetailClient } from "./ProductDetailClient";
import { db, isDemoMode } from "@/lib/db";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.getProductBySlug(slug);
  const isAdmin = await hasAdminSession();

  if (!product || (product.status !== "published" && !isAdmin)) {
    return {
      title: "المشغولة غير متوفرة | Artique",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${product.name_ar} | مشغولات آرتيك اليدوية`,
    description: product.description_ar?.slice(0, 160) || "مشغولات كروشيه وهاند ميد فاخرة من دمياط",
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const isDemo = isDemoMode();
  const { slug } = await params;
  const product = await db.getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const isAdmin = await hasAdminSession();

  // If the product is a draft or not published, block regular visitors completely!
  // Only authenticated admins can preview unpublished drafts.
  if (product.status !== "published" && !isAdmin) {
    notFound();
  }

  const isDraftPreview = product.status !== "published" && isAdmin;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#FAF7F2]">
      <Header isDemo={isDemo} />

      {/* Admin Draft Preview Warning Banner */}
      {isDraftPreview && (
        <div className="bg-amber-500 text-white py-2.5 px-4 text-center text-xs font-bold shadow-xs">
          🔒 وضع المعاينة الخاصة بالإدارة — هذا المنتج (مسودة غير منشورة للزوار) ولا يمكن للعملاء مشاهدته أو شراؤه.
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <ProductDetailClient product={product} isDraftPreview={isDraftPreview} />
      </main>

      <Footer />
    </div>
  );
}
