import { NextResponse } from 'next/server';
import { SitemapService } from '@/core/services/SitemapService';

/**
 * GET /sitemap.xml
 * Retorna o sitemap dinâmico do CMS.
 */
export async function GET() {
  try {
    const xml = await SitemapService.generateXML();
    
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    return new NextResponse('Erro ao gerar sitemap', { status: 500 });
  }
}
