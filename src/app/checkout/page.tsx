import { Metadata } from "next";
import { db } from "@/lib/db";
import { CheckoutClient } from "./CheckoutClient";

export const metadata: Metadata = {
  title: "إتمام الطلب | Artique",
  description: "إتمام طلب المشغولات اليدوية من آرتيك - التوصيل متاح داخل محافظة دمياط فقط.",
};

export default async function CheckoutPage() {
  const [shippingAreas, settings] = await Promise.all([
    db.getShippingAreas(true), // only enabled areas
    db.getSettings(),
  ]);

  return (
    <div className="storefront-shell atelier-purchase min-h-screen bg-[#FAF7F2] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CheckoutClient shippingAreas={shippingAreas} settings={settings} />
      </div>
    </div>
  );
}
