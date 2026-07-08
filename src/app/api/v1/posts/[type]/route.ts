import { NextRequest, NextResponse } from 'next/server';
import { PostService } from '@/core/services/PostService';
import { prisma } from '@/lib/prisma';
import { withApiAuth } from '@/lib/api-auth';
import { handleApiError } from '@/lib/errors';

// Listar posts (Público ou logado)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const posts = await PostService.getLeanPostsByType(type);
    return NextResponse.json(posts);
  } catch (error) {
    const { error: msg, status, code } = handleApiError(error);
    return NextResponse.json({ error: msg, code }, { status });
  }
}

// Criar post (Protegido por permissão 'post.create')
export const POST = withApiAuth(
  async (req, { params }, session) => {
    try {
      const body = await req.json();
      const postType = await prisma.postType.findUnique({
        where: { slug: params.type }
      });

      if (!postType) {
        return NextResponse.json({ error: 'Post Type não encontrado', code: 'RESOURCE_NOT_FOUND' }, { status: 404 });
      }

      const post = await PostService.create({
        ...body,
        postTypeId: postType.id,
        authorId: (session.user as any).id,
      }, session.user);

      return NextResponse.json(post, { status: 201 });
    } catch (error: any) {
      const { error: msg, status, code, details } = handleApiError(error);
      return NextResponse.json({ error: msg, code, details }, { status });
    }
  },
  'post.create'
);
