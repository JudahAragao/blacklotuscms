import { describe, it, expect } from 'vitest';
import { sanitizePath, maskSensitiveData, sanitizeHtml } from './security-utils';

describe('sanitizePath', () => {
  it('should remove path traversal attempts', () => {
    expect(sanitizePath('../../../etc/passwd')).toBe('etcpasswd');
    expect(sanitizePath('..\\..\\windows\\system32')).toBe('windowssystem32');
  });

  it('should remove slashes', () => {
    expect(sanitizePath('path/to/file')).toBe('pathtofile');
    expect(sanitizePath('path\\to\\file')).toBe('pathtofile');
  });

  it('should trim whitespace', () => {
    expect(sanitizePath('  valid-name  ')).toBe('valid-name');
  });

  it('should preserve valid paths', () => {
    expect(sanitizePath('valid-name')).toBe('valid-name');
    expect(sanitizePath('theme123')).toBe('theme123');
  });
});

describe('maskSensitiveData', () => {
  it('should remove passwordHash', () => {
    const data = { name: 'John', passwordHash: 'abc123' };
    const result = maskSensitiveData(data);
    expect(result.name).toBe('John');
    expect(result.passwordHash).toBeUndefined();
  });

  it('should remove secret and token', () => {
    const data = { secret: 's3cret', token: 'tok123', api_key: 'key' };
    const result = maskSensitiveData(data);
    expect(result.secret).toBeUndefined();
    expect(result.token).toBeUndefined();
    expect(result.api_key).toBeUndefined();
  });

  it('should handle nested objects', () => {
    const data = {
      user: { name: 'John', passwordHash: 'abc' },
      settings: { secret: 's3cret' },
    };
    const result = maskSensitiveData(data);
    expect(result.user.name).toBe('John');
    expect(result.user.passwordHash).toBeUndefined();
    expect(result.settings.secret).toBeUndefined();
  });

  it('should handle arrays', () => {
    const data = [{ passwordHash: 'abc' }, { token: 'xyz' }];
    const result = maskSensitiveData(data);
    expect(result[0].passwordHash).toBeUndefined();
    expect(result[1].token).toBeUndefined();
  });

  it('should handle null and undefined', () => {
    expect(maskSensitiveData(null)).toBeNull();
    expect(maskSensitiveData(undefined)).toBeUndefined();
  });
});

describe('sanitizeHtml', () => {
  it('should sanitize dangerous tags', () => {
    const html = '<script>alert("xss")</script><b>Safe</b>';
    const result = sanitizeHtml(html);
    expect(result).not.toContain('<script>');
    expect(result).toContain('<b>');
  });

  it('should allow safe tags', () => {
    const html = '<p>Hello <b>World</b></p>';
    const result = sanitizeHtml(html);
    expect(result).toContain('<p>');
    expect(result).toContain('<b>');
  });
});
