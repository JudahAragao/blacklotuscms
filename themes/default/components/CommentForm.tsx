'use client';

import React, { useState } from 'react';
import { submitCommentAction } from '@/app/actions/comments';

export default function CommentForm({ postId, parentId }: { postId: string, parentId?: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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
    <form onSubmit={handleSubmit} className="space-y-6 bg-slate-50 p-8 rounded-2xl border border-slate-100">
      <input type="hidden" name="postId" value={postId} />
      {parentId && <input type="hidden" name="parentId" value={parentId} />}

      <h4 className="label-caps text-xs text-slate-400 mb-2">
        {parentId ? 'Responder Comentário' : 'Deixe um Comentário'}
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase text-slate-500">Seu Nome</label>
          <input 
            type="text" 
            name="author" 
            required 
            placeholder="Ex: João Silva"
            className="w-full bg-white border border-slate-200 p-3 rounded-lg text-sm focus:border-primary outline-none "
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase text-slate-500">Seu E-mail</label>
          <input 
            type="email" 
            name="email" 
            required 
            placeholder="Ex: joao@email.com"
            className="w-full bg-white border border-slate-200 p-3 rounded-lg text-sm focus:border-primary outline-none "
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold uppercase text-slate-500">Comentário</label>
        <textarea 
          name="content" 
          required 
          rows={5}
          placeholder="Escreva seu comentário aqui..."
          className="w-full bg-white border border-slate-200 p-4 rounded-lg text-sm focus:border-primary outline-none  resize-none"
        />
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="theme-btn theme-btn-primary w-full md:w-auto"
      >
        {isSubmitting ? 'ENVIANDO...' : 'POSTAR COMENTÁRIO'}
      </button>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}
    </form>
  );
}
