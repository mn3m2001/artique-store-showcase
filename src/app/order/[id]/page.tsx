import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { OrderClient } from "./OrderClient";
import { canAccessOrder } from "@/lib/auth";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  if (!(await canAccessOrder(id))) return { title: "متابعة الطلب | Artique", robots: { index: false, follow: false } };
  const order = await db.getOrderById(id);

  if (!order) {
    return {
      title: "الطلب غير موجود | Artique",
    };
  }

  return {
    title: `تفاصيل الطلب ${order.order_number} | Artique`,
    description: `متابعة طلب المشغولات اليدوية من آرتيك - رقم الطلب ${order.order_number}`,
  };
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!(await canAccessOrder(id))) notFound();
  const [order, settings] = await Promise.all([
    db.getOrderById(id),
    db.getSettings(),
  ]);

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <OrderClient order={{ ...order, internal_notes: null, idempotency_key: undefined, history: order.history?.filter((entry) => entry.created_by === "customer" || entry.created_by === "system"), proofs: order.proofs?.map((proof) => ({ ...proof, review_note: undefined })) }} settings={settings} />
      </div>
    </div>
  );
}
