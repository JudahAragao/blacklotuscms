import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Plus, Pencil, Eye } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { hasCapability, canPerformAction } from '@/lib/auth-utils';

export default async function PostsAdminPage({
  searchParams
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type } = await searchParams;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  const postTypeSlug = type || 'post';
  const userRole = (session.user as any).role;

  if (!hasCapability(userRole, `${postTypeSlug}.read`) && !hasCapability(userRole, `${postTypeSlug}.manage`)) {
    return <div className="p-10 text-center text-sm text-status-trash">Acesso negado: voce nao tem permissao para visualizar este conteudo.</div>;
  }

  const currentPostType = await prisma.postType.findUnique({
    where: { slug: postTypeSlug }
  });

  const posts = await prisma.post.findMany({
    where: {
      postType: { slug: postTypeSlug }
    },
    include: {
      postType: true,
      author: { select: { id: true, email: true } }
    },
    orderBy: { updatedAt: 'desc' }
  });

  const label = currentPostType?.label || 'Posts';
  const canCreate = hasCapability(userRole, `${postTypeSlug}.create`) || hasCapability(userRole, `${postTypeSlug}.manage`);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-text-heading">{label}</h1>
          <p className="text-sm text-text-muted mt-1">Gerenciar {label.toLowerCase()}</p>
        </div>
        {canCreate && (
          <Link
            href={`/admin/posts/new?type=${postTypeSlug}`}
            className="btn-action flex items-center gap-2 justify-center"
          >
            <Plus size={16} /> Adicionar Novo
          </Link>
        )}
      </div>

      <div className="content-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table min-w-[600px]">
          <thead>
            <tr>
              <th className="w-10"><input type="checkbox" className="check-field" /></th>
              <th>Titulo</th>
              <th className="w-28">Status</th>
              <th className="w-36">Autor</th>
              <th className="w-32">Atualizado</th>
              <th className="w-24 text-right">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => {
              const canEdit = canPerformAction(session.user, `${postTypeSlug}.update`, post.authorId) ||
                              hasCapability(userRole, `${postTypeSlug}.manage`);

              return (
                <tr key={post.id}>
                  <td><input type="checkbox" className="check-field" /></td>
                  <td>
                    <div className="font-medium text-text-heading">{post.title}</div>
                    <div className="text-xs text-text-muted font-mono mt-0.5">/{post.slug}</div>
                  </td>
                  <td>
                    <span className={post.status === 'published' ? 'status-published' : 'status-draft'}>
                      {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </span>
                  </td>
                  <td className="text-text-body">
                    {post.author.email.split('@')[0]}
                    {(session.user as any).id === post.authorId && (
                      <span className="ml-1.5 text-[10px] bg-action-light text-action px-1.5 py-0.5 rounded font-medium">Voce</span>
                    )}
                  </td>
                  <td className="text-text-muted text-xs">
                    {new Date(post.updatedAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="text-right">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="inline-flex items-center gap-1 text-action hover:text-action-hover text-xs font-medium transition-colors"
                    >
                      {canEdit ? <><Pencil size={12} /> Editar</> : <><Eye size={12} /> Ver</>}
                    </Link>
                  </td>
                </tr>
              );
            })}
            {posts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-text-muted">
                  Nenhum {label.toLowerCase()} encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
