'use client';

import React from 'react';
import Link from 'next/link';
import { HookService } from '@/core/services/HookService';
import { Puzzle } from 'lucide-react';

interface PluginNavItem {
  href: string;
  label: string;
  icon?: string;
  priority?: number;
}

export default function PluginSidebarNav() {
  // Get registered plugin navigation items from the slot
  const components = HookService.getComponents('admin.sidebar.plugins');

  if (components.length === 0) return null;

  return (
    <>
      <div className="pt-4 pb-1.5 px-3">
        <span className="text-[11px] font-semibold text-[#8c8f94] uppercase tracking-wider">Plugins</span>
      </div>

      {components.map((entry, idx) => {
        // If it's a function component, render it
        if (typeof entry.Component === 'function') {
          return (
            <div key={`plugin-nav-${idx}-${entry.source}`} data-bl-plugin={entry.source}>
              {React.createElement(entry.Component)}
            </div>
          );
        }

        // If it's a nav item object, render as Link
        const navItem = entry.Component as unknown as PluginNavItem;
        if (navItem && navItem.href && navItem.label) {
          return (
            <Link
              key={`plugin-nav-${idx}-${entry.source}`}
              href={navItem.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded text-sm text-[#d0cfc8] hover:bg-[#2c3338] hover:text-white transition-colors"
            >
              <Puzzle size={16} />
              <span>{navItem.label}</span>
            </Link>
          );
        }

        // If it's JSX, render directly
        return (
          <div key={`plugin-nav-${idx}-${entry.source}`} data-bl-plugin={entry.source}>
            {entry.Component}
          </div>
        );
      })}
    </>
  );
}
