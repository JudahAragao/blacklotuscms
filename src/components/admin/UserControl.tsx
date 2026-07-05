'use client';

import React from 'react';
import { signOut } from 'next-auth/react';
import { LogOut, Settings } from 'lucide-react';
import Link from 'next/link';

interface UserControlProps {
  user: {
    id: string;
    email: string;
    roleName: string;
    image?: string | null;
  };
}

export default function UserControl({ user }: UserControlProps) {
  return (
    <div className="border-t border-[#2c3338] p-3 space-y-2">
      <div className="flex items-center gap-2.5 px-2 py-1.5">
        <div className="w-8 h-8 rounded-full bg-[#2c3338] flex items-center justify-center overflow-hidden border border-[#3c434a] flex-shrink-0">
          {user.image ? (
            <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-[#a7aaad] font-bold">{user.email.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[#d0cfc8] truncate leading-tight">
            {user.email.split('@')[0]}
          </p>
          <p className="text-[10px] text-[#8c8f94] truncate">
            {user.roleName}
          </p>
        </div>
      </div>

      <div className="flex gap-1.5">
        <Link
          href={`/admin/settings/users/${user.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-[#a7aaad] hover:bg-[#2c3338] hover:text-white transition-colors text-[11px]"
          title="Perfil"
        >
          <Settings size={12} />
          <span>Perfil</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/auth/login' })}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-[#a7aaad] hover:bg-[#2c3338] hover:text-[#b32d2e] transition-colors text-[11px]"
          title="Sair"
        >
          <LogOut size={12} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
}
