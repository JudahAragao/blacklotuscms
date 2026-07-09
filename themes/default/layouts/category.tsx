import React from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default async function DefaultCategoryLayout({ data }: { data: any }) {
  return (
    <div className="blacklotuscms-theme min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 theme-container py-20">
        <header className="mb-16 text-center max-w-2xl mx-auto">
          <span className="bg-primary/10 text-primary text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] mb-4 inline-block">
            {data.taxonomy?.label || 'Categories'}
          </span>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">
            Browse by {data.taxonomy?.label || 'Category'}
          </h1>
          <p className="text-slate-500 text-base leading-relaxed">
            Select a term to view related content.
          </p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {data.terms && data.terms.length > 0 ? (
            data.terms.map((term: any) => (
              <Link
                key={term.id}
                href={`/archive/${term.slug}`}
                className="group bg-white border border-slate-100 p-6 rounded-2xl text-center hover:border-primary/30 hover:shadow-lg transition-all"
              >
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors mb-1">
                  {term.name}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  #{term.slug}
                </p>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
              <p className="text-slate-400 italic text-lg">No terms found for this taxonomy.</p>
              <Link href="/" className="inline-block mt-6 px-6 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold">
                Go Home
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
