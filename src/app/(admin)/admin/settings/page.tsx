import React from 'react';
import { SettingService } from '@/core/services/SettingService';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { Key, Save, Server, Layers, Users, Tags } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasCapability } from '@/lib/auth-utils';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (!hasCapability(userRole, 'setting.manage')) {
    return <div className="p-10 text-center text-sm text-status-trash">Acesso negado: area restrita a administradores.</div>;
  }

  const settings = await SettingService.getAll();

  async function updateSettings(formData: FormData) {
    'use server';

    const session = await getServerSession(authOptions);
    if (!hasCapability((session?.user as any)?.role, 'setting.manage')) {
      throw new Error("Nao autorizado");
    }

    const driver = formData.get('storage_driver') as string;
    await SettingService.set('storage_driver', driver);

    if (driver !== 'local') {
      const s3Config = {
        endpoint: formData.get('s3_endpoint'),
        accessKeyId: formData.get('s3_access_key'),
        secretAccessKey: formData.get('s3_secret'),
        bucket: formData.get('s3_bucket'),
        publicUrl: formData.get('s3_public_url'),
      };
      await SettingService.set('s3_config', s3Config);
    }

    revalidatePath('/admin/settings');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-heading">Configuracoes</h1>
        <p className="text-sm text-text-muted mt-1">Configuracoes gerais do sistema</p>
      </div>

      <form action={updateSettings} className="content-card p-6 space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Server size={16} className="text-action" />
            <h3 className="font-semibold text-sm text-text-heading">Motor de Armazenamento</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="label-field-muted">Driver Ativo</label>
              <select
                name="storage_driver"
                defaultValue={settings.storage_driver || 'local'}
                className="field-select"
              >
                <option value="local">Sistema de Arquivos Local</option>
                <option value="s3">Amazon S3</option>
                <option value="r2">Cloudflare R2</option>
              </select>
            </div>
          </div>
        </section>

        <section className="pt-6 border-t border-border-default">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-action"></div>
            <h3 className="font-semibold text-sm text-text-heading">Credenciais Cloud (S3/R2)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            {[
              { id: 's3_endpoint', label: 'Endpoint', type: 'text', default: settings.s3_config?.endpoint },
              { id: 's3_bucket', label: 'Bucket', type: 'text', default: settings.s3_config?.bucket },
              { id: 's3_access_key', label: 'Access Key', type: 'password', default: settings.s3_config?.accessKeyId },
              { id: 's3_secret', label: 'Secret Key', type: 'password', default: settings.s3_config?.secretAccessKey },
            ].map((field) => (
              <div key={field.id} className="flex flex-col gap-1.5">
                <label className="label-field-muted">{field.label}</label>
                <input
                  type={field.type}
                  name={field.id}
                  defaultValue={field.default}
                  className="field-input"
                />
              </div>
            ))}
            <div className="flex flex-col md:col-span-2 gap-1.5">
              <label className="label-field-muted">URL Publica (CDN)</label>
              <input
                type="text"
                name="s3_public_url"
                defaultValue={settings.s3_config?.publicUrl}
                className="field-input"
                placeholder="https://cdn.seudominio.com"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-4 border-t border-border-default">
          <button type="submit" className="btn-action flex items-center gap-2">
            <Save size={16} /> Salvar Configuracoes
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/admin/settings/keys"
          className="content-card p-5 flex items-center gap-4 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded bg-action-light flex items-center justify-center text-action group-hover:bg-action group-hover:text-white transition-colors">
            <Key size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-text-heading">Chaves API</h4>
            <p className="text-xs text-text-muted">Gerenciar tokens de acesso</p>
          </div>
        </Link>

        <Link
          href="/admin/settings/post-types"
          className="content-card p-5 flex items-center gap-4 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded bg-action-light flex items-center justify-center text-action group-hover:bg-action group-hover:text-white transition-colors">
            <Layers size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-text-heading">Tipos de Conteudo</h4>
            <p className="text-xs text-text-muted">Definir estruturas de dados</p>
          </div>
        </Link>

        <Link
          href="/admin/settings/users"
          className="content-card p-5 flex items-center gap-4 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded bg-action-light flex items-center justify-center text-action group-hover:bg-action group-hover:text-white transition-colors">
            <Users size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-text-heading">Usuarios e Roles</h4>
            <p className="text-xs text-text-muted">Gerenciar contas e permissoes</p>
          </div>
        </Link>

        <Link
          href="/admin/settings/taxonomy-types"
          className="content-card p-5 flex items-center gap-4 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded bg-action-light flex items-center justify-center text-action group-hover:bg-action group-hover:text-white transition-colors">
            <Tags size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-text-heading">Taxonomias</h4>
            <p className="text-xs text-text-muted">Categorizar e taggear conteudo</p>
          </div>
        </Link>

        <Link
          href="/admin/settings/reading"
          className="content-card p-5 flex items-center gap-4 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded bg-action-light flex items-center justify-center text-action group-hover:bg-action group-hover:text-white transition-colors">
            <Layers size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-text-heading">Leitura</h4>
            <p className="text-xs text-text-muted">Configurar exibicao da pagina inicial</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
