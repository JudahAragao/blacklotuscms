'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HeaderSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  return (
    <div className="relative flex items-center">
      <form
        onSubmit={handleSubmit}
        className={`flex items-center transition-all duration-300 ease-out overflow-hidden ${
          isOpen ? 'w-48 md:w-64 opacity-100 mr-2' : 'w-0 opacity-0'
        }`}
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar no site..."
          className="w-full bg-white/[0.04] border border-white/[0.08] py-1.5 px-4 rounded-full text-xs text-[var(--vj-bone)] outline-none focus:border-[var(--vj-gold)]/60 shadow-inner transition-colors placeholder:text-[var(--color-muted-foreground)]/50"
        />
      </form>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 transition-colors ${
          isOpen ? 'text-[var(--vj-gold)] rotate-90' : 'text-[var(--color-muted-foreground)] hover:text-[var(--vj-gold)]'
        }`}
        aria-label="Toggle Search"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        )}
      </button>
    </div>
  );
}
