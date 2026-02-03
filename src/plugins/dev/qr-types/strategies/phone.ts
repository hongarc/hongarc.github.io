import type { ParsedQRBase, QRTypeStrategy } from '../types';

interface ParsedPhone extends ParsedQRBase {
  type: 'phone';
  number: string;
}

export const phoneStrategy: QRTypeStrategy<ParsedPhone> = {
  type: 'phone',
  label: 'Phone',
  badge: { bg: 'bg-ctp-teal/20', text: 'text-ctp-teal' },

  canParse: (content) => content.toLowerCase().startsWith('tel:'),

  parse: (content) => ({
    type: 'phone',
    number: content.slice(4),
    raw: content,
  }),

  render: (parsed) => ({
    rows: [{ label: 'Number', value: parsed.number, copyable: true }],
    action: {
      label: 'Call',
      href: `tel:${parsed.number}`,
      color: 'ctp-teal',
    },
  }),
};
