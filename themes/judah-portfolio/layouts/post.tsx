import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Comments from '../components/Comments';
import ThemeContent from '@/components/ThemeContent';
import BlackLotusCMSSlot from '@/components/admin/BlackLotusCMSSlot';

export default async function JudahPostLayout({ data, context }: { data: any; context: string }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 vj-section py-20">
        <article className="max-w-3xl mx-auto">
          <BlackLotusCMSSlot name={`public.route.${context}`} data={data} />

          {context === 'single' && (
            <>
              {/* Meta info */}
              <div className="flex items-center gap-3 mb-8">
                <span className="px-3 py-1 rounded-full bg-[var(--vj-gold)]/10 text-[var(--vj-gold)] text-[10px] font-bold uppercase tracking-widest">
                  {(data.postType as any)?.label || 'Post'}
                </span>
                <span className="text-white/10">•</span>
                <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase tracking-widest">
                  {data.publishedAt ? new Date(data.publishedAt).toLocaleDateString() : ''}
                </span>
              </div>

              {/* Title */}
              <header className="mb-16">
                <h1 className="text-5xl md:text-6xl font-semibold leading-[1.1] tracking-tight mb-8 text-[var(--vj-bone)]" style={{ fontFamily: 'var(--font-display)' }}>
                  {data.title}
                </h1>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--vj-gold)] font-bold border border-[var(--vj-gold)]/20 bg-[var(--vj-gold)]/10">
                    {data.author?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--vj-bone)] uppercase tracking-wide">
                      {data.author?.email?.split('@')[0] || 'Admin'}
                    </p>
                    <p className="text-[10px] text-[var(--color-muted-foreground)] font-medium italic">Judah Portfolio Editor</p>
                  </div>
                </div>
              </header>

              {/* Content */}
              <div className="vj-prose max-w-none">
                <ThemeContent content={data.content} />
              </div>

              {/* Terms / Tags */}
              {data.terms?.length > 0 && (
                <div className="mt-16 flex flex-wrap gap-2">
                  {data.terms.map((pt: any) => (
                    <a
                      key={pt.term.id}
                      href={`/archive/${pt.term.slug}`}
                      className="vj-tag hover:bg-[var(--vj-gold)]/10 hover:text-[var(--vj-gold)] hover:border-[var(--vj-gold)]/50"
                    >
                      #{pt.term.name}
                    </a>
                  ))}
                </div>
              )}

              {/* Comments */}
              <Comments postId={data.id} />
            </>
          )}
        </article>
      </main>

      <Footer />
    </div>
  );
}
