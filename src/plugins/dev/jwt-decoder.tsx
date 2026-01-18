import { KeyRound } from 'lucide-react';

import {
  base64UrlEncode,
  getExpiryInfo,
  parseJwtParts,
  signHMAC,
  verifyHMAC,
} from '@/domain/jwt/service';
import type { ToolPlugin } from '@/types/plugin';
import {
  failure,
  getErrorMessage,
  getSelectInput,
  getTrimmedInput,
  instruction,
  success,
} from '@/utils';

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
      sensitive: true,
    },
    {
      id: 'genHeader',
      label: 'Header (JSON)',
      type: 'textarea',
      defaultValue: JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2),
      rows: 3,
      visibleWhen: { inputId: 'mode', value: 'generate' },
      codeLanguage: 'json',
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
        { value: 'custom', label: 'Custom seconds...' },
        { value: '0', label: 'No expiration' },
      ],
      visibleWhen: { inputId: 'mode', value: 'generate' },
    },
    {
      id: 'customExp',
      label: 'Custom Expiration (seconds)',
      type: 'number',
      defaultValue: 3600,
      visibleWhen: { inputId: 'expIn', value: 'custom' },
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
      codeLanguage: 'json',
    },
    {
      id: 'secret',
      label: 'Secret / Key',
      type: 'text',
      placeholder: 'Enter secret for HS256 or RSA key...',
      helpText: 'Used for signing (Generate) or verification (Decode)',
      sensitive: true,
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
          return instruction('Please enter Header and Payload to generate JWT');
        }

        const header = parseJson(headerStr);
        const payload = parseJson(payloadStr);

        if (!header) return failure('Invalid Header JSON');
        if (!payload) return failure('Invalid Payload JSON');

        // Override alg from select
        const alg = getTrimmedInput(inputs, 'alg') || (header.alg as string) || 'HS256';
        header.alg = alg;

        // Add exp if set
        const expInVal = getTrimmedInput(inputs, 'expIn') || '0';
        let expIn = 0;
        expIn =
          expInVal === 'custom'
            ? Number(getTrimmedInput(inputs, 'customExp') || '3600')
            : Number(expInVal);

        if (expIn > 0) {
          payload.exp = Math.floor(Date.now() / 1000) + expIn;
        }

        const headerB64 = base64UrlEncode(JSON.stringify(header));
        const payloadB64 = base64UrlEncode(JSON.stringify(payload));
        const dataToSign = `${headerB64}.${payloadB64}`;

        let signature = 'signature';
        if (secret) {
          switch (alg) {
            case 'HS256': {
              signature = await signHMAC(dataToSign, secret, 'SHA-256');

              break;
            }
            case 'HS384': {
              signature = await signHMAC(dataToSign, secret, 'SHA-384');

              break;
            }
            case 'HS512': {
              signature = await signHMAC(dataToSign, secret, 'SHA-512');

              break;
            }
            default: {
              return failure(`Signing with ${alg} not yet supported. Use HS256/384/512.`);
            }
          }
        }

        const token = `${dataToSign}.${signature}`;
        return success(token, {
          _viewMode: 'sections',
          _sections: {
            stats: [
              { label: 'Algorithm', value: alg },
              { label: 'Header', value: JSON.stringify(header) },
              { label: 'Status', value: secret ? 'Signed' : 'Unsigned', type: 'badge' },
            ],
            content: token,
            contentLabel: 'Generated JWT',
          },
        });
      }

      // Decode Mode
      const input = getTrimmedInput(inputs, 'input');
      if (!input) return instruction('Please enter a JWT token to decode');

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
        let isSignatureValid = false;
        const dataToVerify = `${parts.rawHeader}.${parts.rawPayload}`;

        switch (header.alg) {
          case 'HS256': {
            isSignatureValid = await verifyHMAC(dataToVerify, parts.signature, secret, 'SHA-256');

            break;
          }
          case 'HS384': {
            isSignatureValid = await verifyHMAC(dataToVerify, parts.signature, secret, 'SHA-384');

            break;
          }
          case 'HS512': {
            isSignatureValid = await verifyHMAC(dataToVerify, parts.signature, secret, 'SHA-512');

            break;
          }
          // No default
        }

        sigStatus = {
          label: 'Signature',
          value: isSignatureValid ? 'Verified' : 'Invalid Signature',
          variant: isSignatureValid ? 'success' : 'error',
        };
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
