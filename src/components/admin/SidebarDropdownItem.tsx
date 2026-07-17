'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

interface DropdownItem {
  label: string;
  href: string;
}

interface SidebarDropdownItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  items: DropdownItem[];
  defaultOpen?: boolean;
}

export default function SidebarDropdownItem({ 
  href, 
  label, 
  icon, 
  items, 
  defaultOpen = false 
}: SidebarDropdownItemProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const hasItems = items.length > 0;
  const currentUrl = pathname + (searchParams.toString() ? '?' + searchParams.toString() : '');
  
  return (
    <div>
      <div className="flex items-center">
        <Link
          href={href}
          className="flex items-center gap-2.5 px-3 py-2 rounded text-sm text-[#d0cfc8] hover:bg-[#2c3338] hover:text-white transition-colors flex-1"
        >
          {icon}
          <span>{label}</span>
        </Link>
        {hasItems && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-[#a7aaad] hover:text-white transition-colors"
            aria-label={isOpen ? 'Fechar submenu' : 'Abrir submenu'}
          >
            <ChevronDown 
              size={14} 
              className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            />
          </button>
        )}
      </div>
      
      {hasItems && isOpen && (
        <div className="ml-4 mt-0.5 space-y-0.5">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-1.5 rounded text-xs transition-colors ${
                currentUrl === item.href
                  ? 'bg-[#2c3338] text-white'
                  : 'text-[#a7aaad] hover:bg-[#2c3338] hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
