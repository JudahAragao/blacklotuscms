'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { Search, X } from 'lucide-react';

const PAGE_SIZE = 100;

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  source?: 'lucide' | 'custom';
  onSourceChange?: (source: 'lucide' | 'custom') => void;
  customSvg?: string;
  onCustomSvgChange?: (svg: string) => void;
}

// Get all icon names from lucide-react
const ALL_ICONS = Object.keys(LucideIcons)
  .filter(
    (key) => key !== 'default' && key !== 'icons' && typeof (LucideIcons as any)[key] === 'object'
  )
  .sort();

const ICON_CATEGORIES: Record<string, string[]> = {
  'Arrows': ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ChevronUp', 'ChevronDown', 'ChevronLeft', 'ChevronRight', 'Move', 'RotateCw', 'RefreshCw'],
  'Business': ['Briefcase', 'Building', 'Building2', 'Calculator', 'Calendar', 'ChartBar', 'ChartPie', 'Clipboard', 'Clock', 'Coins', 'DollarSign', 'FileText', 'Folder', 'FolderOpen', 'HardHat', 'Layers', 'LineChart', 'Lock', 'PieChart', 'Presenter', 'StickyNote', 'Target', 'TrendingUp', 'Wallet', 'Workflow'],
  'Communication': ['AtSign', 'Bell', 'BellOff', 'Mail', 'MailOpen', 'MessageCircle', 'MessageSquare', 'Phone', 'PhoneCall', 'Send', 'Share', 'Share2', 'Sms', 'Video', 'Voicemail'],
  'Design': ['Aperture', 'Artboard', 'Badge', 'Brush', 'Bucket', 'Circle', 'CircleDot', 'Code', 'Code2', 'Component', 'Contrast', 'Droplet', 'Eye', 'EyeOff', 'Fill', 'FlipHorizontal', 'FlipVertical', 'Frame', 'Grid', 'Hash', 'Hexagon', 'Image', 'Layers', 'Layout', 'LayoutDashboard', 'LayoutGrid', 'LayoutList', 'Legend', 'Palette', 'Pipette', 'Pencil', 'PenTool', 'Ruler', 'Scissors', 'Shape', 'Smile', 'Square', 'Star', 'Sun', 'Moon', 'Tablet', 'Triangle', 'Type', 'Underline', 'Zap'],
  'Files': ['File', 'FileArchive', 'FileAudio', 'FileCode', 'FileCsv', 'FileDigit', 'FileImage', 'FileJson', 'FileKey', 'FileMinus', 'FilePlus', 'FileSearch', 'FileText', 'FileVideo', 'FileWarning', 'FileX', 'Files', 'Folder', 'FolderMinus', 'FolderOpen', 'FolderPlus', 'Import', 'Inbox', 'Paperclip', 'Save', 'Upload'],
  'Interfaces': ['Accessibility', 'AlertCircle', 'AlertTriangle', 'Anchor', 'Award', 'BadgeCheck', 'Ban', 'Block', 'BookOpen', 'Bookmark', 'BookMarked', 'Broadcast', 'Browser', 'Calendar', 'Check', 'CheckCircle', 'CheckSquare', 'Circle', 'Clock', 'Command', 'Compass', 'Copy', 'CreditCard', 'Crosshair', 'Database', 'Download', 'ExternalLink', 'FileWarning', 'Filter', 'Flag', 'Gift', 'Globe', 'Grid', 'Hash', 'Heart', 'HelpCircle', 'Home', 'Info', 'Key', 'Keyboard', 'Link', 'List', 'Loader', 'Lock', 'LogIn', 'LogOut', 'Maximize', 'Menu', 'MessageCircle', 'Minimize', 'MoreHorizontal', 'MoreVertical', 'MousePointer', 'Navigation', 'Notification', 'Package', 'Paperclip', 'Percent', 'Pin', 'Power', 'Printer', 'Puzzle', 'QRCode', 'Radio', 'RefreshCcw', 'RefreshCw', 'RotateCcw', 'Save', 'Scan', 'Search', 'Send', 'Settings', 'Share', 'Shield', 'ShoppingBag', 'ShoppingCart', 'Signal', 'Sliders', 'Smartphone', 'Speaker', 'Square', 'Star', 'Sun', 'Sunrise', 'Sunset', 'Tag', 'Terminal', 'Thermometer', 'ThumbDown', 'ThumbUp', 'ToggleLeft', 'ToggleRight', 'Tool', 'Trash', 'TrendingDown', 'TrendingUp', 'Truck', 'Tv', 'Undo', 'Unlock', 'Upload', 'User', 'Users', 'Variable', 'Video', 'Volume', 'VolumeX', 'Wallet', 'Watch', 'Wifi', 'WifiOff', 'Wrench', 'X', 'XCircle', 'XSquare', 'Zap', 'ZoomIn', 'ZoomOut'],
  'Media': ['Airplay', 'Camera', 'Film', 'Headphones', 'Image', 'Mic', 'MicOff', 'Music', 'Pause', 'Play', 'PlayCircle', 'Podcast', 'Radio', 'Record', 'SkipBack', 'SkipForward', 'Square', 'StopCircle', 'Video', 'Volume', 'Volume1', 'Volume2', 'VolumeX'],
  'Nature': ['Cloud', 'CloudRain', 'CloudSnow', 'CloudLightning', 'Droplets', 'Feather', 'Flame', 'Flower', 'Flower2', 'Globe', 'Leaf', 'Mountain', 'Sun', 'Sunrise', 'Sunset', 'Thermometer', 'Tornado', 'Tree', 'Umbrella', 'Wind'],
  'Objects': ['Anchor', 'Award', 'Baby', 'Backpack', 'Balloon', 'Barrel', 'Battery', 'Bike', 'Bomb', 'Book', 'Box', 'Brush', 'Bus', 'Cable', 'Car', 'Castle', 'Chip', 'Circle', 'Coffee', 'Compass', 'Cookie', 'Crown', 'Cube', 'Diamond', 'Disc', 'Feather', 'Flag', 'Flame', 'Gem', 'Gift', 'Glasses', 'Globe', 'GraduationCap', 'Hammer', 'Hat', 'Heart', 'Key', 'Knife', 'Lamp', 'LifeBuoy', 'Lightbulb', 'Lock', 'Luggage', 'Map', 'Medal', 'Megaphone', 'Mic', 'Moon', 'Mountain', 'Mug', 'Music', 'Package', 'Palmtree', 'Paperclip', 'Pencil', 'Pet', 'Pizza', 'Plane', 'Plug', 'Pointer', 'Puzzle', 'Rock', 'Rose', 'Ruler', 'Sailboat', 'Scissors', 'Shirt', 'Shoe', 'Skull', 'Smartphone', 'Snowflake', 'Sofa', 'Spaceship', 'Speaker', 'Speedometer', 'Square', 'Stamp', 'Star', 'Stopwatch', 'Sun', 'Syringe', 'Tent', 'Torch', 'Toy', 'TrafficCone', 'Train', 'Tree', 'Trophy', 'Truck', 'Turtle', 'Umbrella', 'Vase', 'Watch', 'Waves', 'Wheel', 'Wrench'],
};

