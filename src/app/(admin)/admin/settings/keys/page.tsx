import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ApiKeyService } from "@/core/services/ApiKeyService";
import ApiKeyManager from "./ApiKeyManager";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function ApiKeysPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const keys = await ApiKeyService.listKeys((session.user as any).id, session.user);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/settings" className="p-2 content-card text-text-muted hover:text-action transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-text-heading">Chaves API</h1>
          <p className="text-sm text-text-muted mt-1">Gerenciar tokens de acesso</p>
        </div>
      </div>

      <ApiKeyManager initialKeys={keys} />
    </div>
  );
}
