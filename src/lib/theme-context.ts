import { AsyncLocalStorage } from 'async_hooks';
import { cache } from 'react';

interface ThemeStore {
  themeName: string | null;
  currentPost?: any;
}

/**
 * Stores the theme and current post context during the rendering request lifecycle (fallback/tests).
 */
export const themeStorage = new AsyncLocalStorage<ThemeStore>();

/**
 * React request-scoped cache store to survive async boundaries in RSC.
 */
export const getReactStore = cache(() => {
  return {
    themeName: null,
    currentPost: null,
  } as ThemeStore;
});

/**
 * Helper to get the active store, favoring AsyncLocalStorage if present (e.g. in tests)
 * and falling back to the React request cache.
 */
export function getThemeStore(): ThemeStore {
  const nodeStore = themeStorage.getStore();
  if (nodeStore) {
    return nodeStore;
  }
  return getReactStore();
}

/**
 * Helper to safely get the active theme name.
 */
export function getActiveThemeName(): string | null {
  const store = getThemeStore();
  return store.themeName;
}

/**
 * Helper to get the post from the current context.
 */
export function getCurrentPostContext(): any | null {
  const store = getThemeStore();
  return store.currentPost || null;
}

