import React from 'react';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import MenuItemForm from '@/components/admin/MenuItemForm';
import { Layout, Plus, Trash2, Link as LinkIcon, Compass, ChevronRight } from 'lucide-react';
import BlackLotusCMSSlot from '@/components/admin/BlackLotusCMSSlot';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { hasCapability } from '@/lib/auth-utils';

export default async function MenuManagerPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/login');

  if (!hasCapability((session.user as any).role, 'setting.manage')) {
    return <div className="p-10 text-center text-sm text-status-trash">Acesso negado</div>;
  }

  const menus = await prisma.menu.findMany({
    include: { items: { orderBy: { order: 'asc' } } },
    orderBy: { createdAt: 'desc' }
  });

  async function createMenu(formData: FormData) {
    'use server';
    const actionSession = await getServerSession(authOptions);
    if (!actionSession || !hasCapability((actionSession.user as any).role, 'setting.manage')) {
      throw new Error('Unauthorized');
    }
    const name = formData.get('name') as string;
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    await prisma.menu.create({ data: { name, slug } });
    revalidatePath('/admin/menus');
  }

  async function addItemToMenu(formData: FormData) {
    'use server';
    try {
      const actionSession = await getServerSession(authOptions);
      if (!actionSession || !hasCapability((actionSession.user as any).role, 'setting.manage')) {
        throw new Error('Unauthorized');
      }
      const menuId = formData.get('menuId') as string;
      const label = formData.get('label') as string;
      const url = formData.get('url') as string;
      const lastItem = await prisma.menuItem.findFirst({ where: { menuId }, orderBy: { order: 'desc' } });
      const order = (lastItem?.order ?? -1) + 1;
      await prisma.menuItem.create({ data: { menuId, label, url, order } });
      revalidatePath('/admin/menus');
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async function removeItemAction(id: string) {
    'use server';
    const actionSession = await getServerSession(authOptions);
    if (!actionSession || !hasCapability((actionSession.user as any).role, 'setting.manage')) {
      throw new Error('Unauthorized');
    }
    await prisma.menuItem.delete({ where: { id } });
    revalidatePath('/admin/menus');
  }

  async function deleteMenuAction(id: string) {
    'use server';
    const actionSession = await getServerSession(authOptions);
    if (!actionSession || !hasCapability((actionSession.user as any).role, 'setting.manage')) {
      throw new Error('Unauthorized');
    }
    await prisma.menu.delete({ where: { id } });
    revalidatePath('/admin/menus');
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold text-text-heading">Menus</h1>
          <p className="text-sm text-text-muted mt-1">Gerenciar navegacao do site</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="content-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Plus size={16} className="text-action" />
              <h3 className="font-semibold text-sm text-text-heading">Criar Menu</h3>
            </div>
            <form action={createMenu} className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="label-field-muted">Nome do Menu</label>
                <input type="text" name="name" placeholder="Ex: Menu Principal" className="field-input" required />
              </div>
              <button type="submit" className="btn-action w-full">Criar Menu</button>
            </form>
          </div>
          <BlackLotusCMSSlot name="admin.menus.sidebar_after" />
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          {menus.map((menu) => (
            <div key={menu.id} className="content-card flex flex-col overflow-hidden">
              <div className="p-4 border-b border-border-default bg-surface-muted flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-sm text-text-heading">{menu.name}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-xs text-text-muted font-mono">/{menu.slug}</span>
                  </div>
                </div>
                <form action={deleteMenuAction.bind(null, menu.id)}>
                  <button className="p-1.5 text-text-muted hover:text-status-trash transition-colors" title="Excluir">
                    <Trash2 size={16} />
                  </button>
                </form>
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <div className="space-y-1.5 mb-4 flex-1">
                  {menu.items.length > 0 ? (
                    menu.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-2.5 bg-surface-muted border border-border-default rounded hover:border-action/30 transition-all">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-action/40"></div>
                          <div>
                            <div className="text-sm font-medium text-text-heading">{item.label}</div>
                            <div className="flex items-center gap-1 text-xs text-text-muted font-mono">
                              <LinkIcon size={10} />
                              {item.url}
                            </div>
                          </div>
                        </div>
                        <form action={removeItemAction.bind(null, item.id)}>
                          <button className="p-1 text-text-muted hover:text-status-trash transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 size={12} />
                          </button>
                        </form>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center border border-dashed border-border-default rounded">
                      <p className="text-xs text-text-muted">Nenhum item adicionado</p>
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-3 border-t border-border-default">
                  <MenuItemForm menuId={menu.id} onAdd={addItemToMenu} />
                </div>
              </div>
            </div>
          ))}

          {menus.length === 0 && (
            <div className="col-span-full py-16 content-card border-dashed border-2 border-border-default flex flex-col items-center justify-center text-text-muted">
              <Layout size={40} strokeWidth={1} className="mb-3" />
              <p className="text-sm">Nenhum menu criado ainda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
