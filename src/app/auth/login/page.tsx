'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else if (result?.ok) {
      // Redirect to admin dashboard or home
      window.location.href = '/admin';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center gap-3">
          <img src="/assets/brand/logo.png" alt="BlackLotusCMS" className="w-20 h-20 object-contain mb-1" />
          <div>
            <h1 className="text-2xl font-bold text-on-background">BlackLotusCMS</h1>
            <p className="text-sm text-on-surface-variant mt-1">Acesse o painel de administracao</p>
          </div>
        </div>

        <div className="bg-surface-container/60 backdrop-blur-md border border-white/10 shadow-xl rounded-md p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
          {error && (
            <div className="bg-status-trash/10 border-l-4 border-status-trash text-status-trash p-4 mb-6 text-sm rounded-r">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="label-field-muted">Email</label>
              <input
                id="email"
                type="email"
                required
                className="input-minimal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="label-field-muted">Senha</label>
              <input
                id="password"
                type="password"
                required
                className="input-minimal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-on-primary px-6 py-3 font-bold transition-all hover:brightness-110 active:scale-95 rounded-md cursor-pointer border-t border-t-white/15 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-on-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link href="/install" className="text-xs text-primary/60 hover:text-primary transition-colors">
            Sistema nao configurado? Iniciar setup
          </Link>
        </div>
      </div>
    </div>
  );
}
