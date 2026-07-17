import { parseHTML } from 'linkedom';

let cached: any = null;

async function getDOMPurify() {
  if (cached) return cached;
  const mod = await import('dompurify');
  const factory = (mod as any).createDOMPurify || mod.default?.createDOMPurify;
  if (!factory) throw new Error('dompurify: createDOMPurify not found');
  const { window } = parseHTML('');
  cached = factory(window);
  return cached;
}

export async function purify(html: string, config?: any): Promise<string> {
  const dp = await getDOMPurify();
  return dp.sanitize(html, config);
}
