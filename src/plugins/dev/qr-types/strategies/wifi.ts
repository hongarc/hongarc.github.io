import type { ParsedQRBase, QRTypeStrategy } from '../types';

interface ParsedWiFi extends ParsedQRBase {
  type: 'wifi';
  ssid: string;
  password: string | null;
  security: string;
  hidden: boolean;
}

export const wifiStrategy: QRTypeStrategy<ParsedWiFi> = {
  type: 'wifi',
  label: 'WiFi',
  badge: { bg: 'bg-ctp-blue/20', text: 'text-ctp-blue' },
  subtitle: 'Network',

  canParse: (content) => content.startsWith('WIFI:'),

  parse: (content) => {
    const params: Record<string, string> = {};
    const data = content.slice(5).replace(/;;$/, '');

    for (const part of data.split(';')) {
      const colonIndex = part.indexOf(':');
      if (colonIndex > 0) {
        params[part.slice(0, colonIndex)] = part.slice(colonIndex + 1);
      }
    }

    if (!params.S) return null;

    return {
      type: 'wifi',
      ssid: params.S,
      password: params.P ?? null,
      security: params.T ?? 'nopass',
      hidden: params.H === 'true',
      raw: content,
    };
  },

  render: (parsed) => {
    const securityLabel = parsed.security === 'nopass' ? 'Open' : parsed.security.toUpperCase();
    const rows = [
      { label: 'Network Name (SSID)', value: parsed.ssid, copyable: true },
      ...(parsed.password ? [{ label: 'Password', value: parsed.password, copyable: true }] : []),
      { label: 'Security', value: securityLabel },
      ...(parsed.hidden ? [{ label: 'Hidden Network', value: 'Yes' }] : []),
    ];

    return { rows, showRaw: true };
  },
};
