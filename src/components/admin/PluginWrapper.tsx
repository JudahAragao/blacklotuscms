'use client';

import React from 'react';

interface PluginWrapperProps {
  pluginName: string;
  componentPath: string; // Caminho para o assets/widget.js do plugin
  title?: string;
}

/**
 * Componente de isolamento de UI para Plugins.
 * Utiliza um Iframe com o atributo 'sandbox' para impedir que o plugin 
 * acesse o DOM do administrador, cookies ou localStorage do CMS.
 */
export const PluginWrapper: React.FC<PluginWrapperProps> = ({ 
  pluginName, 
  componentPath,
  title 
}) => {
  // O sandbox="allow-scripts" permite execução de JS, mas sem "allow-same-origin"
  // o plugin não consegue acessar nada do domínio principal do CMS.
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      {title && (
        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">{title}</span>
          <span className="text-[10px] uppercase tracking-wider text-gray-400">Plugin: {pluginName}</span>
        </div>
      )}
      <div className="relative w-full h-[300px]">
        <iframe
          src={`/plugins/${pluginName}/${componentPath}`}
          title={`Plugin Widget: ${pluginName}`}
          className="w-full h-full border-none"
          sandbox="allow-scripts" 
          loading="lazy"
        />
      </div>
    </div>
  );
};
