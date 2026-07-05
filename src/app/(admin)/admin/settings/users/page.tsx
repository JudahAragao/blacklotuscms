import React from 'react';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasCapability } from '@/lib/auth-utils';
import { Shield, Plus, Trash2, Edit3, ChevronLeft } from 'lucide-react';
import { createUserAction, deleteUserAction } from './actions';
import Link from 'next/link';

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  if (!session || !hasCapability((session.user as any).role, 'user.manage')) {
    return <div className="p-10 text-center text-sm text-status-trash">Acesso negado</div>;
  }

  const users = await prisma.user.findMany({
    include: { role: true },
    orderBy: { createdAt: 'desc' },
  });

  const roles = await prisma.role.findMany();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/settings" className="p-2 content-card text-text-muted hover:text-action transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-text-heading">Usuarios</h1>
          <p className="text-sm text-text-muted mt-1">Gerenciar contas e permissoes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="content-card p-5 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <Plus size={16} className="text-action" />
            <h3 className="font-semibold text-sm text-text-heading">Novo Usuario</h3>
          </div>
          <form action={createUserAction} className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="label-field-muted">Email</label>
              <input type="email" name="email" required className="field-input" placeholder="email@exemplo.com" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="label-field-muted">Senha</label>
              <input type="password" name="password" required className="field-input" placeholder="********" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="label-field-muted">Role</label>
              <select name="roleId" required className="field-select">
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-action w-full mt-2">Criar Conta</button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="content-card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Role</th>
                  <th>Criado em</th>
                  <th className="text-right">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center overflow-hidden border border-border-default">
                          {u.image ? (
                            <img src={u.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-text-muted">{u.email.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-text-heading">{u.email}</span>
                          {(session.user as any).id === u.id && (
                            <span className="ml-2 text-[10px] bg-action-light text-action px-1.5 py-0.5 rounded font-medium">Voce</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-sm text-text-body">
                        <Shield size={12} className="text-text-muted" />
                        {u.role.name}
                      </div>
                    </td>
                    <td className="text-xs text-text-muted font-mono">
                      {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/admin/settings/users/${u.id}`} className="p-1.5 text-text-muted hover:text-action transition-colors" title="Editar">
                          <Edit3 size={16} />
                        </Link>
                        <form action={deleteUserAction.bind(null, u.id)}>
                          <button disabled={(session.user as any).id === u.id} className="p-1.5 text-text-muted hover:text-status-trash transition-colors disabled:opacity-20">
                            <Trash2 size={16} />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
