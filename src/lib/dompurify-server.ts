import { parseHTML } from 'linkedom';

let cached: any = null;

async function getDOMPurify() {
  if (cached) return cached;
  const { default: DOMPurify } = await import('dompurify');
  const { window } = parseHTML('');
  cached = DOMPurify.createDOMPurify(window as any);
  return cached;
}

export async function purify(html: string, config?: any): Promise<string> {
  const dp = await getDOMPurify();
  return dp.sanitize(html, config);
}
