import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { unstable_cache, revalidateTag } from 'next/cache';
import { MenuItemDTO } from '@/types/dto';
import { canPerformAction } from '@/lib/auth-utils';
import { BlackLotusCMSError } from '@/lib/errors';

export class MenuService {
  constructor(
    private readonly db = prisma,
    private readonly log = logger
  ) {}

  /**
   * Fetches a menu by slug and returns its items organized hierarchically (with Cache).
   */
  async getMenuBySlug(slug: string): Promise<MenuItemDTO[]> {
    return unstable_cache(
      async (s: string) => {
        const menu = await this.db.menu.findUnique({
          where: { slug: s },
          include: {
            items: { orderBy: { order: 'asc' } }
          }
        });

        if (!menu) return [];

        const itemsMap = new Map<string, MenuItemDTO>();
        const rootItems: MenuItemDTO[] = [];

        menu.items.forEach(item => {
          itemsMap.set(item.id, {
            id: item.id,
            label: item.label,
            url: item.url,
            order: item.order,
            children: []
          });
        });

        menu.items.forEach(item => {
          const dto = itemsMap.get(item.id)!;
          if (item.parentId && itemsMap.has(item.parentId)) {
            itemsMap.get(item.parentId)!.children.push(dto);
          } else {
            rootItems.push(dto);
          }
        });

        return rootItems;
      },
      [`menu-slug-${slug}`],
      { tags: ['menus', `menu-${slug}`], revalidate: 3600 }
    )(slug);
  }

  /**
   * Forces menu cache update.
   */
  async invalidateMenu(slug: string, user: any) {
    if (!canPerformAction(user, 'setting.manage')) {
      throw new BlackLotusCMSError('No permission to manage menus', 403, 'AUTH_FORBIDDEN');
    }

    revalidateTag(`menu-${slug}`, 'max');
    revalidateTag('menus', 'max');
    this.log.info(`Menu cache invalidated: ${slug}`);
  }

  // --- Static Proxy ---
  static async getMenuBySlug(slug: string) { return menuService.getMenuBySlug(slug); }
  static async invalidateMenu(slug: string, user: any) { return menuService.invalidateMenu(slug, user); }
}

export const menuService = new MenuService();
