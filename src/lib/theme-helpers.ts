import { getCurrentPostContext } from '@/lib/theme-context';
import { prisma } from '@/lib/prisma';

// Cache de fields por post (evita N+1 queries)
const fieldsCache = new Map<string, any[]>();

async function getFieldsForCurrentPost(): Promise<any[]> {
  const post = getCurrentPostContext();
  if (!post?.id) return [];
  if (fieldsCache.has(post.id)) return fieldsCache.get(post.id)!;

  const fieldGroups = await prisma.fieldGroupLocation.findMany({
    include: {
      fieldGroup: {
        include: {
          fields: { orderBy: { order: 'asc' } },
        },
      },
    },
    where: {
      locationValue: post.postType?.slug,
      locationType: 'post_type',
    },
  });

  const fields = fieldGroups.flatMap((lg: any) => lg.fieldGroup.fields);
  fieldsCache.set(post.id, fields);
  return fields;
}

function getMeta(): Record<string, any> {
  const post = getCurrentPostContext();
  return post?.meta || {};
}

// ─────────────────────────────────────────────
// Core helpers
// ─────────────────────────────────────────────

/**
 * Retorna o valor de um campo específico do post atual.
 */
export function getField(name: string): any {
  return getMeta()[name] ?? null;
}

/**
 * Alias de getField — para uso em JSX (React renderiza o valor automaticamente).
 */
export function theField(name: string): any {
  return getField(name);
}

// ─────────────────────────────────────────────
// Repeater / Flexible Content helpers
// ─────────────────────────────────────────────

/**
 * Verifica se um repeater/flexible content tem ao menos uma linha.
 */
export function haveRows(name: string): boolean {
  const value = getField(name);
  return Array.isArray(value) && value.length > 0;
}

/**
 * Retorna o array de linhas de um repeater/flexible content.
 * Usar com .map() para iterar.
 */
export function getRows(name: string): any[] {
  const value = getField(name);
  return Array.isArray(value) ? value : [];
}

// ─────────────────────────────────────────────
// Row context helpers (sub-fields)
// ─────────────────────────────────────────────

import { AsyncLocalStorage } from 'async_hooks';

/**
 * AsyncLocalStorage para o contexto da row atual durante iteração.
 * Usado internamente por getSubField / theSubField / getRowIndex.
 */
export const rowContext = new AsyncLocalStorage<any>();

/**
 * Retorna o valor de um subcampo dentro de uma row de repeater.
 */
export function getSubField(name: string): any {
  const row = rowContext.getStore();
  return row?.[name] ?? null;
}

/**
 * Alias de getSubField — para uso em JSX.
 */
export function theSubField(name: string): any {
  return getSubField(name);
}

/**
 * Retorna o índice da row atual durante iteração.
 */
export function getRowIndex(): number {
  const row = rowContext.getStore();
  return row?.__index ?? 0;
}

// ─────────────────────────────────────────────
// Field metadata helpers
// ─────────────────────────────────────────────

/**
 * Retorna o objeto completo do campo (name, type, config, value).
 */
export async function getFieldObject(name: string): Promise<any> {
  const fields = await getFieldsForCurrentPost();
  const field = fields.find((f: any) => f.name === name);
  if (!field) return null;
  return {
    name: field.name,
    type: field.type,
    config: field.config,
    value: getField(name),
  };
}

/**
 * Retorna o nome interno do campo.
 */
export async function getFieldName(name: string): Promise<string | null> {
  const fields = await getFieldsForCurrentPost();
  return fields.find((f: any) => f.name === name)?.name ?? null;
}

/**
 * Retorna o tipo do campo (text, image, repeater, etc).
 */
export async function getFieldType(name: string): Promise<string | null> {
  const fields = await getFieldsForCurrentPost();
  return fields.find((f: any) => f.name === name)?.type ?? null;
}

// ─────────────────────────────────────────────
// Field group registration (server-side only)
// ─────────────────────────────────────────────

/**
 * Registra um grupo de campos programaticamente.
 * Requer user com permissão post.manage.
 * Usar em plugins ou server actions, NÃO em layouts de tema.
 */
export async function addLocalFieldGroup(data: any, user: any): Promise<any> {
  const { FieldService } = await import('@/core/services/FieldService');
  return FieldService.createFieldGroup(data, user);
}

/**
 * Limpa o cache de fields (útil para testes).
 */
export function clearFieldsCache(): void {
  fieldsCache.clear();
}
