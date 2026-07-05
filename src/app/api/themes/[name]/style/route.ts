import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { sanitizePath } from '@/lib/security-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  const { name } = await params;
  const themeName = sanitizePath(name);
  
  const cssPath = path.join(process.cwd(), 'themes', themeName, 'style.css');

  try {
    const cssContent = await fs.readFile(cssPath, 'utf-8');
    return new NextResponse(cssContent, {
      headers: {
        'Content-Type': 'text/css',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    // Se o tema não tiver um style.css, retornamos vazio para não dar erro 404 no console
    return new NextResponse('', {
      headers: { 'Content-Type': 'text/css' },
    });
  }
}
