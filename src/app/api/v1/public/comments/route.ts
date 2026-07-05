import { NextRequest, NextResponse } from 'next/server';
import { CommentService } from '@/core/services/CommentService';
import { CreateCommentSchema } from '@/schemas/comment.schema';

/**
 * POST /api/v1/public/comments
 * Adiciona um comentário a um post.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 1. Validação de Schema (Proteção contra payloads maliciosos)
    const validatedData = CreateCommentSchema.parse(body);

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

    const comment = await CommentService.create({
      ...validatedData,
      ip: typeof ip === 'string' ? ip : ip[0],
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error: any) {
    // Retorna erro amigável de validação se for ZodError
    const message = error.errors ? error.errors[0].message : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
