import type { ParsedQRBase, QRTypeStrategy } from '../types';

interface ParsedText extends ParsedQRBase {
  type: 'text';
}

export const textStrategy: QRTypeStrategy<ParsedText> = {
  type: 'text',
  label: 'Text',
  badge: { bg: 'bg-ctp-overlay0/20', text: 'text-ctp-overlay0' },

  // Always matches as fallback
  canParse: () => true,

  parse: (content) => ({
    type: 'text',
    raw: content,
  }),

  render: (parsed) => ({
    rows: [{ label: 'Content', value: parsed.raw, copyable: true }],
  }),
};
