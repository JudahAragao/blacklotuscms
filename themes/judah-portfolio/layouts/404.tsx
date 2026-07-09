import React from 'react';

export default function JudahNotFound({ data }: { data: any }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center space-y-12">
        <h1 className="text-[15rem] font-thin text-white/[0.04] select-none leading-none tracking-tighter">
          404
        </h1>

        <div className="space-y-6">
          <h2 className="text-4xl font-light text-[var(--vj-bone)] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            {data.title || 'LOST IN MINIMALISM'}
          </h2>
          <p className="text-lg text-[var(--color-muted-foreground)] leading-relaxed max-w-md mx-auto">
            {data.message || 'The path you followed lead to a space that does not exist in our current architecture.'}
          </p>
        </div>

        <div className="pt-12">
          <a
            href="/"
            className="inline-block border-b border-[var(--vj-bone)] pb-1 text-sm tracking-widest font-bold uppercase text-[var(--vj-bone)] hover:text-[var(--color-muted-foreground)] hover:border-[var(--color-muted-foreground)] transition-all"
          >
            RETURN TO HOME
          </a>
        </div>
      </div>
    </div>
  );
}
