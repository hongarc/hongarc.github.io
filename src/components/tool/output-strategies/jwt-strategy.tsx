import { ChevronDown, Info } from 'lucide-react';
import { useState } from 'react';

import { CodeHighlight } from '@/components/ui/code-highlight';
import { type OutputStat, StatItem } from '@/components/ui/sectioned-output';

import type { OutputStrategyProps } from './types';

interface JwtData {
  stats: OutputStat[];
  header: string;
  payload: string;
  signature: string;
  token: string;
  alg: string;
}

// Color accents per JWT part (mirrors the colored token preview, jwt.io style)
const PART_COLORS = {
  header: 'text-ctp-red',
  payload: 'text-ctp-mauve',
  signature: 'text-ctp-blue',
} as const;

// Pure: split a token into its 3 dot-separated parts (missing parts -> '')
const splitToken = (token: string): [string, string, string] => {
  const [h = '', p = '', s = ''] = token.split('.');
  return [h, p, s];
};

function TokenPreview({ token }: { token: string }) {
  const [h, p, s] = splitToken(token);

  return (
    <div className="border-ctp-surface1 bg-ctp-mantle rounded-lg border p-4 font-mono text-[13px] leading-relaxed break-all">
      <span className={PART_COLORS.header}>{h}</span>
      {p && <span className="text-ctp-overlay0">.</span>}
      <span className={PART_COLORS.payload}>{p}</span>
      {s && <span className="text-ctp-overlay0">.</span>}
      <span className={PART_COLORS.signature}>{s}</span>
    </div>
  );
}

function JwtPart({
  label,
  accent,
  children,
}: {
  label: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div
        className={`flex items-center gap-2 text-xs font-semibold tracking-wide uppercase ${accent}`}
      >
        <span className="inline-block h-2 w-2 rounded-full bg-current" />
        {label}
      </div>
      {children}
    </div>
  );
}

function JwtExplainer() {
  const [open, setOpen] = useState(true);

  return (
    <div className="border-ctp-surface1 bg-ctp-mantle/50 rounded-lg border">
      <button
        onClick={() => {
          setOpen((v) => !v);
        }}
        className="text-ctp-subtext1 hover:text-ctp-text flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
      >
        <span className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          What is a JWT &amp; how is it created?
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="text-ctp-subtext1 space-y-3 px-4 pb-4 text-sm leading-relaxed">
          <p>
            A JWT (JSON Web Token) is three Base64URL-encoded parts joined by dots:{' '}
            <span className={`font-mono ${PART_COLORS.header}`}>header</span>
            <span className="text-ctp-overlay0">.</span>
            <span className={`font-mono ${PART_COLORS.payload}`}>payload</span>
            <span className="text-ctp-overlay0">.</span>
            <span className={`font-mono ${PART_COLORS.signature}`}>signature</span>
          </p>
          <ul className="ml-1 space-y-1">
            <li>
              <span className={`font-semibold ${PART_COLORS.header}`}>Header</span> — the signing
              algorithm and token type, e.g. <code>{'{ "alg": "HS256", "typ": "JWT" }'}</code>.
            </li>
            <li>
              <span className={`font-semibold ${PART_COLORS.payload}`}>Payload</span> — the claims
              (data), e.g. <code>sub</code>, <code>name</code>, <code>iat</code>, <code>exp</code>.
            </li>
            <li>
              <span className={`font-semibold ${PART_COLORS.signature}`}>Signature</span> — proves
              the token was not tampered with and was issued by someone holding the secret.
            </li>
          </ul>
          <div className="space-y-1">
            <p className="text-ctp-subtext0 text-xs font-semibold tracking-wide uppercase">
              How the signature is created
            </p>
            <CodeHighlight
              code={`signature = HMACSHA256(
  base64url(header) + "." + base64url(payload),
  your-secret-key
)

jwt = base64url(header) + "." + base64url(payload) + "." + signature`}
              language="javascript"
              maxHeight="220px"
            />
          </div>
          <p className="text-ctp-overlay1">
            ⚠️ Header and payload are only <strong>encoded</strong>, not encrypted — anyone can read
            them. Never put secrets in the payload. The signature (made with your secret) is what
            makes the token trustworthy.
          </p>
        </div>
      )}
    </div>
  );
}

export function JwtStrategy({ result }: OutputStrategyProps) {
  const data = result.meta?._jwt as JwtData | undefined;

  if (!data) return null;

  return (
    <div className="space-y-4">
      <TokenPreview token={data.token} />

      {data.stats.length > 0 && (
        <div className="border-ctp-surface1 bg-ctp-mantle/50 divide-ctp-surface0 divide-y rounded-lg border px-4">
          {data.stats.map((stat) => (
            <StatItem key={stat.label} stat={stat} />
          ))}
        </div>
      )}

      <JwtPart label="Header" accent={PART_COLORS.header}>
        <CodeHighlight code={data.header} language="json" maxHeight="220px" />
      </JwtPart>

      <JwtPart label="Payload" accent={PART_COLORS.payload}>
        <CodeHighlight code={data.payload} language="json" maxHeight="300px" />
      </JwtPart>

      <JwtPart label="Signature" accent={PART_COLORS.signature}>
        <CodeHighlight code={data.signature} language="plain" maxHeight="120px" wrap />
      </JwtPart>

      <JwtExplainer />
    </div>
  );
}
