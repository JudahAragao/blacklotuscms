import React from 'react';
import Link from 'next/link';

export default function ThemeNotFound({ data }: { data: any }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6">
      <div className="max-w-2xl w-full text-center space-y-12">
        <h1 className="text-[15rem] font-thin text-slate-100 select-none leading-none tracking-tighter">404</h1>
        
        <div className="space-y-6">
          <h2 className="text-4xl font-light text-slate-900 tracking-tight">
            {data.title || 'LOST IN MINIMALISM'}
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed max-w-md mx-auto">
            {data.message || 'The path you followed lead to a space that does not exist in our current architecture.'}
          </p>
        </div>

        <div className="pt-12">
          <Link 
            href="/" 
            className="inline-block border-b border-slate-900 pb-1 text-sm tracking-widest font-bold uppercase hover:text-slate-500 hover:border-slate-300 transition-all"
          >
            RETURN TO HOME
          </Link>
        </div>
      </div>
    </div>
  );
}
