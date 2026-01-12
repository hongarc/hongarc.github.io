// Pure function: encode base64url
export const base64UrlEncode = (str: string): string => {
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
export const base64UrlDecode = (str: string): string => {
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
export const bufferToBase64Url = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  const binary = Array.from(bytes, (b) => String.fromCodePoint(b)).join('');
  const base64 = btoa(binary);
  return base64.replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
};

// Sign data using HMAC (SHA-256, SHA-384, or SHA-512)
export const signHMAC = async (
  data: string,
  secret: string,
  hash: 'SHA-256' | 'SHA-384' | 'SHA-512'
): Promise<string> => {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash }, false, [
    'sign',
  ]);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return bufferToBase64Url(signature);
};

// Verify HMAC (SHA-256, SHA-384, or SHA-512)
export const verifyHMAC = async (
  data: string,
  signatureB64: string,
  secret: string,
  hash: 'SHA-256' | 'SHA-384' | 'SHA-512'
): Promise<boolean> => {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash }, false, [
    'verify',
  ]);

  const sigBase64 = signatureB64.replaceAll('-', '+').replaceAll('_', '/');
  const sigPadded = sigBase64 + '='.repeat((4 - (sigBase64.length % 4)) % 4);
  const sigBytes = Uint8Array.from(atob(sigPadded), (c) => c.codePointAt(0) ?? 0);

  return crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(data));
};

// Pure function: parse JWT parts
export const parseJwtParts = (
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

// Pure function: get time until expiry
export const getExpiryInfo = (
  payload: Record<string, unknown>
): { text: string; isExpired: boolean } => {
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
