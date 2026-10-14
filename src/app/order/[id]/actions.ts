"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { canAccessOrder } from "@/lib/auth";
import { createSession } from "@/lib/session";
import sharp from "sharp";
import { saveMedia } from "@/lib/media-storage";

export async function uploadPaymentProofAction(formData: FormData) {
  try {
    const orderId = formData.get("orderId") as string;
    const file = formData.get("file") as File | null;

    if (!orderId) {
      return { success: false, error: "رقم الطلب غير متوفر" };
    }

    const order = await db.getOrderById(orderId);
    if (!(await canAccessOrder(orderId))) return { success: false, error: "غير مسموح بالوصول إلى هذا الطلب." };
    if (!order) {
      return { success: false, error: "الطلب غير موجود" };
    }
    if (order.payment_method === "cod" || ["verified", "paid", "refunded"].includes(order.payment_status)) return { success: false, error: "هذا الطلب لا يقبل إشعار دفع جديد." };

    if (!file || file.size === 0) {
      return { success: false, error: "يرجى اختيار صورة إشعار التحويل" };
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت" };
    }

    // Allowed mime types
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: "صيغة الملف غير مدعومة. يرجى رفع صورة (JPG, PNG, WEBP)" };
    }

    const ext = "webp";
    const fileName = `proof_${order.order_number}_${Date.now()}.${ext}`;

    const buffer = await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 25_000_000 }).rotate().resize({ width: 1800, withoutEnlargement: true }).webp({ quality: 90 }).toBuffer();
    await saveMedia("private_proofs", fileName, buffer);

    const secureUrl = `/api/orders/${orderId}/proof/${fileName}`;

    await db.submitPaymentProof(orderId, secureUrl);

    // Grant this customer browser access to view their own submitted proof
    const cookieStore = await cookies();
    cookieStore.set(`artique_order_access_${orderId}`, createSession(`order:${orderId}`, 60 * 60 * 24 * 30), {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    revalidatePath(`/order/${orderId}`);
    revalidatePath(`/admin/orders`);
    revalidatePath(`/admin/orders/${orderId}`);

    return { success: true, fileUrl: secureUrl };
  } catch (err: unknown) {
    console.error("Proof upload error:", err);
    return { success: false, error: (err instanceof Error ? err.message : "حدث خطأ غير متوقع") || "فشل رفع الإشعار. حاول مرة أخرى." };
  }
}
