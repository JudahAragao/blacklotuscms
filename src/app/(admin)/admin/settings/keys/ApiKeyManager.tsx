"use client";

import React, { useState } from "react";
import { createApiKeyAction, revokeApiKeyAction } from "./actions";
import { Trash2, Copy, Check, ShieldAlert, Key } from "lucide-react";
import { toast } from "sonner";

export default function ApiKeyManager({ initialKeys }: { initialKeys: any[] }) {
  const [keys, setKeys] = useState<any[]>(initialKeys);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const result = await createApiKeyAction(formData);
      if ('plainKey' in result) {
        setNewKey(result.plainKey);
        toast.success("Chave de API criada com sucesso!");
        window.location.reload();
      } else if ('error' in result) {
        toast.error(`Erro ao criar chave: ${result.error}`);
      }
    } catch (error) {
      toast.error("Erro ao criar chave");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Tem certeza que deseja revogar esta chave?")) return;
    try {
      await revokeApiKeyAction(id);
      setKeys(keys.filter((k) => k.id !== id));
      toast.success("Chave revogada com sucesso!");
    } catch (error) {
      toast.error("Erro ao revogar chave");
    }
  };

  const copyToClipboard = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      toast.success("Copiado para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {newKey && (
        <div className="content-card border-l-4 border-status-draft p-5 relative overflow-hidden">
          <div className="flex items-center gap-3 text-status-draft mb-4">
            <ShieldAlert size={22} />
            <div>
              <h3 className="font-semibold text-sm text-text-heading">Chave Gerada</h3>
              <p className="text-xs text-text-muted">
                Salve esta chave agora. Ela <span className="font-bold underline">nao sera exibida novamente</span>.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <code className="bg-surface-muted border border-border-default p-3 rounded flex-1 font-mono text-sm break-all text-text-heading">
              {newKey}
            </code>
            <button onClick={copyToClipboard} className="btn-action flex items-center justify-center gap-2 whitespace-nowrap">
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
          <button onClick={() => setNewKey(null)} className="mt-3 text-xs text-text-muted hover:text-text-heading transition-colors underline">
            Fechar
          </button>
        </div>
      )}

      <div className="content-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Key size={16} className="text-action" />
          <h3 className="font-semibold text-sm text-text-heading">Gerar Nova Chave</h3>
        </div>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="label-field-muted">Nome</label>
            <input required name="name" placeholder="Ex: Producao" className="field-input" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="label-field-muted">Limite (req/min)</label>
            <input type="number" required name="rateLimit" defaultValue="60" min="1" max="10000" className="field-input" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="label-field-muted">Expiracao</label>
            <select name="expiresDays" className="field-select">
              <option value="0">Perpetua</option>
              <option value="30">30 dias</option>
              <option value="90">90 dias</option>
              <option value="365">1 ano</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="btn-action disabled:opacity-50">
            {loading ? "Gerando..." : "Gerar Chave"}
          </button>
        </form>
      </div>

      <div className="content-card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Limite</th>
              <th>Criada em</th>
              <th>Expira</th>
              <th className="text-right">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {keys.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-text-muted">Nenhuma chave encontrada.</td>
              </tr>
            ) : (
              keys.map((key) => (
                <tr key={key.id}>
                  <td>
                    <span className="font-medium text-text-heading text-sm">{key.name}</span>
                    {key.lastUsedAt && (
                      <p className="text-[10px] text-status-published mt-0.5">Ultimo uso: {new Date(key.lastUsedAt).toLocaleDateString('pt-BR')}</p>
                    )}
                  </td>
                  <td className="text-sm text-text-body">{key.rateLimit} req/min</td>
                  <td className="text-xs text-text-muted font-mono">{new Date(key.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td className="text-xs text-text-muted font-mono">{key.expiresAt ? new Date(key.expiresAt).toLocaleDateString('pt-BR') : "Perpetua"}</td>
                  <td className="text-right">
                    <button onClick={() => handleRevoke(key.id)} className="p-1.5 text-text-muted hover:text-status-trash transition-colors" title="Revogar">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
