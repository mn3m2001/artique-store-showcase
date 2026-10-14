"use server";

import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { requireAdmin } from "@/lib/auth";
import { saveMedia } from "@/lib/media-storage";

export async function uploadProductImageAction(formData: FormData) {
  try {
    await requireAdmin();
    const file = formData.get("file");
    if (!(file instanceof File) || !file.size || file.size > 8 * 1024 * 1024) return { success: false, error: "اختاري صورة بحد أقصى 8 ميجابايت." };
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return { success: false, error: "الصيغ المتاحة: JPG وPNG وWEBP." };
    const image = await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 25_000_000 }).rotate().resize({ width: 1800, withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
    const filename = `media-${randomUUID()}.webp`;
    await saveMedia("product-media", filename, image);
    return { success: true, url: `/api/media/${filename}` };
  } catch { return { success: false, error: "تعذر رفع الصورة. تأكدي من صلاحية الملف وتسجيل الدخول." }; }
}
