"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Product } from "@/types";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const productSchema = z.object({ name_ar: z.string().trim().min(1, "اسم المشغولة بالعربية مطلوب."), base_price: z.number().finite().nonnegative("السعر لا يمكن أن يكون سالبًا."), preparation_days: z.number().int().nonnegative("مدة التجهيز يجب أن تكون عدد أيام صحيحًا."), stock_quantity: z.number().int().nonnegative("المخزون يجب أن يكون صفرًا أو عددًا صحيحًا موجبًا.").nullable(), status: z.enum(["draft", "published", "archived"]) }).passthrough();

export async function saveProductAction(productData: Partial<Product> & { id?: string }) {
  try {
    await requireAdmin();
    productSchema.parse(productData);
    if (productData.status === "published" && (!productData.base_price || productData.base_price <= 0)) return { success: false, error: "لا يمكن نشر مشغولة بدون سعر بيع أكبر من صفر." };
    const saved = await db.saveProduct(productData);

    revalidatePath("/products");
    revalidatePath("/");
    revalidatePath(`/products/${saved.slug}`);
    revalidatePath("/admin/products");
    revalidatePath("/admin");

    return { success: true, product: saved };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) return { success: false, error: err.issues[0].message };
    console.error("Save product error:", err);
    return { success: false, error: (err instanceof Error ? err.message : "حدث خطأ غير متوقع") || "فشل حفظ المنتج" };
  }
}

export async function deleteProductAction(id: string) {
  try {
    await requireAdmin();
    const success = await db.deleteProduct(id);

    revalidatePath("/products");
    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath("/admin");

    return { success };
  } catch (err: unknown) {
    console.error("Delete product error:", err);
    return { success: false, error: (err instanceof Error ? err.message : "حدث خطأ غير متوقع") || "فشل حذف المنتج" };
  }
}

export async function toggleProductStatusAction(id: string, currentStatus: "published" | "draft") {
  try {
    await requireAdmin();
    const newStatus = currentStatus === "published" ? "draft" : "published";
    const product = await db.getProductById(id);
    if (!product) return { success: false, error: "المنتج غير موجود" };

    if (newStatus === "published" && (!product.base_price || product.base_price <= 0)) {
      return {
        success: false,
        error: "لا يمكن نشر المشغولة بدون تحديد سعر بيع (السعر الحالي 0 أو غير محدد). يرجى تعديل السعر أولاً.",
      };
    }

    const updated = await db.saveProduct({
      id,
      status: newStatus,
    });

    revalidatePath("/products");
    revalidatePath("/");
    revalidatePath(`/products/${updated.slug}`);
    revalidatePath("/admin/products");
    revalidatePath("/admin");

    return { success: true, newStatus };
  } catch (err: unknown) {
    console.error("Toggle product status error:", err);
    return { success: false, error: (err instanceof Error ? err.message : "حدث خطأ غير متوقع") || "فشل تغيير حالة المنتج" };
  }
}
