import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { old_path, new_path } = body;

    if (!old_path || !new_path) {
      return NextResponse.json(
        { error: "old_path and new_path are required" },
        { status: 400 },
      );
    }

    if (old_path === new_path) {
      return NextResponse.json({ success: true, message: "No change needed" });
    }

    // Fetch all resources in the old folder
    const { resources } = await cloudinary.api.resources({
      type: "upload",
      prefix: old_path,
      max_results: 500,
    });

    // Rename each resource to point to the new folder path
    await Promise.all(
      resources.map((resource: { public_id: string }) => {
        const baseName =
          resource.public_id.slice(old_path.length + 1) ||
          resource.public_id.split("/").pop();
        const newPublicId = `${new_path}/${baseName}`;
        return cloudinary.uploader.rename(resource.public_id, newPublicId, {
          overwrite: false,
        });
      }),
    );

    // Delete the now-empty old folder
    try {
      await cloudinary.api.delete_folder(old_path);
    } catch {
      // Ignore — might already be empty or removed
    }

    return NextResponse.json({ success: true, old_path, new_path });
  } catch (error: any) {
    console.error("Rename folder error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to rename folder" },
      { status: 500 },
    );
  }
}
