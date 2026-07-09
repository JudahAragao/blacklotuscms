'use client';

import React, { useState, useRef, useEffect } from 'react';

export default function HeaderSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Foca no input automaticamente ao abrir
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
      setIsOpen(false);
      setQuery('');
    }
  };

  return (
    <div className="relative flex items-center">
      <form 
        onSubmit={handleSubmit}
        className={`flex items-center   ease-out overflow-hidden ${
          isOpen ? 'w-48 md:w-64 opacity-100 mr-2' : 'w-0 opacity-0'
        }`}
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar no site..."
          className="w-full bg-slate-50 border border-slate-200 py-1.5 px-4 rounded-full text-xs outline-none focus:border-primary  shadow-inner"
        />
      </form>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2   ${
          isOpen ? 'text-primary rotate-90' : 'text-slate-400 hover:text-primary'
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
