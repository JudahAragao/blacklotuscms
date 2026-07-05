import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasCapability } from '@/lib/auth-utils';
import { ThemeDataService } from '@/core/services/ThemeDataService';
import { logger } from '@/lib/logger';
import fs from 'fs/promises';
import path from 'path';

/**
 * GET /api/admin/themes/editor?file=layouts/post.tsx
 * Lê o conteúdo de um arquivo do tema ativo.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      logger.warn('[ThemeEditor API] No session found');
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (!hasCapability(role, 'theme.edit')) {
      logger.warn('[ThemeEditor API] User lacks theme.edit capability', { roleName: role?.name });
      return NextResponse.json({ error: 'Unauthorized - No user permission' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get('file');
    const themeName = searchParams.get('theme') || 'default';

    if (!fileName) return NextResponse.json({ error: 'No file specified' }, { status: 400 });

    // Validação de segurança do Tema (Permissão Granular)
    try {
      await ThemeDataService.validate('theme.edit', themeName);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }

    // Segurança: Impedir Path Traversal
    const safePath = path.join(process.cwd(), 'themes', themeName, fileName);
    if (!safePath.startsWith(path.join(process.cwd(), 'themes'))) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const content = await fs.readFile(safePath, 'utf-8');
    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json({ error: 'Error reading file' }, { status: 500 });
  }
}

/**
 * POST /api/admin/themes/editor
 * Salva o conteúdo em um arquivo do tema.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (!hasCapability(role, 'theme.edit')) {
      return NextResponse.json({ error: 'Unauthorized - No user permission' }, { status: 401 });
    }

    const { theme, file, content } = await req.json();

    // Validação de segurança do Tema (Permissão Granular)
    try {
      await ThemeDataService.validate('theme.edit', theme);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }

    const safePath = path.join(process.cwd(), 'themes', theme, file);
    if (!safePath.startsWith(path.join(process.cwd(), 'themes'))) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await fs.writeFile(safePath, content, 'utf-8');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error saving file' }, { status: 500 });
  }
}
