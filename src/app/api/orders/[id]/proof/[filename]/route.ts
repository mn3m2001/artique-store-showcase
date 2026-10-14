import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { db } from "@/lib/db";
import { canAccessOrder } from "@/lib/auth";
import { readMedia } from "@/lib/media-storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; filename: string }> }
) {
  const { id: orderId, filename } = await params;
  const order = await db.getOrderById(orderId);
  if (!(await canAccessOrder(orderId))) return new NextResponse("Forbidden", { status: 403 });
  const proofUrl = `/api/orders/${orderId}/proof/${filename}`;
  if (!order?.proofs?.some((proof) => proof.file_url === proofUrl)) return new NextResponse("Not found", { status: 404 });

  // Prevent path traversal attacks
  const sanitizedFilename = path.basename(filename);

  try {
    const fileBuffer = await readMedia("private_proofs", sanitizedFilename);
    const ext = path.extname(sanitizedFilename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
    };
    const contentType = mimeTypes[ext] || "application/octet-stream";

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Proof file not found", { status: 404 });
  }
}
