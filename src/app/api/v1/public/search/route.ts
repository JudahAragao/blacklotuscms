import { NextRequest, NextResponse } from 'next/server';
import { SearchService } from '@/core/services/SearchService';

/**
 * GET /api/v1/public/search?q=termo
 * Realiza busca global no CMS.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    const results = await SearchService.globalSearch(query);
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: 'Erro na busca' }, { status: 500 });
  }
}
