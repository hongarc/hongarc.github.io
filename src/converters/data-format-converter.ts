import Papa from 'papaparse';
import * as yaml from 'yaml';

export interface DataFormatConverter {
  name: string;
  convert: (input: string, targetFormat: string) => string;
  detectFormat: (input: string) => string | null;
}

// Auto-detect input format
export function detectInputFormat(input: string): string {
  const trimmed = input.trim();

  // Return 'unknown' for empty or whitespace-only input
  if (!trimmed) {
    return 'unknown';
  }

  // Try to parse as JSON
  try {
    JSON.parse(trimmed);
    return 'json';
  } catch {}

  // Try to parse as XML (check first)
  if (trimmed.startsWith('<') && trimmed.includes('>')) {
    return 'xml';
  }

  // Check for CSV pattern
  if (trimmed.includes(',') && trimmed.includes('\n')) {
    return 'csv';
  }

  // Check for query string
  if (trimmed.includes('=') && trimmed.includes('&')) {
    return 'query';
  }

  // Try to parse as YAML (last, as it's most permissive)
  try {
    yaml.parse(trimmed);
    return 'yaml';
  } catch {}

  return 'unknown';
}

// Convert JSON to other formats
export function convertFromJson(input: string, targetFormat: string): string {
  const data = JSON.parse(input);

  switch (targetFormat.toLowerCase()) {
    case 'yaml': {
      return yaml.stringify(data);
    }
    case 'xml': {
      return convertObjectToXml(data);
    }
    case 'csv': {
      return convertObjectToCsv(data);
    }
    case 'query': {
      return convertObjectToQueryString(data);
    }
    case 'json': {
      return JSON.stringify(data, undefined, 2);
    }
    case 'minified': {
      return JSON.stringify(data);
    }
    case 'pretty': {
      return JSON.stringify(data, undefined, 2);
    }
    default: {
      throw new Error(`Unsupported target format: ${targetFormat}`);
    }
  }
}

// Convert YAML to other formats
export function convertFromYaml(input: string, targetFormat: string): string {
  const data = yaml.parse(input);

  switch (targetFormat.toLowerCase()) {
    case 'json': {
      return JSON.stringify(data, undefined, 2);
    }
    case 'xml': {
      return convertObjectToXml(data);
    }
    case 'csv': {
      return convertObjectToCsv(data);
    }
    case 'query': {
      return convertObjectToQueryString(data);
    }
    case 'yaml': {
      return yaml.stringify(data);
    }
    default: {
      throw new Error(`Unsupported target format: ${targetFormat}`);
    }
  }
}

// Convert XML to other formats (simplified browser-compatible version)
export function convertFromXml(input: string, targetFormat: string): string {
  // Simple XML to object conversion for browser
  const parser = new DOMParser();
  const xmlDocument = parser.parseFromString(input, 'text/xml');
  const result = xmlToObject(xmlDocument.documentElement);

  switch (targetFormat.toLowerCase()) {
    case 'json': {
      return JSON.stringify(result, undefined, 2);
    }
    case 'yaml': {
      return yaml.stringify(result);
    }
    case 'csv': {
      return convertObjectToCsv(result);
    }
    case 'query': {
      return convertObjectToQueryString(result);
    }
    case 'xml': {
      return input;
    } // Return original XML
    default: {
      throw new Error(`Unsupported target format: ${targetFormat}`);
    }
  }
}

// Convert CSV to other formats
export function convertFromCsv(input: string, targetFormat: string): string {
  const result = Papa.parse(input, { header: true });
  const records = result.data;

  switch (targetFormat.toLowerCase()) {
    case 'json': {
      return JSON.stringify(records, undefined, 2);
    }
    case 'yaml': {
      return yaml.stringify(records);
    }
    case 'xml': {
      return convertObjectToXml(records);
    }
    case 'query': {
      return convertObjectToQueryString(records);
    }
    case 'csv': {
      return input;
    } // passthrough
    default: {
      throw new Error(`Unsupported target format: ${targetFormat}`);
    }
  }
}

