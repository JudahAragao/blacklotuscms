'use client';

import React from 'react';
import { HookService } from '@/core/services/HookService';

interface BlackLotusCMSSlotProps {
  name: string;
  data?: any;
}

class PluginErrorBoundary extends React.Component<{ source: string, children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-2 border border-error/20 bg-error/5 text-[9px] text-error label-caps">
          Plugin Error: {this.props.source}
        </div>
      );
    }
    return this.props.children;
  }
}

export default function BlackLotusCMSSlot({ name, data }: BlackLotusCMSSlotProps) {
  const components = HookService.getComponents(name);

  if (components.length === 0) return null;

  return (
    <div className="bl-slot-container flex flex-col gap-2">
      {components.map((entry, idx) => (
        <PluginErrorBoundary key={`${name}-${idx}-${entry.source}`} source={entry.source}>
          <div 
            className={`bl-plugin bl-plugin-${entry.source.replace(/[^a-z0-9]/gi, '-')}`}
            data-bl-plugin={entry.source}
          >
            {typeof entry.Component === 'function' ? (
               <entry.Component data={data} />
            ) : (
               entry.Component
            )}
          </div>
        </PluginErrorBoundary>
      ))}
    </div>
  );
}
