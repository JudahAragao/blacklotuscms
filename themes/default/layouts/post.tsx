import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Comments from '../components/Comments';
import { renderContent, ThemeSlot } from '@/lib/lotus-sdk';

export default async function DefaultPostLayout({ data, context }: { data: any, context: string }) {
  return (
    <div className="blacklotuscms-theme min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 theme-container py-20">
        <article className="max-w-3xl mx-auto">
          {/* Slot for Plugins (especially useful for public route Overrides) */}
          <ThemeSlot name={`public.route.${context}`} data={data} />

          {context === 'single' && (
            <>
              {/* Breadcrumbs / Meta Info */}
              <div className="flex items-center gap-3 mb-8">
                <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  {data.postType?.label || 'Post'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {new Date(data.publishedAt).toLocaleDateString()}
                </span>
              </div>

              <header className="mb-16">
                <h1 className="text-6xl font-black text-slate-900 leading-[1.1] tracking-tight mb-8">
                  {data.title}
                </h1>
                
                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold border border-slate-200">
                    {data.author?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      {data.author?.email?.split('@')[0] || 'Admin'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium italic">BlackLotusCMS Editor</p>
                  </div>
                </div>
              </header>

              {/* Content with Shortcode support */}
              <div className="theme-prose prose prose-slate lg:prose-xl max-w-none prose-headings:font-black prose-a:text-primary">
                 {await renderContent(data.content)}
              </div>

              {/* Tags / Terms */}
              {data.terms?.length > 0 && (
                <div className="mt-16 flex flex-wrap gap-2">
                  {data.terms.map((pt: any) => (
                    <a 
                      key={pt.term.id} 
                      href={`/archive/${pt.term.slug}`}
                      className="bg-slate-50 text-slate-500 hover:bg-primary hover:text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider  border border-slate-100"
                    >
                      #{pt.term.name}
                    </a>
                  ))}
                </div>
              )}

              {/* Dynamic Comments Section */}
              <Comments postId={data.id} />
            </>
          )}
        </article>
      </main>

      <Footer />
    </div>
  );
}
