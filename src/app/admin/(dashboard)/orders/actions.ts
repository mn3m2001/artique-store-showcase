"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { FulfillmentStatus, PaymentStatus, RefundDetails } from "@/types";
import { revalidatePath } from "next/cache";

export async function updateOrderStatusAction(
  orderId: string,
  data: {
    fulfillmentStatus?: FulfillmentStatus;
    paymentStatus?: PaymentStatus;
    internalNotes?: string;
    expectedDeliveryDate?: string | null;
    actualDeliveryDate?: string | null;
    refundDetails?: RefundDetails | null;
    comment?: string;
  }
) {
  try {
    await requireAdmin();
    const updated = await db.updateOrderStatus(orderId, {
      ...data,
      actor: "admin",
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/order/${orderId}`);
    revalidatePath("/admin");

    return { success: true, order: updated };
  } catch (err: unknown) {
    console.error("Update order status error:", err);
    return { success: false, error: (err instanceof Error ? err.message : "حدث خطأ غير متوقع") || "فشل تحديث حالة الطلب" };
  }
}

export async function reviewPaymentProofAction(
  orderId: string,
  proofId: string,
  review: {
    status: "accepted" | "rejected";
    note?: string;
  }
) {
  try {
    await requireAdmin();
    const updated = await db.reviewPaymentProof(orderId, proofId, {
      status: review.status,
      note: review.note,
      actor: "admin",
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/order/${orderId}`);
    revalidatePath("/admin");

    return { success: true, order: updated };
  } catch (err: unknown) {
    console.error("Review proof error:", err);
    return { success: false, error: (err instanceof Error ? err.message : "حدث خطأ غير متوقع") || "فشل مراجعة إشعار التحويل" };
  }
}
