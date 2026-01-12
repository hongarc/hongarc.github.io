import { KeyRound } from 'lucide-react';

import type { ToolPlugin } from '@/types/plugin';
import { failure, getErrorMessage, getSelectInput, getTrimmedInput, success } from '@/utils';

// Pure function: encode base64url
const base64UrlEncode = (str: string): string => {
  try {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    const binary = Array.from(bytes, (b) => String.fromCodePoint(b)).join('');
    const base64 = btoa(binary);
    return base64.replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
  } catch {
    return '';
  }
};

// Pure function: decode base64url
const base64UrlDecode = (str: string): string => {
  const base64 = str.replaceAll('-', '+').replaceAll('_', '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  try {
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (c) => c.codePointAt(0) ?? 0);
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  } catch {
    return atob(padded); // Fallback to raw atob
  }
};

// Pure function: convert buffer to base64url
const bufferToBase64Url = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  const binary = Array.from(bytes, (b) => String.fromCodePoint(b)).join('');
  const base64 = btoa(binary);
  return base64.replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
};

// Sign data using HS256
const signHS256 = async (data: string, secret: string): Promise<string> => {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return bufferToBase64Url(signature);
};

// Verify HS256 signature
const verifyHS256 = async (
  data: string,
  signatureB64: string,
  secret: string
): Promise<boolean> => {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const sigBase64 = signatureB64.replaceAll('-', '+').replaceAll('_', '/');
  const sigPadded = sigBase64 + '='.repeat((4 - (sigBase64.length % 4)) % 4);
  const sigBytes = Uint8Array.from(atob(sigPadded), (c) => c.codePointAt(0) ?? 0);

  return crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(data));
};

