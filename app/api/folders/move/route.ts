import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { from_public_id, to_public_id } = body;

    if (!from_public_id || !to_public_id) {
      return NextResponse.json(
        { error: "from_public_id and to_public_id are required" },
        { status: 400 },
      );
    }

    // Cloudinary rename = effectively a move
    const result = await cloudinary.uploader.rename(
      from_public_id,
      to_public_id,
      {
        overwrite: false,
      },
    );

    return NextResponse.json({
      success: true,
      public_id: result.public_id,
      secure_url: result.secure_url,
    });
  } catch (error: any) {
    console.error("Move error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to move image" },
      { status: 500 },
    );
  }
}
