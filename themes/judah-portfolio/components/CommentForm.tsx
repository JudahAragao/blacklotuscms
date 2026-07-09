'use client';

import React, { useState } from 'react';
import { submitCommentAction } from '@/app/actions/comments';

export default function CommentForm({ postId, parentId }: { postId: string; parentId?: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await submitCommentAction(formData);

    setIsSubmitting(false);

    if (result.success) {
      setMessage({ type: 'success', text: 'Seu comentário foi enviado e está aguardando aprovação!' });
      (e.target as HTMLFormElement).reset();
    } else {
      setMessage({ type: 'error', text: result.error || 'Ocorreu um erro ao enviar seu comentário.' });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 vj-glass rounded-2xl p-8">
      <input type="hidden" name="postId" value={postId} />
      {parentId && <input type="hidden" name="parentId" value={parentId} />}

      <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-muted-foreground)] mb-2">
        {parentId ? 'Responder Comentário' : 'Deixe um Comentário'}
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase text-[var(--color-muted-foreground)]">Seu Nome</label>
          <input
            type="text"
            name="author"
            required
            placeholder="Ex: João Silva"
            className="w-full bg-white/[0.04] border border-white/[0.08] p-3 rounded-lg text-sm text-[var(--vj-bone)] placeholder:text-[var(--color-muted-foreground)]/50 focus:border-[var(--vj-gold)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--vj-gold)]/20 transition-colors"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase text-[var(--color-muted-foreground)]">Seu E-mail</label>
          <input
            type="email"
            name="email"
            required
            placeholder="Ex: joao@email.com"
            className="w-full bg-white/[0.04] border border-white/[0.08] p-3 rounded-lg text-sm text-[var(--vj-bone)] placeholder:text-[var(--color-muted-foreground)]/50 focus:border-[var(--vj-gold)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--vj-gold)]/20 transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold uppercase text-[var(--color-muted-foreground)]">Comentário</label>
        <textarea
          name="content"
          required
          rows={5}
          placeholder="Escreva seu comentário aqui..."
          className="w-full bg-white/[0.04] border border-white/[0.08] p-4 rounded-lg text-sm text-[var(--vj-bone)] placeholder:text-[var(--color-muted-foreground)]/50 focus:border-[var(--vj-gold)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--vj-gold)]/20 resize-none transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="vj-btn-primary w-full md:w-auto"
      >
        {isSubmitting ? 'ENVIANDO...' : 'POSTAR COMENTÁRIO'}
      </button>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${
          message.type === 'success'
            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
            : 'bg-red-500/10 text-red-300 border border-red-500/30'
        }`}>
          {message.text}
        </div>
      )}
    </form>
  );
}
