import type { ParsedQRBase, QRTypeStrategy } from '../types';

interface ParsedSMS extends ParsedQRBase {
  type: 'sms';
  number: string;
  message: string | null;
}

export const smsStrategy: QRTypeStrategy<ParsedSMS> = {
  type: 'sms',
  label: 'SMS',
  badge: { bg: 'bg-ctp-sky/20', text: 'text-ctp-sky' },

  canParse: (content) => {
    const lower = content.toLowerCase();
    return lower.startsWith('sms:') || lower.startsWith('smsto:');
  },

  parse: (content) => {
    const lower = content.toLowerCase();
    const prefix = lower.startsWith('smsto:') ? 6 : 4;
    const parts = content.slice(prefix).split(':');
    const numberPart = parts[0] ?? '';

    // Handle ?body= format
    const splitParts = numberPart.split('?');
    const number = splitParts[0] ?? numberPart;
    const query = splitParts[1];

    let message: string | null = parts[1] ?? null;
    if (query?.startsWith('body=')) {
      message = decodeURIComponent(query.slice(5));
    }

    return {
      type: 'sms',
      number,
      message,
      raw: content,
    };
  },

  render: (parsed) => {
    const smsLink = `sms:${parsed.number}${parsed.message ? `?body=${encodeURIComponent(parsed.message)}` : ''}`;

    return {
      rows: [
        { label: 'Number', value: parsed.number, copyable: true },
        ...(parsed.message ? [{ label: 'Message', value: parsed.message }] : []),
      ],
      action: {
        label: 'Send SMS',
        href: smsLink,
        color: 'ctp-sky',
      },
    };
  },
};
