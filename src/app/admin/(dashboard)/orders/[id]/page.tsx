import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { OrderDetailAdminClient } from "./OrderDetailAdminClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const order = await db.getOrderById(id);
  if (!order) {
    return { title: "الطلب غير موجود | لوحة تحكم آرتيك" };
  }
  return {
    title: `طلب ${order.order_number} (${order.customer_name}) | لوحة تحكم آرتيك`,
  };
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = await db.getOrderById(id);

  if (!order) {
    notFound();
  }

  return <OrderDetailAdminClient order={order} />;
}
