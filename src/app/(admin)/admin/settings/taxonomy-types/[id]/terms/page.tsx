import React from 'react';
import { TaxonomyService } from '@/core/services/TaxonomyService';
import { deleteTermAction } from './actions';
import TermForm from './TermForm';
import { Trash2, Tag, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function TermManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const taxonomy = await TaxonomyService.getById(id);

  if (!taxonomy) {
    notFound();
  }
  const terms = taxonomy.terms ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/settings/taxonomy-types" className="p-2 content-card text-text-muted hover:text-action transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-text-heading">{taxonomy.label}</h1>
          <p className="text-sm text-text-muted mt-1">Gerenciar termos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TermForm taxonomyId={id} />
        </div>

        <div className="lg:col-span-2">
          <div className="content-card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Termo</th>
                  <th className="text-right">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {terms.map((term) => (
                  <tr key={term.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded bg-surface-muted flex items-center justify-center text-text-muted"><Tag size={14} /></div>
                        <div>
                          <div className="font-medium text-text-heading text-sm">{term.name}</div>
                          <div className="text-xs text-text-muted font-mono">/{term.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-right">
                      <form action={async () => { 'use server'; await deleteTermAction(term.id, id); }}>
                        <button className="p-1.5 text-text-muted hover:text-status-trash transition-colors"><Trash2 size={16} /></button>
                      </form>
                    </td>
                  </tr>
                ))}
                {terms.length === 0 && (
                  <tr><td colSpan={2} className="px-4 py-10 text-center text-sm text-text-muted">Nenhum termo adicionado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
