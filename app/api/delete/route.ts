import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { public_id, resource_type = 'image' } = body;

    if (!public_id) {
      return NextResponse.json(
        { error: 'public_id is required' },
        { status: 400 }
      );
    }

    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type,
    });

    return NextResponse.json({
      success: result.result === 'ok',
      result: result.result,
    });
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete resource' },
      { status: 500 }
    );
  }
}
