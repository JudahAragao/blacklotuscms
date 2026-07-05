/**
 * Gera um slug a partir de uma string.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')                   // Decompõe caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '')    // Remove acentos
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')               // Substitui espaços por hifens
    .replace(/[^\w-]+/g, '')            // Remove caracteres não alfanuméricos exceto hifens
    .replace(/--+/g, '-');              // Remove hifens duplicados
}

/**
 * Sanitiza o nome de um arquivo para armazenamento seguro.
 */
export function sanitizeFilename(filename: string): string {
  const parts = filename.split('.');
  const ext = parts.pop() || '';
  const name = parts.join('.');
  
  return `${slugify(name)}.${ext.toLowerCase()}`;
}
