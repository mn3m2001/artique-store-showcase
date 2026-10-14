import { Metadata } from "next";
import { db } from "@/lib/db";
import { SettingsClient } from "./SettingsClient";

export const metadata: Metadata = {
  title: "إعدادات المتجر والدفع | لوحة تحكم آرتيك",
};

export default async function AdminSettingsPage() {
  const settings = await db.getSettings();
  return <SettingsClient initialSettings={settings} />;
}
