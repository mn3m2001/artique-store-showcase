import { db, isDemoMode } from "@/lib/db";
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";
import { requireAdmin } from "@/lib/auth";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  const orders = await db.getOrders();
  const pendingReviewCount = orders.filter(
    (o) => o.payment_status === "awaiting_review" && o.proofs && o.proofs.length > 0
  ).length;

  return (
    <AdminLayoutClient pendingReviewCount={pendingReviewCount} isDemo={isDemoMode()}>
      {children}
    </AdminLayoutClient>
  );
}
