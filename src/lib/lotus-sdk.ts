import { getCurrentPostContext, getActiveThemeName } from './theme-context';
import { PostService } from '@/core/services/PostService';
import { ThemeDataService } from '@/core/services/ThemeDataService';
import { SettingService } from '@/core/services/SettingService';
import { logger } from './logger';

/**
 * Gets the post object from the current context (current layout).
 */
export function getPost() {
  const post = getCurrentPostContext();
  if (!post) {
    logger.warn('[Lotus SDK] getPost() called outside of a valid post context.');
  }
  return post;
}

/**
 * Gets the value of a custom field (ACF style).
 * If postId is not provided, it tries to fetch from the post in the current context.
 */
export async function getField(fieldName: string, postId?: string) {
  // 1. If a postId was provided, fetch the data for that specific post
  if (postId) {
    const meta = await PostService.getPostMeta(postId);
    return meta[fieldName];
  }

  // 2. Otherwise, try to get from the post in the current context
  const currentPost = getCurrentPostContext();
  if (!currentPost) return null;

  // If metadata is already "flattened" in the DTO (mapToThemeDTO does this in the .meta field)
  if (currentPost.meta && currentPost.meta[fieldName] !== undefined) {
    return currentPost.meta[fieldName];
  }

  // Fallback: if not in the DTO, fetch via service using the context ID
  if (currentPost.id) {
    const meta = await PostService.getPostMeta(currentPost.id);
    return meta[fieldName];
  }

  return null;
}

/**
 * Lists posts of a specific type.
 */
export async function getPostsByType(postTypeSlug: string, limit: number = 10) {
  return await PostService.getLeanPostsByType(postTypeSlug, limit);
}

/**
 * Gets a specific setting for the current Theme.
 */
export async function getThemeSetting(key: string) {
  const themeName = getActiveThemeName();
  if (!themeName) return null;
  return await ThemeDataService.get(key);
}

/**
 * Gets global CMS settings.
 */
export async function getSiteSetting(key: string) {
  const settings = await SettingService.getAll();
  // Support for nested keys (e.g., 'seo.site_name')
  const keys = key.split('.');
  let current = settings;
  for (const k of keys) {
    if (current[k] === undefined) return null;
    current = current[k];
  }
  return current;
}
