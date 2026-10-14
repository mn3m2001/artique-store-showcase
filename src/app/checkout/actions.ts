"use server";

import { db } from "@/lib/db";
import { PaymentMethod } from "@/types";
import { z } from "zod";
import { cookies } from "next/headers";
import { createSession } from "@/lib/session";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "الاسم مطلوب (حرفين على الأقل)"),
  customerPhone: z.string().regex(/^(010|011|012|015)[0-9]{8}$/, "يرجى إدخال رقم هاتف مصري صحيح مكون من 11 رقماً"),
  customerEmail: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
  shippingAreaId: z.string().min(1, "يرجى اختيار منطقة التوصيل داخل دمياط"),
  shippingAddressDetailed: z.string().min(5, "يرجى كتابة العنوان التفصيلي بدقة"),
  customerNotes: z.string().optional(),
  paymentMethod: z.enum(["instapay", "vodafone_cash", "cod"]),
  idempotencyKey: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      variantId: z.string().nullable().optional(),
      quantity: z.number().int().positive(),
      customNote: z.string().nullable().optional(),
    })
  ).min(1, "السلة فارغة"),
});

export async function submitCheckoutAction(formData: z.input<typeof checkoutSchema>) {
  try {
    const settings = await db.getSettings();

    // Check email requirement setting
    if (settings.require_email_at_checkout && !formData.customerEmail) {
      return { success: false, error: "البريد الإلكتروني مطلوب لإتمام الطلب (وفقاً لإعدادات المتجر)." };
    }

    const validated = checkoutSchema.parse(formData);
    const enabled = { instapay: settings.instapay_enabled, vodafone_cash: settings.vodafone_cash_enabled, cod: settings.cod_enabled };
    if (!enabled[validated.paymentMethod]) return { success: false, error: "طريقة الدفع المختارة غير متاحة حاليًا." };

    const { order, isDuplicate } = await db.createOrder({
      customerName: validated.customerName,
      customerPhone: validated.customerPhone,
      customerEmail: validated.customerEmail || null,
      shippingAreaId: validated.shippingAreaId,
      shippingAddressDetailed: validated.shippingAddressDetailed,
      customerNotes: validated.customerNotes || null,
      paymentMethod: validated.paymentMethod as PaymentMethod,
      idempotencyKey: validated.idempotencyKey,
      items: validated.items,
    });

    const jar = await cookies();
    jar.set(`artique_order_access_${order.id}`, createSession(`order:${order.id}`, 60 * 60 * 24 * 30), {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30,
    });
    return {
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      isDuplicate,
    };
  } catch (err: unknown) {
    console.error("Checkout action error:", err);
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues[0]?.message || "بيانات الطلب غير مكتملة." };
    }
    return { success: false, error: (err instanceof Error ? err.message : "حدث خطأ غير متوقع") || "حدث خطأ أثناء حفظ الطلب. يرجى المحاولة مرة أخرى." };
  }
}
