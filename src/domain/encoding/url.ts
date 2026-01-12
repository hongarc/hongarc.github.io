export type UrlMode = 'encode' | 'decode' | 'encodeComponent' | 'decodeComponent';

/**
 * URL encoding/decoding functions mapped by mode
 */
export const urlFunctions: Record<UrlMode, (s: string) => string> = {
  encode: encodeURI,
  decode: decodeURI,
  encodeComponent: encodeURIComponent,
  decodeComponent: decodeURIComponent,
};

export const processUrl = (input: string, mode: UrlMode): string => {
  return urlFunctions[mode](input);
};
