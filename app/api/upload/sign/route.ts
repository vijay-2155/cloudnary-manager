import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

/**
 * POST /api/upload/sign
 * Returns a signed set of params so the client can upload directly to Cloudinary.
 * This keeps the API secret server-side and bypasses Vercel's 4.5 MB body limit.
 */
export async function POST(request: NextRequest) {
  try {
    const { folder, public_id, timestamp } = await request.json();

    const paramsToSign: Record<string, string | number | boolean> = {
      timestamp,
      unique_filename: true,
      overwrite: false,
    };
    if (folder) paramsToSign.folder = folder;
    if (public_id) paramsToSign.public_id = public_id;

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!,
    );

    return NextResponse.json({
      signature,
      timestamp,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    });
  } catch (error: any) {
    console.error("Sign error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate signature" },
      { status: 500 },
    );
  }
}
