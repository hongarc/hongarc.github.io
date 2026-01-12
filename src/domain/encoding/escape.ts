// Pure function: escape for JavaScript
export const escapeJs = (str: string): string => {
  return str
    .replaceAll('\\', '\\\\')
    .replaceAll("'", String.raw`\'`)
    .replaceAll('"', String.raw`\"`)
    .replaceAll('\n', String.raw`\n`)
    .replaceAll('\r', String.raw`\r`)
    .replaceAll('\t', String.raw`\t`)
    .replaceAll('\b', String.raw`\b`)
    .replaceAll('\f', String.raw`\f`);
};

// Pure function: unescape JavaScript
export const unescapeJs = (str: string): string => {
  return str
    .replaceAll(String.raw`\n`, '\n')
    .replaceAll(String.raw`\r`, '\r')
    .replaceAll(String.raw`\t`, '\t')
    .replaceAll(String.raw`\b`, '\b')
    .replaceAll(String.raw`\f`, '\f')
    .replaceAll(String.raw`\'`, "'")
    .replaceAll(String.raw`\"`, '"')
    .replaceAll('\\\\', '\\');
};

// Pure function: escape for JSON
export const escapeJson = (str: string): string => {
  return JSON.stringify(str).slice(1, -1);
};

// Pure function: unescape JSON
export const unescapeJson = (str: string): string => {
  try {
    return JSON.parse(`"${str}"`) as string;
  } catch {
    return str;
  }
};

// Pure function: escape HTML
export const escapeHtml = (str: string): string => {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
};

// Pure function: unescape HTML
export const unescapeHtml = (str: string): string => {
  return str
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&nbsp;', ' ');
};

// Pure function: escape URL
export const escapeUrl = (str: string): string => {
  return encodeURIComponent(str);
};

// Pure function: unescape URL
export const unescapeUrl = (str: string): string => {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
};

// Pure function: escape SQL
export const escapeSql = (str: string): string => {
  return str.replaceAll("'", "''").replaceAll('\\', '\\\\');
};

// Pure function: unescape SQL
export const unescapeSql = (str: string): string => {
  return str.replaceAll("''", "'").replaceAll('\\\\', '\\');
};
