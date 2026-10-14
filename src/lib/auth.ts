import { cookies } from "next/headers";
import { verifySession } from "./session";

export async function isAdmin() {
  const jar = await cookies();
  return verifySession(jar.get("artique_admin_session")?.value, "admin");
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("يرجى تسجيل الدخول إلى لوحة الإدارة.");
}

export async function canAccessOrder(id: string) {
  const jar = await cookies();
  return verifySession(jar.get("artique_admin_session")?.value, "admin") ||
    verifySession(jar.get(`artique_order_access_${id}`)?.value, `order:${id}`);
}
