import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    // Derive a clean public_id from the original filename
    const rawName = (formData.get("filename") as string) || file.name;
    const cleanName = rawName
      .replace(/\.[^/.]+$/, "") // strip extension (e.g. .jpg)
      .replace(/[^a-zA-Z0-9_-]/g, "-") // replace spaces/special chars with dash
      .replace(/-+/g, "-") // collapse consecutive dashes
      .replace(/^-+|-+$/g, "") // trim leading/trailing dashes
      .toLowerCase();

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: folder || undefined,
      resource_type: "auto",
      public_id: cleanName || undefined, // fallback to auto if name is empty
      unique_filename: true, // auto-suffix on name collision
      overwrite: false,
    });

    return NextResponse.json({
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      folder: result.folder,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 },
    );
  }
}
