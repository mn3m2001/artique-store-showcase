"use server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

const review = z.object({ id: z.string().min(1), name: z.string().trim().min(1).max(60), quote_ar: z.string().trim().min(1).max(600), quote_en: z.string().trim().max(600).optional(), rating: z.number().int().min(1).max(5), confirmed: z.boolean(), published: z.boolean() }).refine((item) => !item.published || item.confirmed, "يلزم تأكيد صحة التقييم وموافقة العميل قبل نشره.");
const schema = z.object({ customer_reviews: z.array(review).max(12), gift_wrap_available: z.boolean(), gift_wrap_description_ar: z.string().trim().max(500), gift_wrap_description_en: z.string().trim().max(500) });
export async function saveReviewsAndGiftsAction(input: unknown) {
  try {
    await requireAdmin();
    const settings = schema.parse(input);
    await db.updateSettings(settings, "تحديث آراء العملاء والتغليف");
    revalidatePath("/"); revalidatePath("/checkout"); revalidatePath("/admin/reviews");
    return { success: true };
  } catch (error) { return { success: false, error: error instanceof z.ZodError ? error.issues[0].message : "تعذر الحفظ. تأكدي من البيانات وتسجيل الدخول." }; }
}
