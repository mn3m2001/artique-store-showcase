import { Metadata } from "next";
import { db } from "@/lib/db";
import { OrdersTableClient } from "./OrdersTableClient";

export const metadata: Metadata = {
  title: "إدارة الطلبات | لوحة تحكم آرتيك",
};

export default async function AdminOrdersPage() {
  const orders = await db.getOrders();
  return <OrdersTableClient initialOrders={orders} />;
}
