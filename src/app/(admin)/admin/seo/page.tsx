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
  const taxonomies = await prisma.taxonomy.findMany({
    include: { postType: { select: { slug: true, label: true } } }
  });

  const seoSettings = settings.seo || {
    site_name: 'BlackLotus CMS',
    title_separator: '|',
    meta_description: '',
    og_image: '',
    google_site_verification: '',
    bing_site_verification: '',
    yandex_site_verification: '',
    baidu_site_verification: '',
    naver_site_verification: '',
    pinterest_site_verification: '',
    apple_domain_verification: '',
    majestic_site_verification: '',
    ahrefs_site_verification: '',
    semrush_site_verification: '',
  };

  const sitemapPostTypes = (settings.sitemap_post_types as string[] | null) ?? null;
  const sitemapTaxonomies = (settings.sitemap_taxonomies as string[] | null) ?? null;

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
      bing_site_verification: formData.get('bing_site_verification'),
      yandex_site_verification: formData.get('yandex_site_verification'),
      baidu_site_verification: formData.get('baidu_site_verification'),
      naver_site_verification: formData.get('naver_site_verification'),
      pinterest_site_verification: formData.get('pinterest_site_verification'),
      apple_domain_verification: formData.get('apple_domain_verification'),
      majestic_site_verification: formData.get('majestic_site_verification'),
      ahrefs_site_verification: formData.get('ahrefs_site_verification'),
      semrush_site_verification: formData.get('semrush_site_verification'),
    };
    await SettingService.set('seo', seoData, session?.user);

    // Post types for sitemap
    const selectedPostTypes = postTypes
      .filter(pt => formData.get(`sitemap_${pt.slug}`) === 'on')
      .map(pt => pt.slug);
    await SettingService.set('sitemap_post_types', selectedPostTypes, session?.user);

    // Taxonomies for sitemap
    const selectedTaxonomies = taxonomies
      .filter(t => formData.get(`sitemap_taxonomy_${t.slug}`) === 'on')
      .map(t => t.slug);
    await SettingService.set('sitemap_taxonomies', selectedTaxonomies, session?.user);

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
              <p className="text-xs text-text-muted">Selecione os tipos de conteudo e taxonomias para indexacao.</p>

              {/* Post Types */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Tipos de Conteudo</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {postTypes.map((pt) => {
                    const isChecked = sitemapPostTypes !== null 
                      ? sitemapPostTypes.includes(pt.slug) 
                      : true;
                    return (
                      <label key={pt.id} className="flex items-center justify-between content-card p-3 hover:shadow-sm transition-all cursor-pointer">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-text-heading">{pt.label}</span>
                          <span className="text-xs text-text-muted font-mono">/{pt.slug}</span>
                        </div>
                        <input type="checkbox" name={`sitemap_${pt.slug}`} defaultChecked={isChecked} className="check-field" />
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Taxonomies */}
              {taxonomies.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Taxonomias</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {taxonomies.map((t) => {
                      const isChecked = sitemapTaxonomies !== null 
                        ? sitemapTaxonomies.includes(t.slug) 
                        : false;
                      return (
                        <label key={t.id} className="flex items-center justify-between content-card p-3 hover:shadow-sm transition-all cursor-pointer">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-text-heading">{t.label}</span>
                            <span className="text-xs text-text-muted font-mono">/{t.postType.slug}/{t.slug}</span>
                          </div>
                          <input type="checkbox" name={`sitemap_taxonomy_${t.slug}`} defaultChecked={isChecked} className="check-field" />
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
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
              <p className="text-xs text-text-muted">Cole os IDs de verificacao para incluir as meta tags no site.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="label-field-muted">Google Search Console</label>
                  <input name="google_site_verification" defaultValue={seoSettings.google_site_verification} className="field-input font-mono text-xs" placeholder="google-site-verification-id" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="label-field-muted">Bing Webmaster Tools</label>
                  <input name="bing_site_verification" defaultValue={seoSettings.bing_site_verification} className="field-input font-mono text-xs" placeholder="msvalidate.01-id" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="label-field-muted">Yandex Webmaster</label>
                  <input name="yandex_site_verification" defaultValue={seoSettings.yandex_site_verification} className="field-input font-mono text-xs" placeholder="yandex-verification-id" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="label-field-muted">Baidu Webmaster</label>
                  <input name="baidu_site_verification" defaultValue={seoSettings.baidu_site_verification} className="field-input font-mono text-xs" placeholder="baidu-site-verification-id" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="label-field-muted">Naver Webmaster</label>
                  <input name="naver_site_verification" defaultValue={seoSettings.naver_site_verification} className="field-input font-mono text-xs" placeholder="naver-site-verification-id" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="label-field-muted">Pinterest</label>
                  <input name="pinterest_site_verification" defaultValue={seoSettings.pinterest_site_verification} className="field-input font-mono text-xs" placeholder="p-domain-verify-id" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="label-field-muted">Apple Business Connect</label>
                  <input name="apple_domain_verification" defaultValue={seoSettings.apple_domain_verification} className="field-input font-mono text-xs" placeholder="apple-domain-verification-id" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="label-field-muted">Majestic</label>
                  <input name="majestic_site_verification" defaultValue={seoSettings.majestic_site_verification} className="field-input font-mono text-xs" placeholder="majestic-site-verification-id" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="label-field-muted">Ahrefs</label>
                  <input name="ahrefs_site_verification" defaultValue={seoSettings.ahrefs_site_verification} className="field-input font-mono text-xs" placeholder="ahrefs-site-verification-id" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="label-field-muted">SEMrush</label>
                  <input name="semrush_site_verification" defaultValue={seoSettings.semrush_site_verification} className="field-input font-mono text-xs" placeholder="semrush-site-verification-id" />
                </div>
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
