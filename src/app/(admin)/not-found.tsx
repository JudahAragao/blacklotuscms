import React from 'react';
import Link from 'next/link';

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="relative">
        <div className="text-[10rem] sm:text-[12rem] font-black text-text-muted/10 select-none leading-none">404</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <img src="/assets/brand/logo.png" alt="BlackLotusCMS" className="w-20 h-20 object-contain" />
        </div>
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <h2 className="text-2xl font-semibold text-text-heading">Pagina Nao Encontrada</h2>
        <p className="text-sm text-text-muted leading-relaxed">
          O recurso que voce procura nao existe nesta area ou foi movido.
        </p>
      </div>

      <Link href="/admin" className="btn-action">
        Voltar ao Dashboard
      </Link>
    </div>
  );
}
