import type { ParsedQRBase, QRTypeStrategy } from '../types';

interface ParsedVCard extends ParsedQRBase {
  type: 'vcard';
  name: string | null;
  fullName: string | null;
  org: string | null;
  title: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  url: string | null;
}

// Helper to extract value from vCard field
const getValue = (content: string, key: string): string | null => {
  const regex = new RegExp(`^${key}[;:](.*)$`, 'im');
  const match = content.match(regex);
  const value = match?.[1];
  return value ? value.trim() : null;
};

export const vcardStrategy: QRTypeStrategy<ParsedVCard> = {
  type: 'vcard',
  label: 'Contact',
  badge: { bg: 'bg-ctp-pink/20', text: 'text-ctp-pink' },
  subtitle: 'Contact Card',

  canParse: (content) => content.startsWith('BEGIN:VCARD'),

  parse: (content) => ({
    type: 'vcard',
    name: getValue(content, 'N'),
    fullName: getValue(content, 'FN'),
    org: getValue(content, 'ORG'),
    title: getValue(content, 'TITLE'),
    phone: getValue(content, 'TEL'),
    email: getValue(content, 'EMAIL'),
    address: getValue(content, 'ADR'),
    url: getValue(content, 'URL'),
    raw: content,
  }),

  render: (parsed) => {
    const displayName = parsed.fullName ?? parsed.name ?? 'Unknown';

    return {
      rows: [
        { label: 'Name', value: displayName },
        ...(parsed.org ? [{ label: 'Organization', value: parsed.org }] : []),
        ...(parsed.title ? [{ label: 'Title', value: parsed.title }] : []),
        ...(parsed.phone ? [{ label: 'Phone', value: parsed.phone, copyable: true }] : []),
        ...(parsed.email ? [{ label: 'Email', value: parsed.email, copyable: true }] : []),
        ...(parsed.url
          ? [{ label: 'Website', value: parsed.url, link: true, copyable: true }]
          : []),
        ...(parsed.address ? [{ label: 'Address', value: parsed.address }] : []),
      ],
      showRaw: true,
    };
  },
};
