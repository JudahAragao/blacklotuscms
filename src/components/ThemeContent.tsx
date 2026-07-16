import React from 'react';
import { ShortcodeService } from '@/core/services/ShortcodeService';
import { sanitizeHtml } from '@/lib/security-utils';

import { getCurrentPostContext } from '@/lib/theme-context';

interface ThemeContentProps {
  content?: string;
}

/**
 * Componente para renderizar conteúdo processado por Shortcodes de forma segura.
 * Sendo um Server Component, ele processa o shortcode apenas no momento da renderização,
 * evitando gargalos em listas (Lazy Parsing).
 */
export default async function ThemeContent({ content }: ThemeContentProps) {
  const finalContent = content || getCurrentPostContext()?.content;

  if (!finalContent) return null;

  // 1. Processar Shortcodes
  const parsedContent = await ShortcodeService.parse(finalContent);
  
  // 2. Sanitizar para evitar XSS
  const safeHtml = await sanitizeHtml(parsedContent);

  return <div dangerouslySetInnerHTML={{ __html: safeHtml }} />;
}
