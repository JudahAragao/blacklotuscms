import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ThemeContent from '@/components/ThemeContent';

export default async function JudahArchiveLayout({ data }: { data: any }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 vj-section py-20">
        <header className="mb-20 text-center max-w-2xl mx-auto">
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white/[0.06] text-[var(--color-muted-foreground)] text-[10px] font-bold uppercase tracking-[0.2em]">
            {data.term?.taxonomy?.label || 'Arquivo'}
          </span>
          <h1 className="vj-section-title mb-6">
            {data.term?.name || 'Conteúdo'}
          </h1>
          <p className="text-[var(--color-muted-foreground)] text-lg leading-relaxed italic">
            Explorando todos os registros sob o termo <span className="text-[var(--vj-gold)] font-bold">#{data.term?.slug}</span>.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {data.results && data.results.length > 0 ? (
            data.results.map((post: any) => (
              <article
                key={post.id}
                className="group vj-glass rounded-2xl p-8 flex flex-col transition-all hover:-translate-y-1 hover:border-[var(--vj-gold)]/30 hover:shadow-2xl hover:shadow-[var(--vj-gold)]/5"
              >
                <div className="mb-6 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase tracking-widest">
                    {(post.postType as any)?.label || 'Post'}
                  </span>
                  <span className="text-[10px] font-bold text-[var(--vj-gold)] opacity-0 group-hover:opacity-100 tracking-widest transition-opacity">
                    READ MORE →
                  </span>
                </div>

                <h2 className="text-2xl font-semibold text-[var(--vj-bone)] mb-4 leading-tight group-hover:text-[var(--vj-gold)] transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
                  <a href={`/${post.slug}`}>{post.title}</a>
                </h2>

                <div className="text-[var(--color-muted-foreground)] text-sm line-clamp-3 mb-8 flex-1 leading-relaxed">
                  <ThemeContent content={post.content?.substring(0, 120) + '...'} />
                </div>

                <div className="flex items-center gap-3 pt-6 border-t border-white/[0.04]">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-[var(--vj-gold)] bg-[var(--vj-gold)]/10 border border-[var(--vj-gold)]/20">
                    {post.author?.email?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase tracking-widest">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full py-32 text-center vj-glass rounded-2xl border-2 border-dashed border-white/[0.06]">
              <p className="text-[var(--color-muted-foreground)] italic text-xl">Nenhum conteúdo encontrado para esta categoria.</p>
              <a href="/" className="inline-block mt-8 vj-btn-primary">Voltar ao Início</a>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
