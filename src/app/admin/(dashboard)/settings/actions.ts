"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { StoreSettings } from "@/types";
import { revalidatePath } from "next/cache";

export async function updateStoreSettingsAction(patch: Partial<StoreSettings>, note?: string) {
  try {
    await requireAdmin();
    const updated = await db.updateSettings(patch, note);

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/checkout");
    revalidatePath("/admin/settings");
    revalidatePath("/admin");

    return { success: true, settings: updated };
  } catch (err: unknown) {
    console.error("Update settings error:", err);
    return { success: false, error: (err instanceof Error ? err.message : "حدث خطأ غير متوقع") || "فشل حفظ الإعدادات" };
  }
}

export async function rollbackSettingsAction(versionIndex: number) {
  try {
    await requireAdmin();
    const updated = await db.rollbackSettings(versionIndex);

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/checkout");
    revalidatePath("/admin/settings");
    revalidatePath("/admin");

    return { success: true, settings: updated };
  } catch (err: unknown) {
    console.error("Rollback settings error:", err);
    return { success: false, error: (err instanceof Error ? err.message : "حدث خطأ غير متوقع") || "فشل استرجاع الإصدار" };
  }
}

export async function getSettingsHistoryAction() {
  try {
    await requireAdmin();
    const history = await db.getSettingsHistory();
    return { success: true, history };
  } catch (err: unknown) {
    console.error("Get settings history error:", err);
    return { success: false, history: [] };
  }
}
