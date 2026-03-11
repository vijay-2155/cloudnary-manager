import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const folder = searchParams.get("folder") || "";
    const type = searchParams.get("type") || "image";
    const maxResults = parseInt(searchParams.get("max_results") || "30");
    const nextCursor = searchParams.get("next_cursor") || undefined;

    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: folder,
      resource_type: type,
      max_results: maxResults,
      next_cursor: nextCursor,
    });

    return NextResponse.json({
      resources: result.resources,
      total_count: result.total_count,
      next_cursor: result.next_cursor || null,
    });
  } catch (error: any) {
    console.error("List resources error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch resources" },
      { status: 500 },
    );
  }
}
