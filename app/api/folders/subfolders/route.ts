import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const folder = searchParams.get('folder') || '';

    const result = await cloudinary.api.sub_folders(folder);

    return NextResponse.json({
      folders: result.folders,
    });
  } catch (error: any) {
    console.error('List subfolders error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subfolders' },
      { status: 500 }
    );
  }
}
