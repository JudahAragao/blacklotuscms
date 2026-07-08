import { NextRequest, NextResponse } from 'next/server';
import { MediaService } from '@/core/services/MediaService';
import { withApiAuth } from '@/lib/api-auth';
import { handleApiError } from '@/lib/errors';

/**
 * GET /api/v1/media
 * Lista biblioteca de mídia (público).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const media = await MediaService.list(page);
    return NextResponse.json(media);
  } catch (error) {
    const { error: msg, status, code } = handleApiError(error);
    return NextResponse.json({ error: msg, code }, { status });
  }
}

/**
 * POST /api/v1/media
 * Upload de um novo arquivo de mídia com proteção RBAC.
 * Aceita tanto sessão de browser quanto API Key.
 */
export const POST = withApiAuth(
  async (req, _ctx, session) => {
    try {
      const formData = await req.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      const uploaded = await MediaService.upload(file, session.user);
      return NextResponse.json(uploaded, { status: 201 });
    } catch (error) {
      const { error: msg, status, code } = handleApiError(error);
      return NextResponse.json({ error: msg, code }, { status });
    }
  },
  'media.upload'
);
