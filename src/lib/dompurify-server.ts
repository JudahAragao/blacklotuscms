import { parseHTML } from 'linkedom';

const IFRAME_ALLOWED_DOMAINS = [
  'youtube.com',
  'www.youtube.com',
  'youtu.be',
  'vimeo.com',
  'player.vimeo.com',
  'google.com',
  'www.google.com',
  'maps.google.com',
  'docs.google.com',
  'drive.google.com',
  'spotify.com',
  'open.spotify.com',
  'codepen.io',
  'codesandbox.io',
];

function isAllowedIframeDomain(src: string): boolean {
  try {
    const url = new URL(src);
    return IFRAME_ALLOWED_DOMAINS.some(
      (domain) => url.hostname === domain || url.hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}

let cached: any = null;

async function getDOMPurify() {
  if (cached) return cached;
  const DOMPurify = await import('dompurify').then((m: any) => m.default || m);
  const { window } = parseHTML('');
  cached = DOMPurify(window);

  cached.addHook('afterSanitizeAttributes', (node: any) => {
    if (node.tagName === 'IFRAME') {
      const src = node.getAttribute('src');
      if (src && !isAllowedIframeDomain(src)) {
        node.parentNode?.removeChild(node);
      }
    }
  });

  return cached;
}

export async function purify(html: string, config?: any): Promise<string> {
  const dp = await getDOMPurify();
  return dp.sanitize(html, config);
}
