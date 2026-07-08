import React from 'react';
import { prisma } from '@/lib/prisma';
import { SettingService } from '@/core/services/SettingService';
import { revalidatePath } from 'next/cache';
import { Globe, Save, Search, Share2, ExternalLink } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasCapability } from '@/lib/auth-utils';
import MediaPickerInput from '@/components/admin/MediaPickerInput';

export default async function SEOSettingsPage() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (!hasCapability(userRole, 'setting.manage')) {
    return <div className="p-10 text-center text-sm text-status-trash">Acesso negado.</div>;
  }

  const settings = await SettingService.getAll();
  const postTypes = await prisma.postType.findMany();

  const seoSettings = settings.seo || {
    site_name: 'BlackLotus CMS',
    title_separator: '|',
    meta_description: '',
    og_image: '',
    google_site_verification: '',
  };

  async function updateSEO(formData: FormData) {
    'use server';
    const session = await getServerSession(authOptions);
    if (!hasCapability((session?.user as any)?.role, 'setting.manage')) {
      throw new Error("Nao autorizado");
    }

    await SettingService.set('site_url', formData.get('site_url'), session?.user);
    const seoData = {
      site_name: formData.get('site_name'),
      title_separator: formData.get('title_separator'),
      meta_description: formData.get('meta_description'),
      og_image: formData.get('og_image'),
      google_site_verification: formData.get('google_site_verification'),
    };
    await SettingService.set('seo', seoData, session?.user);
    const selectedPostTypes = postTypes.filter(pt => formData.get(`sitemap_${pt.slug}`) === 'on').map(pt => pt.slug);
    await SettingService.set('sitemap_post_types', selectedPostTypes, session?.user);
    revalidatePath('/admin/seo');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-heading">Configuracao SEO</h1>
        <p className="text-sm text-text-muted mt-1">Otimizacao para mecanismos de busca</p>
      </div>

      <form action={updateSEO} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <div className="content-card p-6 space-y-6">
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Search size={16} className="text-action" />
                <h3 className="font-semibold text-sm text-text-heading">Presenca no Buscador</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="label-field-muted">URL do Site</label>
                  <input name="site_url" defaultValue={settings.site_url || 'http://localhost:3000'} className="field-input" placeholder="https://meusite.com" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="label-field-muted">Nome do Site</label>
                  <input name="site_name" defaultValue={seoSettings.site_name} className="field-input" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="label-field-muted">Separador de Titulo</label>
                  <select name="title_separator" defaultValue={seoSettings.title_separator} className="field-select">
                    <option value="|">Pipe ( | )</option>
                    <option value="-">Traco ( - )</option>
                    <option value="·">Ponto ( · )</option>
                    <option value="~">Til ( ~ )</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="label-field-muted">Descricao Meta Padrao</label>
                <textarea name="meta_description" rows={4} defaultValue={seoSettings.meta_description} className="field-textarea" placeholder="Descricao exibida quando o post nao possui uma descricao customizada." />
              </div>
            </section>

            <section className="pt-5 border-t border-border-default space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Globe size={16} className="text-action" />
                <h3 className="font-semibold text-sm text-text-heading">Arquitetura do Sitemap</h3>
              </div>
              <p className="text-xs text-text-muted">Selecione os tipos de conteudo para indexacao.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {postTypes.map((pt) => (
                  <label key={pt.id} className="flex items-center justify-between content-card p-3 hover:shadow-sm transition-all cursor-pointer">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-text-heading">{pt.label}</span>
                      <span className="text-xs text-text-muted font-mono">/{pt.slug}</span>
                    </div>
                    <input type="checkbox" name={`sitemap_${pt.slug}`} defaultChecked={settings.sitemap_post_types?.includes(pt.slug) ?? true} className="check-field" />
                  </label>
                ))}
              </div>
            </section>

            <section className="pt-5 border-t border-border-default space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Share2 size={16} className="text-action" />
                <h3 className="font-semibold text-sm text-text-heading">Compartilhamento Social (OpenGraph)</h3>
              </div>
              <div className="flex flex-col gap-1">
                <label className="label-field-muted">Imagem Social Padrao</label>
                <MediaPickerInput name="og_image" defaultValue={seoSettings.og_image} />
              </div>
            </section>

            <section className="pt-5 border-t border-border-default space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Globe size={16} className="text-action" />
                <h3 className="font-semibold text-sm text-text-heading">Ferramentas de Webmaster</h3>
              </div>
              <div className="flex flex-col gap-1">
                <label className="label-field-muted">Verificacao Google</label>
                <input name="google_site_verification" defaultValue={seoSettings.google_site_verification} className="field-input font-mono" placeholder="google-site-verification-id" />
              </div>
            </section>
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-4">
          <div className="content-card p-5">
            <h3 className="font-semibold text-sm text-text-heading mb-2">Salvar Alteracoes</h3>
            <p className="text-xs text-text-muted leading-relaxed mb-4">
              As configuracoes globais afetam como o seu site e visto pelos buscadores e redes sociais.
            </p>
            <button type="submit" className="btn-action w-full flex items-center justify-center gap-2">
              <Save size={16} /> Salvar SEO
            </button>
          </div>

          <div className="content-card p-5">
            <h3 className="font-semibold text-sm text-text-heading mb-2">Recursos</h3>
            <a href="/sitemap.xml" target="_blank" className="text-sm text-action hover:underline flex items-center gap-1.5">
              <ExternalLink size={12} /> Ver sitemap.xml
            </a>
          </div>

          <div className="content-card p-5">
            <h3 className="font-semibold text-sm text-text-heading mb-2">Pre-visualizacao</h3>
            <div className="bg-surface-muted p-3 rounded border border-border-default">
              <p className="text-xs text-text-muted font-mono">
                Pagina Exemplo {seoSettings.title_separator} {seoSettings.site_name}
              </p>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
