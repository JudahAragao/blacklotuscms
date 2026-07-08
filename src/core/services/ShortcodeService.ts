import { sanitizeHTML } from '@/lib/sanitize';
import { logger } from '@/lib/logger';

export type ShortcodeHandler = (attributes: Record<string, string>, content?: string) => string | Promise<string>;

export class ShortcodeService {
  private registry: Map<string, ShortcodeHandler> = new Map();

  constructor(private readonly log = logger) {}

  register(tag: string, handler: ShortcodeHandler) {
    this.registry.set(tag, handler);
  }

  /**
   * Processes and sanitizes content with shortcodes.
   */
  async parse(content: string): Promise<string> {
    if (!content) return '';
    
    let result = content;
    const regex = /\[(\w+)\s*([^\]]*?)\](?:(.*?)\[\/\1\])?/g;
    const matches = Array.from(content.matchAll(regex));

    for (const match of matches) {
      const [fullMatch, tag, attrString, innerContent] = match;
      const handler = this.registry.get(tag);

      if (handler) {
        const attributes: Record<string, string> = {};
        const attrRegex = /(\w+)="([^"]*)"/g;
        let attrMatch;
        while ((attrMatch = attrRegex.exec(attrString)) !== null) {
          attributes[attrMatch[1]] = attrMatch[2];
        }

        try {
          const replacement = await handler(attributes, innerContent);
          result = result.replace(fullMatch, await sanitizeHTML(replacement));
        } catch (err) {
          this.log.error(`Failed to process shortcode: [${tag}]`, { err });
        }
      }
    }

    return result;
  }

  // --- Static Proxy ---
  static register(tag: string, handler: ShortcodeHandler) { shortcodeService.register(tag, handler); }
  static async parse(content: string) { return shortcodeService.parse(content); }
}

export const shortcodeService = new ShortcodeService();

/**
 * Native Shortcodes Registration
 */
shortcodeService.register('button', (attrs, content) => {
  return `<a href="${attrs.url || '#'}" class="btn-shortcode">${content || 'Click here'}</a>`;
});

shortcodeService.register('youtube', (attrs) => {
  return `<div class="video-container"><iframe src="https://www.youtube.com/embed/${attrs.id}" frameborder="0" allowfullscreen></iframe></div>`;
});
