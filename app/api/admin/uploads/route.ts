import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin-api";
import { logAdminAction } from "@/lib/audit-log";
import {
  buildR2ObjectKey,
  publicR2UrlForKey,
  uploadToR2,
  validateImageUpload,
} from "@/lib/r2-upload";

export async function POST(request: NextRequest) {
  const { error, session } = await requireAdminRole(request, ["super_admin", "product_manager"]);
  if (error) return error;

  try {
    const form = await request.formData();
    const file = form.get("file");
    const folder = typeof form.get("folder") === "string" ? String(form.get("folder")) : "products";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    const validation = validateImageUpload(file);
    if (validation.error || !validation.extension) {
      return NextResponse.json({ error: validation.error || "Invalid image" }, { status: 400 });
    }

    const key = buildR2ObjectKey(folder, validation.extension);
    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadToR2({ key, body: buffer, contentType: file.type });
    const url = publicR2UrlForKey(key);

    await logAdminAction(request, session!, {
      action: "upload",
      entityType: "image",
      entityId: key,
      metadata: { folder, contentType: file.type, size: file.size },
    });

    return NextResponse.json({ url, key });
  } catch (error) {
    console.error("Admin upload error:", error);
    return NextResponse.json({ error: "Unable to upload image" }, { status: 500 });
  }
}
