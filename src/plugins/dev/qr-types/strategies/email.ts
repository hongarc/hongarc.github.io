import type { ParsedQRBase, QRTypeStrategy } from '../types';

interface ParsedEmail extends ParsedQRBase {
  type: 'email';
  to: string;
  subject: string | null;
  body: string | null;
}

export const emailStrategy: QRTypeStrategy<ParsedEmail> = {
  type: 'email',
  label: 'Email',
  badge: { bg: 'bg-ctp-mauve/20', text: 'text-ctp-mauve' },

  canParse: (content) =>
    content.toLowerCase().startsWith('mailto:') || content.startsWith('MATMSG:'),

  parse: (content) => {
    // mailto: format
    if (content.toLowerCase().startsWith('mailto:')) {
      try {
        const url = new URL(content);
        const params = new URLSearchParams(url.search);
        return {
          type: 'email',
          to: url.pathname,
          subject: params.get('subject'),
          body: params.get('body'),
          raw: content,
        };
      } catch {
        return null;
      }
    }

    // MATMSG: format
    if (content.startsWith('MATMSG:')) {
      const params: Record<string, string> = {};
      const data = content.slice(7).replace(/;;$/, '');
      for (const part of data.split(';')) {
        const colonIndex = part.indexOf(':');
        if (colonIndex > 0) {
          params[part.slice(0, colonIndex)] = part.slice(colonIndex + 1);
        }
      }
      if (params.TO) {
        return {
          type: 'email',
          to: params.TO,
          subject: params.SUB ?? null,
          body: params.BODY ?? null,
          raw: content,
        };
      }
    }

    return null;
  },

  render: (parsed) => {
    const mailtoLink = `mailto:${parsed.to}${parsed.subject ? `?subject=${encodeURIComponent(parsed.subject)}` : ''}`;

    return {
      rows: [
        { label: 'To', value: parsed.to, copyable: true },
        ...(parsed.subject ? [{ label: 'Subject', value: parsed.subject }] : []),
        ...(parsed.body ? [{ label: 'Body', value: parsed.body }] : []),
      ],
      action: {
        label: 'Compose Email',
        href: mailtoLink,
        color: 'ctp-mauve',
      },
    };
  },
};
