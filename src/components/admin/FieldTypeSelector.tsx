'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Type, Hash, Mail, AlignLeft, Code2, Image, FileImage, File,
  CheckSquare, List, ToggleLeft, Columns, Minus, LayoutGrid,
  Repeat, Layers, ChevronDown, ChevronUp, Search
} from 'lucide-react';

interface FieldTypeInfo {
  type: string;
  label: string;
  icon: React.ReactNode;
  category: string;
  description: string;
}

const FIELD_TYPES: FieldTypeInfo[] = [
  // Básicos
  { type: 'text', label: 'Texto', icon: <Type size={16} />, category: 'Básicos', description: 'Campo de texto simples' },
  { type: 'number', label: 'Número', icon: <Hash size={16} />, category: 'Básicos', description: 'Campo numérico' },
  { type: 'email', label: 'Email', icon: <Mail size={16} />, category: 'Básicos', description: 'Campo de email' },
  { type: 'textarea', label: 'Texto Longo', icon: <AlignLeft size={16} />, category: 'Básicos', description: 'Área de texto' },
  // Conteúdo
  { type: 'wysiwyg', label: 'Editor Rico', icon: <Code2 size={16} />, category: 'Conteúdo', description: 'Editor de texto avançado' },
  { type: 'json', label: 'JSON', icon: <Code2 size={16} />, category: 'Conteúdo', description: 'Dados JSON brutos' },
  // Seleção
  { type: 'select', label: 'Seleção', icon: <List size={16} />, category: 'Seleção', description: 'Dropdown de opções' },
  { type: 'boolean', label: 'Booleano', icon: <ToggleLeft size={16} />, category: 'Seleção', description: 'Checkbox Sim/Não' },
  // Mídia
  { type: 'image', label: 'Imagem', icon: <Image size={16} />, category: 'Mídia', description: 'Upload de imagem' },
  { type: 'gallery', label: 'Galeria', icon: <FileImage size={16} />, category: 'Mídia', description: 'Múltiplas imagens' },
  { type: 'file', label: 'Arquivo', icon: <File size={16} />, category: 'Mídia', description: 'Upload de arquivo' },
  // Visual
  { type: 'icon', label: 'Ícone', icon: <LayoutGrid size={16} />, category: 'Visual', description: 'Seletor de ícones (lib ou SVG customizado)' },
  // Organização
  { type: 'tab', label: 'Aba', icon: <Columns size={16} />, category: 'Organização', description: 'Separador em abas' },
  { type: 'section', label: 'Seção', icon: <Minus size={16} />, category: 'Organização', description: 'Divisor visual' },
  // Estruturais
  { type: 'repeater', label: 'Repetidor', icon: <Repeat size={16} />, category: 'Estruturais', description: 'Lista de sub-campos' },
  { type: 'flexible_content', label: 'Conteúdo Flexível', icon: <LayoutGrid size={16} />, category: 'Estruturais', description: 'Layouts dinâmicos' },
];

interface FieldTypeSelectorProps {
  value: string;
  onChange: (type: string) => void;
  compact?: boolean;
}

export default function FieldTypeSelector({ value, onChange, compact }: FieldTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0, openUp: false });
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selected = FIELD_TYPES.find(t => t.type === value);

  const categories = [...new Set(FIELD_TYPES.map(t => t.category))];

  const filteredTypes = search
    ? FIELD_TYPES.filter(t =>
        t.label.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.type.toLowerCase().includes(search.toLowerCase())
      )
    : FIELD_TYPES;

  const groupedTypes = categories.reduce((acc, cat) => {
    acc[cat] = filteredTypes.filter(t => t.category === cat);
    return acc;
  }, {} as Record<string, FieldTypeInfo[]>);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 320; // approximate height
    const spaceBelow = viewportHeight - rect.bottom;
    const openUp = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

    setDropdownPos({
      top: openUp ? rect.top - dropdownHeight - 4 : rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      openUp,
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current && !triggerRef.current.contains(target)) {
        const dropdown = document.getElementById('field-type-selector-dropdown');
        if (dropdown && !dropdown.contains(target)) {
          setIsOpen(false);
          setSearch('');
        }
      }
    };

    const handleScroll = () => {
      if (isOpen) calculatePosition();
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen, calculatePosition]);

  useEffect(() => {
    if (isOpen) calculatePosition();
  }, [isOpen, calculatePosition]);

  const handleSelect = (type: string) => {
    onChange(type);
    setIsOpen(false);
    setSearch('');
  };

  const toggleOpen = () => {
    if (!isOpen) calculatePosition();
    setIsOpen(!isOpen);
    if (isOpen) setSearch('');
  };

  const renderDropdownContent = () => (
    <>
      <div className="p-2 border-b border-border-default">
        <div className="relative">
          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 bg-surface-muted border border-border-default rounded text-xs text-text-heading placeholder:text-text-muted focus:outline-none focus:border-action"
            placeholder="Buscar tipo..."
            autoFocus
          />
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto custom-scrollbar">
        {search ? (
          filteredTypes.length > 0 ? (
            filteredTypes.map(field => (
              <button
                key={field.type}
                onClick={() => handleSelect(field.type)}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-action-light/30 text-left transition-colors"
              >
                <span className="text-action">{field.icon}</span>
                <div>
                  <div className="text-xs font-medium text-text-heading">{field.label}</div>
                  <div className="text-[10px] text-text-muted">{field.description}</div>
                </div>
              </button>
            ))
          ) : (
            <div className="px-3 py-4 text-xs text-text-muted text-center">Nenhum tipo encontrado</div>
          )
        ) : (
          categories.map(cat => {
            const items = groupedTypes[cat];
            if (!items || items.length === 0) return null;
            return (
              <div key={cat}>
                <button
                  onClick={() => setExpandedCategory(expandedCategory === cat ? null : cat)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider hover:bg-surface-muted"
                >
                  <span>{cat}</span>
                  {expandedCategory === cat ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                </button>
                {(expandedCategory === cat || expandedCategory === null) && items.map(field => (
                  <button
                    key={field.type}
                    onClick={() => handleSelect(field.type)}
                    className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-action-light/30 text-left transition-colors ${
                      value === field.type ? 'bg-action-light/20 border-l-2 border-action' : ''
                    }`}
                  >
                    <span className="text-action">{field.icon}</span>
                    <div>
                      <div className="text-xs font-medium text-text-heading">{field.label}</div>
                      <div className="text-[10px] text-text-muted">{field.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            );
          })
        )}
      </div>
    </>
  );

  if (compact) {
    return (
      <div className="relative inline-block">
        <button
          ref={triggerRef}
          onClick={toggleOpen}
          className="flex items-center gap-2 px-3 py-1.5 rounded border border-border-default bg-surface-muted hover:bg-surface-card text-xs text-text-heading transition-colors"
        >
          {selected?.icon}
          <span>{selected?.label || 'Selecione...'}</span>
          {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {isOpen && (
          <div
            id="field-type-selector-dropdown"
            className="fixed z-[9999] bg-surface-card border border-border-default rounded-lg shadow-xl overflow-hidden"
            style={{
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: 288,
            }}
          >
            {renderDropdownContent()}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={toggleOpen}
        className="field-select w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          {selected?.icon}
          <span>{selected?.label || 'Selecione o tipo...'}</span>
        </div>
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {isOpen && (
        <div
          id="field-type-selector-dropdown"
          className="fixed z-[9999] bg-surface-card border border-border-default rounded-lg shadow-xl overflow-hidden"
          style={{
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width,
          }}
        >
          {renderDropdownContent()}
        </div>
      )}
    </div>
  );
}
