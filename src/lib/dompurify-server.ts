import { parseHTML } from 'linkedom';

let cached: any = null;

async function getDOMPurify() {
  if (cached) return cached;
  const DOMPurify = await import('dompurify').then(m => m.default || m);
  const { window } = parseHTML('');
  cached = DOMPurify(window as any);
  return cached;
}

export async function purify(html: string, config?: any): Promise<string> {
  const dp = await getDOMPurify();
  return dp.sanitize(html, config);
}
