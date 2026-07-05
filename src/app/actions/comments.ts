'use server';

import { CommentService } from '@/core/services/CommentService';
import { revalidatePath } from 'next/cache';

export async function submitCommentAction(formData: FormData) {
  const postId = formData.get('postId') as string;
  const author = formData.get('author') as string;
  const email = formData.get('email') as string;
  const content = formData.get('content') as string;
  const parentId = formData.get('parentId') as string || undefined;

  try {
    await CommentService.create({
      postId,
      author,
      email,
      content,
      parentId
    });

    revalidatePath(`/[[...slug]]`, 'page');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
