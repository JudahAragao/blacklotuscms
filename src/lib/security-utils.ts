import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes slugs and directory names to prevent Path Traversal.
 */
export function sanitizePath(path: string): string {
  // Remove .. , / and \
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
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html);
}
