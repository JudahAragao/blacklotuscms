import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { renderContent } from '@/lib/lotus-sdk';

async function Excerpt({ content }: { content?: string }) {
  return <>{await renderContent(content ? content.substring(0, 120) + '...' : '')}</>;
}

export default async function DefaultArchiveLayout({ data }: { data: any }) {
  return (
    <div className="blacklotuscms-theme min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 theme-container py-20">
        <header className="mb-20 text-center max-w-2xl mx-auto">
          <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] mb-4 inline-block">
            {data.term?.taxonomy?.label || 'Arquivo'}
          </span>
          <h1 className="text-6xl font-black text-slate-900 tracking-tight mb-6">
            {data.term?.name || 'Conteúdo'}
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed italic">
            Explorando todos os registros sob o termo <span className="text-primary font-bold">#{data.term?.slug}</span>.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {data.results && data.results.length > 0 ? (
            data.results.map((post: any) => (
              <article key={post.id} className="group bg-white border border-slate-100 p-8 rounded-3xl shadow-sm hover:shadow-2xl hover:border-primary/20  flex flex-col">
                <div className="mb-6 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{post.postType?.label}</span>
                  <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100  tracking-widest">READ MORE →</span>
                </div>
                
                <h2 className="text-2xl font-black text-slate-900 mb-4 leading-tight group-hover:text-primary transition-colors">
                  <a href={`/${post.slug}`}>{post.title}</a>
                </h2>

                <div className="text-slate-500 text-sm line-clamp-3 mb-8 flex-1 leading-relaxed">
                   {/* Strip HTML tags for excerpt or use ThemeContent with custom parser */}
                   <Excerpt content={post.content} />
                </div>

                <div className="flex items-center gap-3 pt-6 border-t border-slate-50">
                  <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-400">
                    {post.author?.email?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full py-32 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
              <p className="text-slate-400 italic text-xl">Nenhum conteúdo encontrado para esta categoria.</p>
              <a href="/" className="theme-btn theme-btn-primary mt-8">Voltar ao Início</a>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
