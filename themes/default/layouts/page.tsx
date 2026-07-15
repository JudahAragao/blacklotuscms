import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ThemeContent from '@/components/ThemeContent';

export default async function DefaultPageLayout({ data }: { data: any }) {
  return (
    <div className="blacklotuscms-theme min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Banner de Página */}
        <header className="bg-slate-50 border-b border-slate-100 py-32 overflow-hidden relative">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="theme-container relative z-10">
            <span className="label-caps text-primary mb-4 block">Official Page</span>
            <h1 className="text-7xl font-black text-slate-900 tracking-tighter leading-none">
              {data.title}
            </h1>
          </div>
        </header>

          {/* Conteúdo */}
          <div className="theme-container py-24">
            <article className="max-w-4xl theme-prose prose prose-slate lg:prose-xl max-w-none">
            <ThemeContent content={data.content} />
          </article>

          {/* MetaFields (Exibidos como seções extras se existirem) */}
          {data.metaValues?.length > 0 && (
            <div className="mt-32 grid grid-cols-1 md:grid-cols-2 gap-16 border-t border-slate-100 pt-16">
              {data.metaValues.map((mv: any) => (
                <div key={mv.id}>
                  <h4 className="label-caps text-slate-400 mb-4">{mv.field.label}</h4>
                  <div className="text-slate-800">
                    {mv.field.type === 'image' ? (
                      <img src={mv.value} alt={mv.field.label} className="rounded-2xl shadow-2xl ring-1 ring-slate-900/5" />
                    ) : mv.field.type === 'file' ? (
                      <a href={mv.value} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                        {mv.value?.split('/').pop() || 'Download'}
                      </a>
                    ) : (
                      <p className="text-xl font-medium leading-relaxed">{mv.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
