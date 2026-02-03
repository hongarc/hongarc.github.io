import type { ParsedQRBase, QRTypeStrategy } from '../types';

interface ParsedURL extends ParsedQRBase {
  type: 'url';
  url: string;
}

export const urlStrategy: QRTypeStrategy<ParsedURL> = {
  type: 'url',
  label: 'URL',
  badge: { bg: 'bg-ctp-sapphire/20', text: 'text-ctp-sapphire' },

  canParse: (content) => {
    try {
      const url = new URL(content);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  },

  parse: (content) => ({
    type: 'url',
    url: content,
    raw: content,
  }),

  render: (parsed) => ({
    rows: [{ label: 'URL', value: parsed.url, link: true, copyable: true }],
    action: {
      label: 'Open Link',
      href: parsed.url,
      external: true,
      color: 'ctp-sapphire',
    },
  }),
};
