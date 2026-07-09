import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ThemeContent from '@/components/ThemeContent';

export default async function JudahSearchLayout({ data }: { data: any }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 vj-section py-20">
        <header className="mb-20">
          <p className="vj-section-eyebrow mb-2 block">Search Results</p>
          <h1 className="vj-section-title">
            Resultados para: <span className="vj-text-gradient italic">&ldquo;{data.query}&rdquo;</span>
          </h1>
          <p className="text-[var(--color-muted-foreground)] mt-4 font-medium">
            Encontramos <span className="text-[var(--vj-bone)] font-bold">{data.results?.length || 0}</span> resultados correspondentes.
          </p>
        </header>

        <div className="space-y-8 max-w-4xl">
          {data.results && data.results.length > 0 ? (
            data.results.map((post: any) => (
              <article
                key={post.id}
                className="group flex flex-col md:flex-row gap-8 vj-glass rounded-2xl p-8 transition-all hover:-translate-y-0.5 hover:border-[var(--vj-gold)]/30"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-[10px] font-bold text-[var(--vj-gold)] uppercase tracking-[0.2em]">
                      {(post.postType as any)?.label || 'Post'}
                    </span>
                    <span className="text-white/10">|</span>
                    <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase tracking-widest">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''}
                    </span>
                  </div>

                  <h2 className="text-2xl font-semibold text-[var(--vj-bone)] mb-4 group-hover:text-[var(--vj-gold)] transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
                    <a href={`/${post.slug}`}>{post.title}</a>
                  </h2>

                  <div className="text-[var(--color-muted-foreground)] text-sm line-clamp-2 leading-relaxed mb-6">
                    <ThemeContent content={post.content?.substring(0, 200) + '...'} />
                  </div>

                  <a
                    href={`/${post.slug}`}
                    className="text-xs font-bold text-[var(--vj-bone)] flex items-center gap-2 group-hover:gap-4 transition-all"
                  >
                    LER CONTEÚDO COMPLETO <span className="text-[var(--vj-gold)]">→</span>
                  </a>
                </div>
              </article>
            ))
          ) : (
            <div className="py-32 text-center vj-glass rounded-2xl border-2 border-dashed border-white/[0.06]">
              <h3 className="text-2xl font-bold text-[var(--vj-bone)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>Ops! Nada encontrado.</h3>
              <p className="text-[var(--color-muted-foreground)] italic">Tente buscar por termos diferentes ou verifique a ortografia.</p>

              <div className="mt-10 max-w-md mx-auto">
                <form action="/search" method="GET" className="relative">
                  <input
                    type="text"
                    name="q"
                    placeholder="Tentar nova busca..."
                    className="w-full bg-white/[0.04] border border-white/[0.08] p-4 rounded-xl shadow-sm outline-none focus:border-[var(--vj-gold)]/60 focus:ring-2 focus:ring-[var(--vj-gold)]/20 text-sm text-[var(--vj-bone)] placeholder:text-[var(--color-muted-foreground)]/50 transition-colors"
                  />
                  <button type="submit" className="absolute right-3 top-3 p-1.5 bg-[var(--vj-gold)] text-[#1A1500] rounded-lg shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
