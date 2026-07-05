import { AsyncLocalStorage } from 'async_hooks';

interface ThemeStore {
  themeName: string;
  currentPost?: any;
}

/**
 * Stores the theme and current post context during the rendering request lifecycle.
 */
export const themeStorage = new AsyncLocalStorage<ThemeStore>();

/**
 * Helper to safely get the active theme name.
 */
export function getActiveThemeName(): string | null {
  const store = themeStorage.getStore();
  return store?.themeName || null;
}

/**
 * Helper to get the post from the current context.
 */
export function getCurrentPostContext(): any | null {
  const store = themeStorage.getStore();
  return store?.currentPost || null;
}
