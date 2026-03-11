import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function GET(request: NextRequest) {
  try {
    const parent = request.nextUrl.searchParams.get("parent");
    const result = parent
      ? await cloudinary.api.sub_folders(parent)
      : await cloudinary.api.root_folders();

    return NextResponse.json({
      folders: result.folders,
    });
  } catch (error: any) {
    console.error("List folders error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch folders" },
      { status: 500 },
    );
  }
}

// Recursively delete all resources + subfolders under a given path
async function deleteFolderRecursive(path: string): Promise<void> {
  // 1. Delete resources of every type (image, video, raw)
  for (const resourceType of ["image", "video", "raw"]) {
    try {
      await cloudinary.api.delete_resources_by_prefix(path, {
        resource_type: resourceType,
      });
    } catch {
      // Ignore — type may not exist in this folder
    }
  }

  // 2. Recursively delete every subfolder (sequential to avoid race conditions)
  try {
    const { folders: subfolders } = await cloudinary.api.sub_folders(path);
    if (subfolders && subfolders.length > 0) {
      for (const sub of subfolders as { path: string }[]) {
        await deleteFolderRecursive(sub.path);
      }
    }
  } catch {
    // No subfolders or already gone
  }

  // 3. Folder is now empty — delete it
  await cloudinary.api.delete_folder(path);
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { path } = body;

    if (!path) {
      return NextResponse.json(
        { error: "Folder path is required" },
        { status: 400 },
      );
    }

    await deleteFolderRecursive(path);

    return NextResponse.json({ success: true, path });
  } catch (error: any) {
    console.error("Delete folder error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete folder" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path } = body;

    if (!path) {
      return NextResponse.json(
        { error: "Folder path is required" },
        { status: 400 },
      );
    }

    // Create folder by uploading a dummy file and then deleting it
    const result = await cloudinary.uploader.upload(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      {
        folder: path,
        public_id: ".gitkeep",
        resource_type: "image",
      },
    );

    return NextResponse.json({
      success: true,
      folder: path,
      message: "Folder created successfully",
    });
  } catch (error: any) {
    console.error("Create folder error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create folder" },
      { status: 500 },
    );
  }
}
