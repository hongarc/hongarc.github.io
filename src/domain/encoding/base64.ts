/**
 * Encode string to Base64 with UTF-8 support
 */
export const encodeBase64 = (input: string, urlSafe: boolean): string => {
  const encoded = btoa(
    encodeURIComponent(input).replaceAll(/%([0-9A-F]{2})/g, (_, p1: string) =>
      String.fromCodePoint(Number.parseInt(p1, 16))
    )
  );

  if (urlSafe) {
    return encoded.replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
  }
  return encoded;
};

/**
 * Decode Base64 to string with UTF-8 support
 */
export const decodeBase64 = (input: string, urlSafe: boolean): string => {
  let base64 = input;

  if (urlSafe) {
    base64 = base64.replaceAll('-', '+').replaceAll('_', '/');
    const padding = base64.length % 4;
    if (padding) {
      base64 += '='.repeat(4 - padding);
    }
  }

  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.codePointAt(i) ?? 0;
  }
  return new TextDecoder().decode(bytes);
};
