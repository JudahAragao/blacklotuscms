import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ChevronLeft, Tags } from 'lucide-react';
import Link from 'next/link';
import TermForm from './TermForm';
import TermRow from './TermRow';

export default async function TaxonomyTermsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const taxonomy = await prisma.taxonomy.findUnique({
    where: { slug },
    include: {
      postType: { select: { label: true, slug: true } },
      terms: {
        include: {
          _count: { select: { posts: true } }
        },
        orderBy: { name: 'asc' }
      }
    }
  });

  if (!taxonomy) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="p-2 content-card text-text-muted hover:text-action transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-text-heading">{taxonomy.label}</h1>
          <p className="text-sm text-text-muted mt-1">
            Gerenciar termos de {taxonomy.postType?.label ?? 'taxonomia'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TermForm taxonomyId={taxonomy.id} />
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
                {taxonomy.terms.map((term) => (
                  <TermRow key={term.id} term={term} taxonomyId={taxonomy.id} />
                ))}
                {taxonomy.terms.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-4 py-10 text-center text-sm text-text-muted">
                      Nenhum termo adicionado. Use o formulario ao lado para criar o primeiro termo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
