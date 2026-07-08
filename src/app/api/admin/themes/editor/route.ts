import { NextRequest, NextResponse } from 'next/server';
import { withApiAuth } from '@/lib/api-auth';
import { ThemeDataService } from '@/core/services/ThemeDataService';
import { handleApiError } from '@/lib/errors';
import fs from 'fs/promises';
import path from 'path';

/**
 * GET /api/admin/themes/editor?file=layouts/post.tsx
 * Lê o conteúdo de um arquivo do tema ativo.
 */
export const GET = withApiAuth(
  async (req, _ctx, session) => {
    try {
      const { searchParams } = new URL(req.url);
      const fileName = searchParams.get('file');
      const themeName = searchParams.get('theme') || 'default';

      if (!fileName) return NextResponse.json({ error: 'No file specified' }, { status: 400 });

      // Validação de segurança do Tema (Permissão Granular)
      await ThemeDataService.validate('theme.edit', themeName);

      // Segurança: Impedir Path Traversal
      const safePath = path.join(process.cwd(), 'themes', themeName, fileName);
      if (!safePath.startsWith(path.join(process.cwd(), 'themes'))) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      const content = await fs.readFile(safePath, 'utf-8');
      return NextResponse.json({ content });
    } catch (error) {
      const { error: msg, status, code } = handleApiError(error);
      return NextResponse.json({ error: msg, code }, { status });
    }
  },
  'theme.edit'
);

/**
 * POST /api/admin/themes/editor
 * Salva o conteúdo em um arquivo do tema.
 */
export const POST = withApiAuth(
  async (req, _ctx, session) => {
    try {
      const { theme, file, content } = await req.json();

      // Validação de segurança do Tema (Permissão Granular)
      await ThemeDataService.validate('theme.edit', theme);

      const safePath = path.join(process.cwd(), 'themes', theme, file);
      if (!safePath.startsWith(path.join(process.cwd(), 'themes'))) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      await fs.writeFile(safePath, content, 'utf-8');
      return NextResponse.json({ success: true });
    } catch (error) {
      const { error: msg, status, code } = handleApiError(error);
      return NextResponse.json({ error: msg, code }, { status });
    }
  },
  'theme.edit'
);
