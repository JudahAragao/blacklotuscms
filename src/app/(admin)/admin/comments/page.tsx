import React from 'react';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { MessageSquare, Check, ShieldAlert, Trash2 } from 'lucide-react';

export default async function AdminCommentsPage() {
  const comments = await prisma.comment.findMany({
    include: { post: true },
    orderBy: { createdAt: 'desc' }
  });

  async function updateStatus(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const status = formData.get('status') as string;
    await prisma.comment.update({ where: { id }, data: { status } });
    revalidatePath('/admin/comments');
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-text-heading">Comentarios</h1>
        <p className="text-sm text-text-muted mt-1">Moderar comentarios do site</p>
      </div>

      <div className="content-card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Autor</th>
              <th>Conteudo</th>
              <th>Post</th>
              <th className="text-right">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((comment) => (
              <tr key={comment.id}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-text-muted">
                      <MessageSquare size={14} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-text-heading">{comment.author}</div>
                      <div className="text-xs text-text-muted">{comment.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <p className="text-sm text-text-body line-clamp-2">{comment.content}</p>
                </td>
                <td>
                  <span className="text-xs bg-action-light text-action px-2 py-0.5 rounded font-medium">
                    {comment.post.title}
                  </span>
                </td>
                <td className="text-right">
                  <form action={updateStatus} className="flex justify-end gap-1.5">
                    <input type="hidden" name="id" value={comment.id} />

                    {comment.status !== 'approved' && (
                      <button
                        name="status"
                        value="approved"
                        className="p-1.5 text-text-muted hover:text-status-published hover:bg-status-published/10 rounded transition-colors"
                        title="Aprovar"
                      >
                        <Check size={16} />
                      </button>
                    )}

                    {comment.status !== 'spam' && (
                      <button
                        name="status"
                        value="spam"
                        className="p-1.5 text-text-muted hover:text-status-draft hover:bg-status-draft/10 rounded transition-colors"
                        title="Spam"
                      >
                        <ShieldAlert size={16} />
                      </button>
                    )}

                    <button
                      name="status"
                      value="trash"
                      className="p-1.5 text-text-muted hover:text-status-trash hover:bg-status-trash/10 rounded transition-colors"
                      title="Lixeira"
                    >
                      <Trash2 size={16} />
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {comments.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-sm text-text-muted">
                  Nenhum comentario para moderar no momento.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
