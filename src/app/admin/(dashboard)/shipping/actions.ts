"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ShippingArea } from "@/types";
import { revalidatePath } from "next/cache";
import { z } from "zod";
const areaSchema = z.object({ name_ar: z.string().trim().min(1, "اسم المنطقة مطلوب."), delivery_fee: z.number().finite().nonnegative("رسوم التوصيل لا يمكن أن تكون سالبة."), estimated_days_min: z.number().int().min(1, "أقل مدة للتوصيل يوم واحد."), estimated_days_max: z.number().int().min(1) }).passthrough().refine((area) => area.estimated_days_max >= area.estimated_days_min, "أقصى مدة للتوصيل يجب ألا تقل عن أدنى مدة.");

export async function saveShippingAreaAction(
  areaData: Partial<ShippingArea> & { id?: string }
) {
  try {
    await requireAdmin();
    const previous = areaData.id ? (await db.getShippingAreas()).find((area) => area.id === areaData.id) : undefined;
    areaSchema.parse({ ...previous, ...areaData });
    const saved = await db.saveShippingArea(areaData);

    revalidatePath("/checkout");
    revalidatePath("/admin/shipping");
    revalidatePath("/admin");

    return { success: true, area: saved };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) return { success: false, error: err.issues[0].message };
    console.error("Save shipping area error:", err);
    return { success: false, error: (err instanceof Error ? err.message : "حدث خطأ غير متوقع") || "فشل حفظ منطقة التوصيل" };
  }
}

export async function toggleShippingAreaStatusAction(
  id: string,
  isEnabled: boolean
) {
  try {
    await requireAdmin();
    const saved = await db.saveShippingArea({
      id,
      is_enabled: isEnabled,
    });

    revalidatePath("/checkout");
    revalidatePath("/admin/shipping");
    revalidatePath("/admin");

    return { success: true, area: saved };
  } catch (err: unknown) {
    console.error("Toggle shipping area status error:", err);
    return { success: false, error: (err instanceof Error ? err.message : "حدث خطأ غير متوقع") || "فشل تغيير حالة التوصيل" };
  }
}

export async function deleteShippingAreaAction(id: string) {
  try {
    await requireAdmin();
    const success = await db.deleteShippingArea(id);

    revalidatePath("/checkout");
    revalidatePath("/admin/shipping");
    revalidatePath("/admin");

    return { success };
  } catch (err: unknown) {
    console.error("Delete shipping area error:", err);
    return { success: false, error: (err instanceof Error ? err.message : "حدث خطأ غير متوقع") || "فشل حذف المنطقة" };
  }
}
