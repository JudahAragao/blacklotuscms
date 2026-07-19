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
 * Helper to get the active store.
 * In RSC, React.cache is more reliable because it survives unstable_cache
 * and other async boundaries that can lose the AsyncLocalStorage context.
 * AsyncLocalStorage is kept as fallback for tests and non-RSC contexts.
 */
export function getThemeStore(): ThemeStore {
  const reactStore = getReactStore();
  if (reactStore.themeName) return reactStore;

  const nodeStore = themeStorage.getStore();
  if (nodeStore) return nodeStore;

  return reactStore;
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

