import { NextRequest, NextResponse } from 'next/server';
import { CommentService } from '@/core/services/CommentService';
import { handleApiError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const postId = formData.get('postId') as string;
    const author = formData.get('author') as string;
    const email = formData.get('email') as string;
    const content = formData.get('content') as string;
    const parentId = (formData.get('parentId') as string) || undefined;

    await CommentService.create({
      postId,
      author,
      email,
      content,
      parentId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { error: message, status, code } = handleApiError(error);
    return NextResponse.json({ success: false, error: message, code }, { status });
  }
}
