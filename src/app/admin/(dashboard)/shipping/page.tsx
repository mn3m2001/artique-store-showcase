import { Metadata } from "next";
import { db } from "@/lib/db";
import { ShippingClient } from "./ShippingClient";

export const metadata: Metadata = {
  title: "مناطق التوصيل بدمياط | لوحة تحكم آرتيك",
};

export default async function AdminShippingPage() {
  const areas = await db.getShippingAreas(false);
  return <ShippingClient initialAreas={areas} />;
}