// Convert query string to other formats
export function convertFromQueryString(
  input: string,
  targetFormat: string
): string {
  const parameters = new URLSearchParams(input);
  const data: Record<string, string> = {};

  for (const [key, value] of parameters.entries()) {
    data[key] = value;
  }

  switch (targetFormat.toLowerCase()) {
    case 'json': {
      return JSON.stringify(data, undefined, 2);
    }
    case 'yaml': {
      return yaml.stringify(data);
    }
    case 'xml': {
      return convertObjectToXml(data);
    }
    case 'csv': {
      return convertObjectToCsv(data);
    }
    case 'query': {
      return input;
    } // Return original query string
    default: {
      throw new Error(`Unsupported target format: ${targetFormat}`);
    }
  }
}

// Helper functions
function convertObjectToXml(object: any, rootName: string = 'root'): string {
  return objectToXml(object, rootName);
}

function objectToXml(object: any, rootName: string): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>`;

  if (Array.isArray(object)) {
    for (const [index, item] of object.entries()) {
      xml += objectToXml(item, `item${index}`);
    }
  } else if (typeof object === 'object' && object !== null) {
    for (const [key, value] of Object.entries(object)) {
      xml +=
        typeof value === 'object' && value !== null
          ? objectToXml(value, key)
          : `<${key}>${value}</${key}>`;
    }
  } else {
    xml += object;
  }

  xml += `</${rootName}>`;
  return xml;
}

function xmlToObject(element: Element): any {
  const result: any = {};

  // Handle attributes
  for (let index = 0; index < element.attributes.length; index++) {
    const attribute = element.attributes[index];
    result[`@${attribute.name}`] = attribute.value;
  }

  // Handle child nodes
  for (let index = 0; index < element.childNodes.length; index++) {
    const child = element.childNodes[index];

    if (child.nodeType === Node.ELEMENT_NODE) {
      const childElement = child as Element;
      const childName = childElement.tagName;
      const childValue = xmlToObject(childElement);

      if (result[childName]) {
        if (!Array.isArray(result[childName])) {
          result[childName] = [result[childName]];
        }
        result[childName].push(childValue);
      } else {
        result[childName] = childValue;
      }
    } else if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
      result['#text'] = child.textContent.trim();
    }
  }

  return result;
}

function convertObjectToCsv(object: any): string {
  if (Array.isArray(object)) {
    if (object.length === 0) return '';
    return Papa.unparse(object);
  } else {
    return Papa.unparse([object]);
  }
}

function convertObjectToQueryString(object: any): string {
  const parameters = new URLSearchParams();

  function flattenObject(object_: any, prefix: string = ''): void {
    for (const [key, value] of Object.entries(object_)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value)
      ) {
        flattenObject(value, fullKey);
      } else {
        parameters.append(fullKey, String(value));
      }
    }
  }

  flattenObject(object);
  return parameters.toString();
}

// Main converter function
export function convertDataFormat(input: string, targetFormat: string): string {
  const sourceFormat = detectInputFormat(input);

  switch (sourceFormat) {
    case 'json': {
      return convertFromJson(input, targetFormat);
    }
    case 'yaml': {
      return convertFromYaml(input, targetFormat);
    }
    case 'xml': {
      return convertFromXml(input, targetFormat);
    }
    case 'csv': {
      return convertFromCsv(input, targetFormat);
    }
    case 'query': {
      return convertFromQueryString(input, targetFormat);
    }
    default: {
      throw new Error(`Unable to detect input format`);
    }
  }
}

// Examples
export const dataConverterExamples = {
  json: {
    input: '{"name": "John", "age": 30}',
    output: 'name: John\nage: 30',
    description: 'Convert JSON to YAML',
  },
  yaml: {
    input: 'name: John\nage: 30',
    output: '{"name":"John","age":30}',
    description: 'Convert YAML to JSON',
  },
  csv: {
    input: 'name,age\nJohn,30\nJane,25',
    output: '[{"name":"John","age":"30"},{"name":"Jane","age":"25"}]',
    description: 'Convert CSV to JSON',
  },
  query: {
    input: 'name=John&age=30&city=NYC',
    output: '{"name":"John","age":"30","city":"NYC"}',
    description: 'Convert query string to JSON',
  },
};