// Pure function: parse JWT parts
const parseJwtParts = (
  token: string
): {
  header: string;
  payload: string;
  signature: string;
  rawHeader: string;
  rawPayload: string;
} | null => {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signature] = parts;
  if (!headerB64 || !payloadB64 || !signature) return null;

  return {
    header: base64UrlDecode(headerB64),
    payload: base64UrlDecode(payloadB64),
    signature,
    rawHeader: headerB64,
    rawPayload: payloadB64,
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

// Pure function: get time until expiry
const getExpiryInfo = (payload: Record<string, unknown>): { text: string; isExpired: boolean } => {
  const exp = payload.exp;
  if (typeof exp !== 'number') return { text: 'No expiry', isExpired: false };

  const now = Date.now();
  const expiryMs = exp * 1000;
  const diff = expiryMs - now;

  if (diff < 0) {
    const ago = Math.abs(diff);
    let timeText = '';
    if (ago < 60_000) timeText = `${String(Math.floor(ago / 1000))}s ago`;
    else if (ago < 3_600_000) timeText = `${String(Math.floor(ago / 60_000))}m ago`;
    else if (ago < 86_400_000) timeText = `${String(Math.floor(ago / 3_600_000))}h ago`;
    else timeText = `${String(Math.floor(ago / 86_400_000))}d ago`;
    return { text: `Expired ${timeText}`, isExpired: true };
  }

  let timeText = '';
  if (diff < 60_000) timeText = `${String(Math.floor(diff / 1000))}s`;
  else if (diff < 3_600_000) timeText = `${String(Math.floor(diff / 60_000))}m`;
  else if (diff < 86_400_000) timeText = `${String(Math.floor(diff / 3_600_000))}h`;
  else timeText = `${String(Math.floor(diff / 86_400_000))}d`;
  return { text: `Expires in ${timeText}`, isExpired: false };
};

export const jwtDecoder: ToolPlugin = {
  id: 'jwt-decoder',
  label: 'JWT Tool',
  description: 'Decode, verify and generate JSON Web Tokens',
  category: 'dev',
  icon: <KeyRound className="h-4 w-4" />,
  keywords: ['jwt', 'token', 'decode', 'encode', 'generate', 'sign', 'verify', 'json', 'auth'],
  isAsync: true,
  inputs: [
    {
      id: 'mode',
      label: 'Operation',
      type: 'select',
      defaultValue: 'decode',
      options: [
        { value: 'decode', label: 'Decode / Verify' },
        { value: 'generate', label: 'Generate / Sign' },
      ],
    },
    {
      id: 'input',
      label: 'JWT Token',
      type: 'textarea',
      placeholder: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature',
      rows: 3,
      visibleWhen: { inputId: 'mode', value: 'decode' },
    },
    {
      id: 'genHeader',
      label: 'Header (JSON)',
      type: 'textarea',
      defaultValue: JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2),
      rows: 3,
      visibleWhen: { inputId: 'mode', value: 'generate' },
    },
    {
      id: 'alg',
      label: 'Algorithm',
      type: 'select',
      defaultValue: 'HS256',
      searchable: true,
      options: [
        { value: 'HS256', label: 'HS256 (HMAC SHA-256)' },
        { value: 'HS384', label: 'HS384 (HMAC SHA-384)' },
        { value: 'HS512', label: 'HS512 (HMAC SHA-512)' },
        { value: 'RS256', label: 'RS256 (RSA SHA-256) - Verification only' },
      ],
      visibleWhen: { inputId: 'mode', value: 'generate' },
    },
    {
      id: 'expIn',
      label: 'Expires In',
      type: 'select',
      defaultValue: '3600',
      options: [
        { value: '60', label: '1 minute' },
        { value: '600', label: '10 minutes' },
        { value: '3600', label: '1 hour' },
        { value: '86400', label: '1 day' },
        { value: '2592000', label: '30 days' },
        { value: '0', label: 'No expiration' },
      ],
      visibleWhen: { inputId: 'mode', value: 'generate' },
    },
    {
      id: 'genPayload',
      label: 'Payload (JSON)',
      type: 'textarea',
      defaultValue: JSON.stringify(
        { sub: '1234567890', name: 'John Doe', iat: Math.floor(Date.now() / 1000) },
        null,
        2
      ),
      rows: 6,
      visibleWhen: { inputId: 'mode', value: 'generate' },
    },
    {
      id: 'secret',
      label: 'Secret / Key',
      type: 'text',
      placeholder: 'Enter secret for HS256 or RSA key...',
      helpText: 'Used for signing (Generate) or verification (Decode)',
    },
  ],
  transformer: async (inputs) => {
    const mode = getSelectInput(inputs, 'mode', ['decode', 'generate'], 'decode');
    const secret = getTrimmedInput(inputs, 'secret');

    try {
      if (mode === 'generate') {
        const headerStr = getTrimmedInput(inputs, 'genHeader');
        const payloadStr = getTrimmedInput(inputs, 'genPayload');

        if (!headerStr || !payloadStr) {
          return failure('Header and Payload are required');
        }

        const header = parseJson(headerStr);
        const payload = parseJson(payloadStr);

        if (!header) return failure('Invalid Header JSON');
        if (!payload) return failure('Invalid Payload JSON');

        // Override alg from select
        const alg = getTrimmedInput(inputs, 'alg') || (header.alg as string) || 'HS256';
        header.alg = alg;

        // Add exp if set
        const expIn = Number(getTrimmedInput(inputs, 'expIn') || '0');
        if (expIn > 0) {
          payload.exp = Math.floor(Date.now() / 1000) + expIn;
        }

        const headerB64 = base64UrlEncode(JSON.stringify(header));
        const payloadB64 = base64UrlEncode(JSON.stringify(payload));
        const dataToSign = `${headerB64}.${payloadB64}`;

        let signature = 'signature';
        if (secret) {
          if (alg === 'HS256') {
            signature = await signHS256(dataToSign, secret);
          } else {
            return failure(`Signing with ${alg} not yet supported. Use HS256.`);
          }
        }

        const token = `${dataToSign}.${signature}`;
        return success(token, {
          _viewMode: 'sections',
          _sections: {
            stats: [
              { label: 'Algorithm', value: alg },
              { label: 'Status', value: secret ? 'Signed' : 'Unsigned', type: 'badge' },
            ],
            content: token,
            contentLabel: 'Generated JWT',
          },
        });
      }

      // Decode Mode
      const input = getTrimmedInput(inputs, 'input');
      if (!input) return failure('Please enter a JWT token');

      const parts = parseJwtParts(input);
      if (!parts) return failure('Invalid JWT format (expected 3 parts)');

      const header = parseJson(parts.header);
      const payload = parseJson(parts.payload);

      if (!header || !payload) return failure('Failed to parse JWT parts as JSON');

      const expiry = getExpiryInfo(payload);
      let sigStatus: { label: string; value: string; variant: 'success' | 'error' | 'warning' } = {
        label: 'Signature',
        value: 'Not verified',
        variant: 'warning',
      };

      if (secret) {
        if (header.alg === 'HS256') {
          const isValid = await verifyHS256(
            `${parts.rawHeader}.${parts.rawPayload}`,
            parts.signature,
            secret
          );
          sigStatus = {
            label: 'Signature',
            value: isValid ? 'Verified' : 'Invalid',
            variant: isValid ? 'success' : 'error',
          };
        } else {
          sigStatus = {
            label: 'Signature',
            value: 'Unsupported Alg',
            variant: 'warning',
          };
        }
      }

      const stats = [
        { label: 'Algorithm', value: typeof header.alg === 'string' ? header.alg : 'unknown' },
        {
          label: 'Signature',
          value: sigStatus.value,
          type: 'badge',
          variant: sigStatus.variant,
        },
        {
          label: 'Status',
          value: expiry.isExpired ? 'Expired' : 'Valid',
          type: 'badge',
          variant: expiry.isExpired ? 'error' : 'success',
        },
        { label: 'Expiry', value: expiry.text },
      ];

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
    } catch (error) {
      return failure(getErrorMessage(error));
    }
  },
};