export default function IconPicker({
  value,
  onChange,
  source = 'lucide',
  onSourceChange,
  customSvg = '',
  onCustomSvgChange,
}: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, activeCategory]);

  const filteredIcons = useMemo(() => {
    if (!search) {
      if (activeCategory) {
        return (ICON_CATEGORIES[activeCategory] || []).filter(name => ALL_ICONS.includes(name));
      }
      return ALL_ICONS;
    }
    return ALL_ICONS.filter(name =>
      name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, activeCategory]);

  const visibleIcons = useMemo(() => {
    return filteredIcons.slice(0, visibleCount);
  }, [filteredIcons, visibleCount]);

  const hasMore = filteredIcons.length > visibleCount;

  const loadMore = useCallback(() => {
    setVisibleCount(prev => prev + PAGE_SIZE);
  }, []);

  const categories = Object.keys(ICON_CATEGORIES);

  const renderIconPreview = (iconName: string, size = 20) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (!IconComponent) return null;
    return <IconComponent size={size} />;
  };

  const handleOpen = () => {
    setIsOpen(true);
    setSearch('');
    setActiveCategory(null);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <div className="relative">
      {/* Source selector */}
      {onSourceChange && (
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => onSourceChange('lucide')}
            className={`px-3 py-1 text-[10px] rounded transition-colors ${
              source === 'lucide'
                ? 'bg-action text-white'
                : 'bg-surface-muted text-text-muted hover:text-text-heading'
            }`}
          >
            Lib de Ícones
          </button>
          <button
            type="button"
            onClick={() => onSourceChange('custom')}
            className={`px-3 py-1 text-[10px] rounded transition-colors ${
              source === 'custom'
                ? 'bg-action text-white'
                : 'bg-surface-muted text-text-muted hover:text-text-heading'
            }`}
          >
            SVG Customizado
          </button>
        </div>
      )}

      {source === 'lucide' ? (
        <>
          {/* Trigger button */}
          <button
            type="button"
            onClick={() => isOpen ? setIsOpen(false) : handleOpen()}
            className="w-full flex items-center gap-2 p-2 border border-border-default rounded bg-surface-card hover:border-action transition-colors"
          >
            {value ? (
              <span className="flex items-center gap-2 text-xs text-text-heading">
                {renderIconPreview(value)}
                {value}
              </span>
            ) : (
              <span className="text-xs text-text-muted">Selecionar ícone...</span>
            )}
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-surface-card border border-border-default rounded shadow-lg max-h-80 overflow-hidden">
              {/* Search */}
              <div className="p-2 border-b border-border-default">
                <div className="relative">
                  <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar ícone..."
                    className="w-full pl-6 pr-2 py-1.5 text-xs text-text-heading border border-border-default rounded focus:border-action focus:outline-none"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-heading"
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
              </div>

              {/* Categories */}
              <div className="flex gap-1 p-2 border-b border-border-default overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveCategory(null)}
                  className={`px-2 py-0.5 text-[9px] rounded whitespace-nowrap transition-colors ${
                    !activeCategory
                      ? 'bg-action text-white'
                      : 'bg-surface-muted text-text-muted hover:text-text-heading'
                  }`}
                >
                  Todos
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2 py-0.5 text-[9px] rounded whitespace-nowrap transition-colors ${
                      activeCategory === cat
                        ? 'bg-action text-white'
                        : 'bg-surface-muted text-text-muted hover:text-text-heading'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Icons grid */}
              <div ref={scrollRef} className="p-2 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-8 gap-1">
                  {visibleIcons.map(iconName => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => {
                        onChange(iconName);
                        setIsOpen(false);
                      }}
                      className={`p-1.5 rounded hover:bg-action-light transition-colors ${
                        value === iconName ? 'bg-action-light text-action' : 'text-text-muted hover:text-text-heading'
                      }`}
                      title={iconName}
                    >
                      {renderIconPreview(iconName, 16)}
                    </button>
                  ))}
                </div>
                {filteredIcons.length === 0 && (
                  <p className="text-center text-xs text-text-muted py-4">
                    Nenhum ícone encontrado
                  </p>
                )}
                {hasMore && (
                  <button
                    type="button"
                    onClick={loadMore}
                    className="w-full mt-2 py-1.5 text-[10px] text-text-muted hover:text-text-heading border border-border-default rounded transition-colors"
                  >
                    Carregar mais ({filteredIcons.length - visibleCount} restantes)
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Custom SVG input */
        <div className="space-y-2">
          <textarea
            value={customSvg}
            onChange={(e) => onCustomSvgChange?.(e.target.value)}
            placeholder='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>'
            className="w-full p-2 text-[10px] font-mono text-text-heading border border-border-default rounded bg-surface-card focus:border-action focus:outline-none h-24 resize-none"
          />
          {customSvg && (
            <div className="p-2 border border-border-default rounded bg-surface-muted">
              <p className="text-[9px] text-text-muted mb-1">Preview:</p>
              <div
                className="w-8 h-8 flex items-center justify-center text-text-heading"
                dangerouslySetInnerHTML={{ __html: customSvg }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
