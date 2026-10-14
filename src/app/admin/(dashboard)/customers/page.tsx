import { Metadata } from "next";
import { db } from "@/lib/db";
import { CustomersClient } from "./CustomersClient";

export const metadata: Metadata = {
  title: "سجل العملاء | لوحة تحكم آرتيك",
};

export default async function AdminCustomersPage() {
  const customers = await db.getCustomers();
  return <CustomersClient customers={customers} />;
}
