"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSession } from "@/lib/session";

export async function loginAdminAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const from = (formData.get("from") as string) || "/admin";

  const isProd = process.env.NODE_ENV === "production";
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;

  if (!expectedUser || !expectedPass) {
    return {
      success: false,
      error: "يجب ضبط متغيرات البيئة ADMIN_USERNAME و ADMIN_PASSWORD في بيئة الإنتاج.",
    };
  }

  // In production, reject default credentials if left as admin/artique2026
  if (isProd && (expectedUser === "admin" || expectedPass === "artique2026")) {
    return {
      success: false,
      error: "غير مسموح باستخدام بيانات الدخول الافتراضية في بيئة الإنتاج. يرجى ضبط كلمة مرور قوية.",
    };
  }

  if (username === expectedUser && password === expectedPass) {
    const cookieStore = await cookies();
    // Set 7-day session cookie
    cookieStore.set("artique_admin_session", createSession("admin", 60 * 60 * 24 * 7), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
    });

    return { success: true, redirectUrl: from.startsWith("/admin") ? from : "/admin" };
  }

  return { success: false, error: "اسم المستخدم أو كلمة المرور غير صحيحة" };
}

export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete("artique_admin_session");
  redirect("/admin/login");
}
