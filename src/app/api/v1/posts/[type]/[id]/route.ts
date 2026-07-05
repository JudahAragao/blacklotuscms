import { NextRequest, NextResponse } from 'next/server';
import { PostService } from '@/core/services/PostService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasCapability } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/v1/posts/[type]/[id]
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await PostService.getById(params.id);
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching post' }, { status: 500 });
  }
}

/**
 * PUT /api/v1/posts/[type]/[id]
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!hasCapability((session.user as any).role, 'post.edit')) {
      return NextResponse.json({ error: 'No permission to edit posts' }, { status: 403 });
    }

    const body = await req.json();
    const post = await PostService.update(params.id, body);
    
    return NextResponse.json(post);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating post' }, { status: 400 });
  }
}

/**
 * DELETE /api/v1/posts/[type]/[id]
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!hasCapability((session.user as any).role, 'post.delete')) {
      return NextResponse.json({ error: 'No permission to delete posts' }, { status: 403 });
    }

    await prisma.post.delete({ where: { id: params.id } });
    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting post' }, { status: 400 });
  }
}
