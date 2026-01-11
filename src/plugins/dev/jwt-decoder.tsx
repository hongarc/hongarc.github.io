import { KeyRound } from 'lucide-react';

import type { ToolPlugin } from '@/types/plugin';
import { failure, getTrimmedInput, success } from '@/utils';

// Pure function: safely stringify unknown values
const stringify = (val: unknown): string => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  return JSON.stringify(val);
};

// Pure function: decode base64url
const base64UrlDecode = (str: string): string => {
  // Replace base64url chars with base64 chars
  const base64 = str.replaceAll('-', '+').replaceAll('_', '/');
  // Add padding if needed
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  try {
    return atob(padded);
  } catch {
    return '';
  }
};

// Pure function: parse JWT parts
const parseJwtParts = (
  token: string
): { header: string; payload: string; signature: string } | null => {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signature] = parts;
  if (!headerB64 || !payloadB64 || !signature) return null;

  return {
    header: base64UrlDecode(headerB64),
    payload: base64UrlDecode(payloadB64),
    signature,
  };
};

// Pure function: format JSON with indentation
const formatJson = (str: string): string => {
  try {
    return JSON.stringify(JSON.parse(str), null, 2);
  } catch {
    return str;
  }
};

// Pure function: parse JSON safely
const parseJson = (str: string): Record<string, unknown> | null => {
  try {
    return JSON.parse(str) as Record<string, unknown>;
  } catch {
    return null;
  }
};

// Pure function: check if JWT is expired
const isExpired = (payload: Record<string, unknown>): boolean => {
  const exp = payload.exp;
  if (typeof exp !== 'number') return false;
  return Date.now() > exp * 1000;
};

// Pure function: get time until expiry
const getExpiryInfo = (payload: Record<string, unknown>): string => {
  const exp = payload.exp;
  if (typeof exp !== 'number') return 'No expiry';

  const now = Date.now();
  const expiryMs = exp * 1000;
  const diff = expiryMs - now;

  if (diff < 0) {
    const ago = Math.abs(diff);
    if (ago < 60_000) return `Expired ${String(Math.floor(ago / 1000))}s ago`;
    if (ago < 3_600_000) return `Expired ${String(Math.floor(ago / 60_000))}m ago`;
    if (ago < 86_400_000) return `Expired ${String(Math.floor(ago / 3_600_000))}h ago`;
    return `Expired ${String(Math.floor(ago / 86_400_000))}d ago`;
  }

  if (diff < 60_000) return `Expires in ${String(Math.floor(diff / 1000))}s`;
  if (diff < 3_600_000) return `Expires in ${String(Math.floor(diff / 60_000))}m`;
  if (diff < 86_400_000) return `Expires in ${String(Math.floor(diff / 3_600_000))}h`;
  return `Expires in ${String(Math.floor(diff / 86_400_000))}d`;
};

export const jwtDecoder: ToolPlugin = {
  id: 'jwt-decoder',
  label: 'JWT Decoder',
  description: 'Decode and inspect JSON Web Tokens',
  category: 'dev',
  icon: <KeyRound className="h-4 w-4" />,
  keywords: ['jwt', 'token', 'decode', 'json', 'web', 'auth', 'bearer'],
  inputs: [
    {
      id: 'input',
      label: 'JWT Token',
      type: 'textarea',
      placeholder: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature',
      required: true,
      rows: 4,
    },
  ],
  transformer: (inputs) => {
    const input = getTrimmedInput(inputs, 'input');

    if (!input) {
      return failure('Please enter a JWT token');
    }

    const parts = parseJwtParts(input);
    if (!parts) {
      return failure('Invalid JWT format. Expected: header.payload.signature');
    }

    const header = parseJson(parts.header);
    const payload = parseJson(parts.payload);

    if (!header) {
      return failure('Invalid JWT header - could not parse JSON');
    }

    if (!payload) {
      return failure('Invalid JWT payload - could not parse JSON');
    }

    const expired = isExpired(payload);
    const alg = typeof header.alg === 'string' ? header.alg : 'unknown';
    const typ = typeof header.typ === 'string' ? header.typ : 'JWT';

    // Build stats
    const stats: {
      label: string;
      value: string;
      type?: 'badge';
      variant?: 'success' | 'error' | 'warning';
    }[] = [
      { label: 'Algorithm', value: alg },
      { label: 'Type', value: typ },
      {
        label: 'Status',
        value: expired ? 'Expired' : 'Valid',
        type: 'badge',
        variant: expired ? 'error' : 'success',
      },
    ];

    if (typeof payload.exp === 'number') {
      stats.push({ label: 'Expiry', value: getExpiryInfo(payload) });
    }
    if (payload.sub !== undefined) {
      stats.push({ label: 'Subject', value: stringify(payload.sub) });
    }
    if (payload.iss !== undefined) {
      stats.push({ label: 'Issuer', value: stringify(payload.iss) });
    }

    // Build content
    const content = [
      'HEADER:',
      formatJson(parts.header),
      '',
      'PAYLOAD:',
      formatJson(parts.payload),
    ].join('\n');

    return success(content, {
      _viewMode: 'sections',
      _sections: {
        stats,
        content,
        contentLabel: 'Decoded Token',
      },
    });
  },
};
