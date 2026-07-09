import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentPostContext, getActiveThemeName } from './theme-context';
import { HookService } from '@/core/services/HookService';
import { ShortcodeService } from '@/core/services/ShortcodeService';
import { sanitizeHtml } from '@/lib/security-utils';
import { BlackLotusCMSError } from '@/lib/errors';
import { logger } from './logger';

function mapPostToThemeDTO(post: any) {
  const meta = post.metaValues?.reduce((acc: Record<string, any>, item: any) => {
    const key = item.field?.slug || item.field?.name || item.fieldId;
    acc[key] = item.value;
    return acc;
  }, {});

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    status: post.status,
    publishedAt: post.publishedAt,
    postType: post.postType
      ? {
          id: post.postType.id,
          name: post.postType.label,
          label: post.postType.label,
          slug: post.postType.slug,
        }
      : null,
    seo: {
      title: post.seoTitle,
      description: post.seoDescription,
      ogImage: post.ogImage,
      noIndex: post.noIndex || false,
    },
    meta,
    metaValues: post.metaValues,
    terms: post.terms,
  };
}

function publicPostWhere(extra: Record<string, any> = {}) {
  const now = new Date();
  return {
    status: 'published',
    publishedAt: { lte: now },
    OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
    ...extra,
  };
}

async function requestThemePermission(capability: string, themeName: string) {
  return prisma.themePermission.upsert({
    where: {
      requesterTheme_providerName_capability: {
        requesterTheme: themeName,
        providerName: 'system',
        capability,
      },
    },
    update: {},
    create: {
      requesterTheme: themeName,
      providerName: 'system',
      capability,
      status: 'pending',
    },
  });
}

async function validateThemePermission(capability: string) {
  const themeName = getActiveThemeName();
  if (!themeName) return true;

  const permission = await prisma.themePermission.findUnique({
    where: {
      requesterTheme_providerName_capability: {
        requesterTheme: themeName,
        providerName: 'system',
        capability,
      },
    },
  });

  if (permission?.status === 'approved') return true;

  // Auto-approve the built-in default theme (trusted code shipped with CMS)
  if (themeName === 'default') {
    await prisma.themePermission.upsert({
      where: {
        requesterTheme_providerName_capability: {
          requesterTheme: themeName,
          providerName: 'system',
          capability,
        },
      },
      update: { status: 'approved' },
      create: {
        requesterTheme: themeName,
        providerName: 'system',
        capability,
        status: 'approved',
      },
    });
    return true;
  }

  await requestThemePermission(capability, themeName);
  throw new BlackLotusCMSError(
    `[Segurança de Tema] Theme '${themeName}' does not have approved permission for '${capability}'.`,
    403,
    'AUTH_FORBIDDEN'
  );
}

export function getPost() {
  const post = getCurrentPostContext();
  if (!post) {
    logger.warn('[Lotus SDK] getPost() called outside of a valid post context.');
  }
  return post;
}

export async function getField(fieldName: string, postId?: string) {
  if (postId) {
    const meta = await getPostMeta(postId);
    return meta[fieldName];
  }

  const currentPost = getCurrentPostContext();
  if (!currentPost) return null;

  if (currentPost.meta && currentPost.meta[fieldName] !== undefined) {
    return currentPost.meta[fieldName];
  }

  if (currentPost.id) {
    const meta = await getPostMeta(currentPost.id);
    return meta[fieldName];
  }

  return null;
}

export async function getPostMeta(postId: string) {
  await validateThemePermission('db.read.post');
  const metaValues = await prisma.metaValue.findMany({
    where: { postId },
    include: { field: true },
  });

  return metaValues.reduce((acc: Record<string, any>, item: any) => {
    const key = item.field?.slug || item.field?.name || item.fieldId;
    acc[key] = item.value;
    return acc;
  }, {});
}

export async function getPostsByType(postTypeSlug: string, limit: number = 10) {
  await validateThemePermission('db.read.post');
  const posts = await prisma.post.findMany({
    where: publicPostWhere({ postType: { slug: postTypeSlug } }),
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      postType: true,
      metaValues: { include: { field: true } },
      terms: { include: { term: true } },
    },
  });

  return posts.map(mapPostToThemeDTO);
}

export async function getPostBySlug(slug: string) {
  await validateThemePermission('db.read.post');
  const post = await prisma.post.findFirst({
    where: publicPostWhere({ slug }),
    include: {
      postType: true,
      metaValues: { include: { field: true } },
      terms: { include: { term: true } },
    },
  });

  return post ? mapPostToThemeDTO(post) : null;
}

export async function getPostsByTerm(termSlug: string, limit: number = 10) {
  await validateThemePermission('db.read.post');
  const posts = await prisma.post.findMany({
    where: publicPostWhere({
      terms: {
        some: {
          term: { slug: termSlug },
        },
      },
    }),
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      postType: true,
      metaValues: { include: { field: true } },
      terms: { include: { term: true } },
    },
  });

  return posts.map(mapPostToThemeDTO);
}

export async function getMenuBySlug(slug: string) {
  const menu = await prisma.menu.findUnique({
    where: { slug },
    include: {
      items: { orderBy: { order: 'asc' } },
    },
  });

  if (!menu) return [];

  const itemsMap = new Map<string, any>();
  const rootItems: any[] = [];

  menu.items.forEach((item: any) => {
    itemsMap.set(item.id, {
      id: item.id,
      label: item.label,
      url: item.url,
      order: item.order,
      children: [],
    });
  });

  menu.items.forEach((item: any) => {
    const dto = itemsMap.get(item.id);
    if (item.parentId && itemsMap.has(item.parentId)) {
      itemsMap.get(item.parentId).children.push(dto);
    } else {
      rootItems.push(dto);
    }
  });

  return rootItems;
}

export async function getThemeSetting(key: string) {
  const themeName = getActiveThemeName();
  if (!themeName) return null;
  const data = await prisma.themeData.findUnique({
    where: { themeName_key: { themeName, key } },
  });
  return data?.value || null;
}

export async function getSiteSetting(key: string) {
  const rows = await prisma.setting.findMany();
  const settings = rows.reduce((acc: any, setting: any) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});
  const keys = key.split('.');
  let current = settings;

  for (const k of keys) {
    if (current?.[k] === undefined) return null;
    current = current[k];
  }

  return current;
}

export async function getCommentsForPost(postId: string) {
  return await prisma.comment.findMany({
    where: { postId, status: 'approved', parentId: null },
    include: {
      replies: {
        where: { status: 'approved' },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function applyThemeFilter(hook: string, data: any = null) {
  return await HookService.applyFilters(hook, data);
}

export function ThemeSlot({ name, data }: { name: string; data?: any }) {
  const components = HookService.getComponents(name);
  if (components.length === 0) return null;

  return React.createElement(
    'div',
    { className: 'bl-slot-container flex flex-col gap-2' },
    components.map((entry, idx) =>
      React.createElement(
        'div',
        {
          key: `${name}-${idx}-${entry.source}`,
          className: `bl-plugin bl-plugin-${entry.source.replace(/[^a-z0-9]/gi, '-')}`,
          'data-bl-plugin': entry.source,
        },
        typeof entry.Component === 'function'
          ? React.createElement(entry.Component, { data })
          : entry.Component
      )
    )
  );
}

export async function renderContent(content?: string) {
  const finalContent = content || getCurrentPostContext()?.content;
  if (!finalContent) return null;

  const parsedContent = await ShortcodeService.parse(finalContent);
  const safeHtml = await sanitizeHtml(parsedContent);

  return React.createElement('div', {
    dangerouslySetInnerHTML: { __html: safeHtml },
  });
}
