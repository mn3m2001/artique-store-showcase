import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductFormClient } from "../ProductFormClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  if (id === "new") {
    return { title: "إضافة مشغولة جديدة | لوحة تحكم آرتيك" };
  }
  const product = await db.getProductById(id);
  return {
    title: product ? `تعديل: ${product.name_ar} | لوحة تحكم آرتيك` : "تعديل مشغولة",
  };
}

export default async function AdminProductEditPage({ params }: PageProps) {
  const { id } = await params;
  const categories = await db.getCategories();

  if (id === "new") {
    return <ProductFormClient initialProduct={null} categories={categories} />;
  }

  const product = await db.getProductById(id);
  if (!product) {
    notFound();
  }

  return <ProductFormClient initialProduct={product} categories={categories} />;
}
