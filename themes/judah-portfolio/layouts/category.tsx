import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default async function JudahCategoryLayout({ data }: { data: any }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 vj-section py-20">
        <header className="mb-16 text-center max-w-2xl mx-auto">
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-[var(--vj-gold)]/10 text-[var(--vj-gold)] text-[10px] font-bold uppercase tracking-[0.2em]">
            {data.taxonomy?.label || 'Categories'}
          </span>
          <h1 className="vj-section-title mb-4">
            Browse by {data.taxonomy?.label || 'Category'}
          </h1>
          <p className="text-[var(--color-muted-foreground)] text-base leading-relaxed">
            Select a term to view related content.
          </p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {data.terms && data.terms.length > 0 ? (
            data.terms.map((term: any) => (
              <a
                key={term.id}
                href={`/archive/${term.slug}`}
                className="group rounded-2xl border border-white/[0.06] bg-[var(--vj-gold)]/[0.03] p-6 text-center transition-all hover:border-[var(--vj-gold)]/30 hover:shadow-lg hover:shadow-[var(--vj-gold)]/5"
              >
                <h3 className="text-lg font-semibold text-[var(--vj-bone)] group-hover:text-[var(--vj-gold)] transition-colors mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                  {term.name}
                </h3>
                <p className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase tracking-widest">
                  #{term.slug}
                </p>
              </a>
            ))
          ) : (
            <div className="col-span-full py-20 text-center vj-glass rounded-2xl border-2 border-dashed border-white/[0.06]">
              <p className="text-[var(--color-muted-foreground)] italic text-lg">No terms found for this taxonomy.</p>
              <a href="/" className="inline-block mt-6 vj-btn-primary">Go Home</a>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
