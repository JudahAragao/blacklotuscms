/**
 * Sanitizes slugs and directory names to prevent Path Traversal.
 */
export function sanitizePath(path: string): string {
  return path.replace(/\.\./g, '').replace(/[/\\]/g, '').trim();
}

/**
 * Removes sensitive fields from data objects before passing them to Themes or APIs.
 */
export function maskSensitiveData(data: any): any {
  if (!data) return data;
  if (Array.isArray(data)) return data.map(maskSensitiveData);

  if (typeof data === 'object') {
    const forbiddenFields = [
      'passwordHash', 'password', 'password_hash', 'hashedPassword',
      'secret', 'apiKey', 'api_key', 'token', 'email',
      'recoveryToken', 'resetToken', 'salt', 'sessionToken',
      'access_token', 'refresh_token', 'providerAccountId'
    ];
    const sanitized = { ...data };

    for (const key in sanitized) {
      if (forbiddenFields.includes(key)) {
        delete sanitized[key];
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = maskSensitiveData(sanitized[key]);
      }
    }
    return sanitized;
  }
  return data;
}

/**
 * Sanitizes HTML to prevent XSS.
 */
import { purify } from './dompurify-server';

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'b', 'i', 'em', 'strong', 'a', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'br', 'hr', 'img', 'blockquote', 'code', 'pre', 'span', 'div', 'iframe'
  ],
  ALLOWED_ATTR: ['href', 'title', 'target', 'src', 'alt', 'class', 'id', 'width', 'height', 'frameborder', 'allowfullscreen']
};

export async function sanitizeHtml(html: string): Promise<string> {
  return purify(html, SANITIZE_CONFIG);
}
