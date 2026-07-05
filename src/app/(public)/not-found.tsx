import React from 'react';
import ThemeRenderer from '@/components/ThemeRenderer';
import { ThemeService } from '@/core/services/ThemeService';

export default async function PublicNotFound() {
  const themeName = await ThemeService.getActiveTheme();
  
  return (
    <ThemeRenderer 
      context="404" 
      data={{ 
        title: 'Página Não Encontrada',
        message: 'O conteúdo que você busca não está disponível neste endereço.' 
      }} 
    />
  );
}
