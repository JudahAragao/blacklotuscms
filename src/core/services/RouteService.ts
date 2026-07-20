import { logger } from '@/lib/logger';

export interface RegisteredRoute {
  path: string;
  source: 'plugin' | 'theme';
  pluginId?: string;
  handler?: (ctx: RouteContext) => Promise<any>;
  template: string;
}

export interface RouteMatch {
  route: RegisteredRoute;
  params: Record<string, string>;
}

export interface RouteContext {
  params: Record<string, string>;
  userId?: string;
  role?: { name: string; capabilities: any } | null;
}

export class RouteService {
  private pluginRoutes: Map<string, RegisteredRoute> = new Map();
  private themeRoutes: Record<string, Record<string, string>> = {};

  constructor(private readonly log = logger) {}

  /**
   * Registers a route from a plugin.
   */
  registerPluginRoute(
    path: string,
    handler: (ctx: RouteContext) => Promise<any>,
    template: string,
    pluginId: string
  ): void {
    const normalized = this.normalizePath(path);
    this.pluginRoutes.set(normalized, {
      path: normalized,
      source: 'plugin',
      pluginId,
      handler,
      template,
    });
    this.log.info(`Plugin route registered: ${normalized} → ${template}`, { pluginId });
  }

  /**
   * Removes all routes for a plugin.
   */
  removePluginRoutes(pluginId: string): void {
    for (const [path, route] of this.pluginRoutes.entries()) {
      if (route.pluginId === pluginId) {
        this.pluginRoutes.delete(path);
      }
    }
  }

  /**
   * Sets theme routes from generated registry.
   */
  setThemeRoutes(themeName: string, routes: Record<string, string>): void {
    this.themeRoutes[themeName] = routes;
  }

  /**
   * Sets all theme routes at once (from generated registry).
   */
  setAllThemeRoutes(allRoutes: Record<string, Record<string, string>>): void {
    this.themeRoutes = allRoutes;
  }

  /**
   * Matches a URL path against registered routes (plugin first, then theme).
   * Returns null if no route matches.
   */
  matchRoute(urlPath: string, themeName?: string): RouteMatch | null {
    const normalized = this.normalizePath(urlPath);

    // 1. Try plugin routes first
    for (const [, route] of this.pluginRoutes) {
      const params = this.extractParams(route.path, normalized);
      if (params !== null) {
        return { route, params };
      }
    }

    // 2. Try theme routes
    if (themeName && this.themeRoutes[themeName]) {
      for (const [pattern, template] of Object.entries(this.themeRoutes[themeName])) {
        const normalizedPattern = this.normalizePath(pattern);
        const params = this.extractParams(normalizedPattern, normalized);
        if (params !== null) {
          return {
            route: {
              path: normalizedPattern,
              source: 'theme',
              template,
            },
            params,
          };
        }
      }
    }

    // 3. Try default theme routes as fallback
    if (themeName !== 'default' && this.themeRoutes['default']) {
      for (const [pattern, template] of Object.entries(this.themeRoutes['default'])) {
        const normalizedPattern = this.normalizePath(pattern);
        const params = this.extractParams(normalizedPattern, normalized);
        if (params !== null) {
          return {
            route: {
              path: normalizedPattern,
              source: 'theme',
              template,
            },
            params,
          };
        }
      }
    }

    return null;
  }

  /**
   * Extracts params from a route pattern matched against a path.
   * Returns null if the pattern doesn't match.
   *
   * Examples:
   *   extractParams("/product/:slug", "/product/camisa-azul") → { slug: "camisa-azul" }
   *   extractParams("/product/:id", "/product/abc-123") → { id: "abc-123" }
   *   extractParams("/checkout", "/checkout") → {}
   *   extractParams("/product/:slug", "/cart") → null
   */
  extractParams(pattern: string, path: string): Record<string, string> | null {
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);

    if (patternParts.length !== pathParts.length) {
      return null;
    }

    const params: Record<string, string> = {};

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];

      if (patternPart.startsWith(':')) {
        // Dynamic segment — extract param
        const paramName = patternPart.slice(1);
        params[paramName] = decodeURIComponent(pathPart);
      } else if (patternPart !== pathPart) {
        // Static segment — must match exactly
        return null;
      }
    }

    return params;
  }

  /**
   * Normalizes a path by removing leading/trailing slashes and collapsing multiples.
   */
  private normalizePath(path: string): string {
    return '/' + path.replace(/^\/+|\/+$/g, '').replace(/\/+/g, '/');
  }

  /**
   * Gets all registered plugin routes (for debugging/admin).
   */
  getPluginRoutes(): RegisteredRoute[] {
    return Array.from(this.pluginRoutes.values());
  }

  /**
   * Gets theme routes for a specific theme.
   */
  getThemeRoutes(themeName: string): Record<string, string> {
    return this.themeRoutes[themeName] || {};
  }
}

export const routeService = new RouteService();
