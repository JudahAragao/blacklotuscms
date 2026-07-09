import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { renderContent } from '@/lib/lotus-sdk';

async function Excerpt({ content }: { content?: string }) {
  return <>{await renderContent(content ? content.substring(0, 200) + '...' : '')}</>;
}

export default async function DefaultSearchLayout({ data }: { data: any }) {
  // data = { query, results: Post[] }
  return (
    <div className="blacklotuscms-theme min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 theme-container py-20">
        <header className="mb-20">
          <span className="label-caps text-slate-400 mb-2 block">Search Results</span>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">
            Resultados para: <span className="text-primary italic">"{data.query}"</span>
          </h1>
          <p className="text-slate-500 mt-4 font-medium">
             Encontramos <span className="text-slate-900 font-bold">{data.results?.length || 0}</span> resultados correspondentes.
          </p>
        </header>

        <div className="space-y-8 max-w-4xl">
          {data.results && data.results.length > 0 ? (
            data.results.map((post: any) => (
              <article key={post.id} className="group flex flex-col md:flex-row gap-8 bg-white p-8 rounded-3xl border border-slate-100 hover:border-primary/20 hover:shadow-2xl ">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{post.postType?.label}</span>
                    <span className="text-slate-200">|</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(post.publishedAt).toLocaleDateString()}</span>
                  </div>
                  
                  <h2 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-primary transition-colors">
                    <a href={`/${post.slug}`}>{post.title}</a>
                  </h2>

                  <div className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-6">
                    <Excerpt content={post.content} />
                  </div>

                  <a href={`/${post.slug}`} className="text-xs font-bold text-slate-900 flex items-center gap-2 group-hover:gap-4 ">
                    LER CONTEÚDO COMPLETO <span className="text-primary">→</span>
                  </a>
                </div>
              </article>
            ))
          ) : (
            <div className="py-32 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Ops! Nada encontrado.</h3>
              <p className="text-slate-400 italic">Tente buscar por termos diferentes ou verifique a ortografia.</p>
              
              <div className="mt-10 max-w-md mx-auto">
                <form action="/search" method="GET" className="relative">
                  <input 
                    type="text" 
                    name="q"
                    placeholder="Tentar nova busca..."
                    className="w-full bg-white border border-slate-200 p-4 rounded-xl shadow-sm outline-none focus:border-primary  text-sm"
                  />
                  <button type="submit" className="absolute right-3 top-3 p-1.5 bg-primary text-on-primary rounded-lg shadow-md">
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
