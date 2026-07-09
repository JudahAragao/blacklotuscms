import React from 'react';
import { CommentService } from '@/core/services/CommentService';
import CommentForm from './CommentForm';

export default async function Comments({ postId }: { postId: string }) {
  const comments = await CommentService.getForPost(postId);

  return (
    <section className="mt-24 pt-16 border-t border-white/[0.06]">
      <div className="flex items-center justify-between mb-12">
        <h3 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--vj-bone)] tracking-tight">
          Discussão ({comments.length})
        </h3>
      </div>

      <div className="space-y-12 mb-20">
        {comments.map((comment: any) => (
          <div key={comment.id}>
            <div className="flex gap-5">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-[var(--vj-gold)] font-bold text-lg shrink-0 border border-[var(--vj-gold)]/20 bg-[var(--vj-gold)]/10">
                {comment.author.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold text-[var(--vj-bone)]">{comment.author}</span>
                  <span className="text-[10px] uppercase font-bold text-[var(--color-muted-foreground)] tracking-widest">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-[var(--color-muted-foreground)] leading-relaxed text-sm vj-glass rounded-xl p-4 italic">
                  &ldquo;{comment.content}&rdquo;
                </div>

                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-6 ml-12 space-y-6 border-l-2 border-white/[0.06] pl-8">
                    {comment.replies.map((reply: any) => (
                      <div key={reply.id} className="flex gap-4">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--vj-gold)]/60 font-bold text-xs shrink-0 border border-white/[0.06] bg-white/[0.03]">
                          {reply.author.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-xs text-[var(--vj-bone)]">{reply.author}</span>
                            <span className="text-[9px] text-[var(--color-muted-foreground)] font-bold uppercase">
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[var(--color-muted-foreground)] text-sm leading-relaxed">{reply.content}</p>
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
          <p className="text-center text-[var(--color-muted-foreground)] italic py-10">
            Seja o primeiro a comentar nesta publicação.
          </p>
        )}
      </div>

      <CommentForm postId={postId} />
    </section>
  );
}
