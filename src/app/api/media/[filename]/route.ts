import { readMedia } from "@/lib/media-storage";

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  if (!/^media-[a-f0-9-]+\.webp$/.test(filename)) return new Response("Not found", { status: 404 });
  try {
    const image = await readMedia("product-media", filename);
    return new Response(new Uint8Array(image), { headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" } });
  } catch { return new Response("Not found", { status: 404 }); }
}
