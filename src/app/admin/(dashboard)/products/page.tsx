import { Metadata } from "next";
import { db } from "@/lib/db";
import { ProductsTableClient } from "./ProductsTableClient";

export const metadata: Metadata = {
  title: "إدارة المشغولات | لوحة تحكم آرتيك",
};

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    db.getProducts(),
    db.getCategories(),
  ]);

  return <ProductsTableClient initialProducts={products} categories={categories} />;
}
