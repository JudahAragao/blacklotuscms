import { NextRequest, NextResponse } from 'next/server';
import { MediaService } from '@/core/services/MediaService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasCapability } from '@/lib/auth-utils';

/**
 * GET /api/v1/media
 * Lista biblioteca de mídia.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const media = await MediaService.list(page);
    return NextResponse.json(media);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching media' }, { status: 500 });
  }
}

/**
 * POST /api/v1/media
 * Upload de um novo arquivo de mídia com proteção RBAC.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasCapability((session.user as any).role, 'media.upload')) {
      return NextResponse.json({ error: 'No permission to upload' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const uploaded = await MediaService.upload(file);
    return NextResponse.json(uploaded, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 400 });
  }
}
