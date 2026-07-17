'use client';

import React, { useState, useEffect } from 'react';
import IconPicker from '@/components/admin/IconPicker';
import { renderPostTypeIcon } from '@/lib/icon-utils';

interface PostTypeIconEditorProps {
  name: string;
  defaultValue?: {
    iconName?: string;
    iconSource?: string;
    iconSvg?: string;
  } | null;
}

export default function PostTypeIconEditor({ name, defaultValue }: PostTypeIconEditorProps) {
  const [iconData, setIconData] = useState<{
    iconName: string;
    iconSource: 'lucide' | 'custom';
    iconSvg: string;
  }>({
    iconName: defaultValue?.iconName || '',
    iconSource: (defaultValue?.iconSource as 'lucide' | 'custom') || 'lucide',
    iconSvg: defaultValue?.iconSvg || '',
  });

  const [hiddenInput, setHiddenInput] = useState('');

  useEffect(() => {
    setHiddenInput(JSON.stringify(iconData));
  }, [iconData]);

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={hiddenInput} />
      
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <IconPicker
            value={iconData.iconName}
            onChange={(iconName) => setIconData(prev => ({ ...prev, iconName, iconSource: 'lucide' }))}
            source={iconData.iconSource}
            onSourceChange={(source) => setIconData(prev => ({ ...prev, iconSource: source }))}
            customSvg={iconData.iconSvg}
            onCustomSvgChange={(svg) => setIconData(prev => ({ ...prev, iconSvg: svg }))}
          />
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-text-muted">Preview</span>
          <div className="w-10 h-10 rounded bg-surface-muted border border-border-default flex items-center justify-center text-text-heading">
            {renderPostTypeIcon({ icon: iconData }, 20)}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIconData({ iconName: '', iconSource: 'lucide', iconSvg: '' })}
        className="text-xs text-text-muted hover:text-status-trash transition-colors"
      >
        Remover icone (usar padrao)
      </button>
    </div>
  );
}
