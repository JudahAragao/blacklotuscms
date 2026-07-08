/**
 * Sanitizes HTML strings to prevent XSS attacks.
 * Essential for content coming from Plugins, Shortcodes, or Editors.
 * Lazy-loaded to avoid jsdom issues during Docker builds.
 */
export async function sanitizeHTML(html: string): Promise<string> {
  const { default: DOMPurify } = await import('isomorphic-dompurify');
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'br', 'hr', 'img', 'blockquote', 'code', 'pre', 'span', 'div', 'iframe'
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'src', 'alt', 'class', 'id', 'width', 'height', 'frameborder', 'allowfullscreen']
  }) as string;
}
