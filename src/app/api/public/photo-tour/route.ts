import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const storedProducts = await db.getProducts({ status: "published" });
  const products = storedProducts.flatMap((product) => {
    const image = product.images?.find((candidate) => candidate.is_cover) || product.images?.[0];
    if (!image?.url || !Number.isFinite(product.base_price) || product.base_price <= 0) return [];

    return [{
      slug: product.slug,
      name_ar: product.name_ar,
      name_en: product.name_en,
      description_ar: product.description_ar,
      description_en: product.description_en,
      price: product.base_price,
      is_made_to_order: product.is_made_to_order,
      stock_quantity: product.stock_quantity,
      category_ar: product.category?.name_ar || "من الأتيليه",
      category_en: product.category?.name_en || "From the Atelier",
      image: {
        url: image.url,
        alt_ar: image.alt_ar || product.name_ar,
        alt_en: image.alt_en || product.name_en,
      },
    }];
  });

  return Response.json({ products }, {
    headers: {
      "Cache-Control": "no-store, max-age=0, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
