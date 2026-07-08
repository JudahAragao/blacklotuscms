import { NextRequest, NextResponse } from 'next/server';
import { PostService } from '@/core/services/PostService';
import { prisma } from '@/lib/prisma';
import { withApiAuth } from '@/lib/api-auth';
import { handleApiError } from '@/lib/errors';

/**
 * GET /api/v1/posts/[type]/[id] — Público
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { id } = await params;
    const post = await PostService.getById(id);
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    return NextResponse.json(post);
  } catch (error) {
    const { error: msg, status, code } = handleApiError(error);
    return NextResponse.json({ error: msg, code }, { status });
  }
}

/**
 * PUT /api/v1/posts/[type]/[id] — Aceita sessão + API Key
 */
export const PUT = withApiAuth(
  async (req, { params }, session) => {
    try {
      const { id } = await params;
      const body = await req.json();
      const post = await PostService.update(id, body, session.user);
      return NextResponse.json(post);
    } catch (error: any) {
      const { error: msg, status, code } = handleApiError(error);
      return NextResponse.json({ error: msg, code }, { status });
    }
  },
  'post.edit'
);

/**
 * DELETE /api/v1/posts/[type]/[id] — Aceita sessão + API Key
 */
export const DELETE = withApiAuth(
  async (req, { params }, session) => {
    try {
      const { id } = await params;
      await prisma.post.delete({ where: { id } });
      return NextResponse.json({ message: 'Post deleted successfully' });
    } catch (error) {
      const { error: msg, status, code } = handleApiError(error);
      return NextResponse.json({ error: msg, code }, { status });
    }
  },
  'post.delete'
);
