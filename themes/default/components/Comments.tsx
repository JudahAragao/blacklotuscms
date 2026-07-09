import React from 'react';
import CommentForm from './CommentForm';
import { getCommentsForPost } from '@/lib/lotus-sdk';

export default async function Comments({ postId }: { postId: string }) {
  const comments = await getCommentsForPost(postId);

  return (
    <section className="mt-24 pt-16 border-t border-slate-100">
      <div className="flex items-center justify-between mb-12">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
          Discussão ({comments.length})
        </h3>
      </div>

      {/* Lista de Comentários */}
      <div className="space-y-12 mb-20">
        {comments.map((comment: any) => (
          <div key={comment.id}>
            <div className="flex gap-5">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold text-lg flex-shrink-0">
                {comment.author.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-slate-900">{comment.author}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-300 tracking-widest">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-slate-600 leading-relaxed text-sm bg-slate-50/50 p-4 rounded-xl border border-slate-100 italic">
                  "{comment.content}"
                </div>
                
                {/* Respostas (Replies) */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-6 ml-12 space-y-6 border-l-2 border-slate-50 pl-8">
                    {comment.replies.map((reply: any) => (
                      <div key={reply.id} className="flex gap-4">
                        <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 font-bold text-xs flex-shrink-0 border border-slate-100">
                          {reply.author.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-xs text-slate-700">{reply.author}</span>
                            <span className="text-[9px] text-slate-300 font-bold uppercase">{new Date(reply.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-slate-500 text-sm leading-relaxed">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-center text-slate-400 italic py-10">
            Seja o primeiro a comentar nesta publicação.
          </p>
        )}
      </div>

      {/* Formulário de Envio */}
      <CommentForm postId={postId} />
    </section>
  );
}
