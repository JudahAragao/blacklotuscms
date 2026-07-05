import React from 'react';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasCapability } from '@/lib/auth-utils';
import { ChevronLeft, User, Shield, Save, Mail, Lock, Camera } from 'lucide-react';
import Link from 'next/link';
import { updateUserAction } from '../actions';
import { notFound } from 'next/navigation';
import BlackLotusCMSSlot from '@/components/admin/BlackLotusCMSSlot';
import UserProfileImageEditor from '@/components/admin/UserProfileImageEditor';

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  const isSelf = (session?.user as any)?.id === id;
  const isAdmin = hasCapability(userRole, 'user.manage');

  if (!session || (!isAdmin && !isSelf)) {
    return <div className="p-20 text-center label-caps text-error">Acesso Negado</div>;
  }

  const userToEdit = await prisma.user.findUnique({
    where: { id },
    include: { role: true },
  });

  if (!userToEdit) notFound();

  const roles = await prisma.role.findMany();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/settings/users" className="p-2 content-card text-text-muted hover:text-action transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-text-heading">Editar Usuario</h1>
          <p className="text-sm text-text-muted mt-1">Atualizar dados da conta</p>
        </div>
      </div>

      <div className="max-w-3xl">
        <BlackLotusCMSSlot name="admin.user_edit.before_form" data={{ userId: id }} />
        <form action={updateUserAction.bind(null, id) as any} className="content-card p-6 space-y-6">
          <BlackLotusCMSSlot name="admin.user_edit.form_top" data={{ userId: id }} />

          <UserProfileImageEditor initialImage={userToEdit.image} email={userToEdit.email} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col md:col-span-2 gap-1">
              <label className="label-field-muted">Email</label>
              <input type="email" name="email" defaultValue={userToEdit.email} className="field-input" required />
            </div>

            <div className="flex flex-col gap-1">
              <label className="label-field-muted">Role</label>
              <select name="roleId" defaultValue={userToEdit.roleId} disabled={!isAdmin} className={`field-select ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`} required>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
              {!isAdmin && <p className="text-xs text-text-muted italic">Apenas administradores podem mudar o cargo.</p>}
            </div>

            {isSelf && (
              <div className="flex flex-col md:col-span-2 p-4 bg-action-light border border-action/20 rounded gap-1">
                <label className="label-field-muted text-action font-semibold">Verificacao de Seguranca</label>
                <label className="text-xs text-text-muted">Senha atual (obrigatoria para mudar)</label>
                <input type="password" name="currentPassword" className="field-input" placeholder="Sua senha atual..." />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="label-field-muted">Nova Senha</label>
              <input type="password" name="password" className="field-input" placeholder="Deixe em branco para manter" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="label-field-muted">Confirmar Senha</label>
              <input type="password" name="confirmPassword" className="field-input" placeholder="Repita a nova senha" />
            </div>
          </div>

          <BlackLotusCMSSlot name="admin.user_edit.fields_after" data={{ userId: id }} />

          <div className="pt-4 border-t border-border-default flex justify-between items-center">
            <p className="text-xs text-text-muted">
              Ultima atualizacao: {new Date(userToEdit.updatedAt).toLocaleString('pt-BR')}
            </p>
            <div className="flex gap-3">
              <BlackLotusCMSSlot name="admin.user_edit.form_bottom" data={{ userId: id }} />
              <button type="submit" className="btn-action flex items-center gap-2">
                <Save size={16} /> Salvar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
