import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { sanitizePath } from '@/lib/security-utils';

const MIME_TYPES: Record<string, string> = {
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.css': 'text/css',
  '.js': 'application/javascript',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string; path: string[] }> }
) {
  const { name, path: assetPathArray } = await params;
  const themeName = sanitizePath(name);
  const assetPath = assetPathArray.map(p => sanitizePath(p)).join('/');
  
  const fullPath = path.join(process.cwd(), 'themes', themeName, 'assets', assetPath);

  try {
    const fileBuffer = await fs.readFile(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return new NextResponse(null, { status: 404 });
  }
}
