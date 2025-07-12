import * as yaml from 'yaml';
import Papa from 'papaparse';

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
    case 'yaml':
      return yaml.stringify(data);
    case 'xml':
      return convertObjectToXml(data);
    case 'csv':
      return convertObjectToCsv(data);
    case 'query':
      return convertObjectToQueryString(data);
    case 'json':
      return JSON.stringify(data, null, 2);
    case 'minified':
      return JSON.stringify(data);
    case 'pretty':
      return JSON.stringify(data, null, 2);
    default:
      throw new Error(`Unsupported target format: ${targetFormat}`);
  }
}

// Convert YAML to other formats
export function convertFromYaml(input: string, targetFormat: string): string {
  const data = yaml.parse(input);

  switch (targetFormat.toLowerCase()) {
    case 'json':
      return JSON.stringify(data, null, 2);
    case 'xml':
      return convertObjectToXml(data);
    case 'csv':
      return convertObjectToCsv(data);
    case 'query':
      return convertObjectToQueryString(data);
    case 'yaml':
      return yaml.stringify(data);
    default:
      throw new Error(`Unsupported target format: ${targetFormat}`);
  }
}

// Convert XML to other formats (simplified browser-compatible version)
export function convertFromXml(input: string, targetFormat: string): string {
  // Simple XML to object conversion for browser
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(input, 'text/xml');
  const result = xmlToObject(xmlDoc.documentElement);

  switch (targetFormat.toLowerCase()) {
    case 'json':
      return JSON.stringify(result, null, 2);
    case 'yaml':
      return yaml.stringify(result);
    case 'csv':
      return convertObjectToCsv(result);
    case 'query':
      return convertObjectToQueryString(result);
    case 'xml':
      return input; // Return original XML
    default:
      throw new Error(`Unsupported target format: ${targetFormat}`);
  }
}

// Convert CSV to other formats
export function convertFromCsv(input: string, targetFormat: string): string {
  const result = Papa.parse(input, { header: true });
  const records = result.data;

  switch (targetFormat.toLowerCase()) {
    case 'json':
      return JSON.stringify(records, null, 2);
    case 'yaml':
      return yaml.stringify(records);
    case 'xml':
      return convertObjectToXml(records);
    case 'query':
      return convertObjectToQueryString(records);
    case 'csv':
      return input; // passthrough
    default:
      throw new Error(`Unsupported target format: ${targetFormat}`);
  }
}

// Convert query string to other formats
export function convertFromQueryString(input: string, targetFormat: string): string {
  const params = new URLSearchParams(input);
  const data: Record<string, string> = {};

  for (const [key, value] of params.entries()) {
    data[key] = value;
  }

  switch (targetFormat.toLowerCase()) {
    case 'json':
      return JSON.stringify(data, null, 2);
    case 'yaml':
      return yaml.stringify(data);
    case 'xml':
      return convertObjectToXml(data);
    case 'csv':
      return convertObjectToCsv(data);
    case 'query':
      return input; // Return original query string
    default:
      throw new Error(`Unsupported target format: ${targetFormat}`);
  }
}



// Helper functions
function convertObjectToXml(obj: any, rootName: string = 'root'): string {
  return objectToXml(obj, rootName);
}

function objectToXml(obj: any, rootName: string): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>`;

  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      xml += objectToXml(item, `item${index}`);
    });
  } else if (typeof obj === 'object' && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        xml += objectToXml(value, key);
      } else {
        xml += `<${key}>${value}</${key}>`;
      }
    }
  } else {
    xml += obj;
  }

  xml += `</${rootName}>`;
  return xml;
}

function xmlToObject(element: Element): any {
  const result: any = {};

  // Handle attributes
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    result[`@${attr.name}`] = attr.value;
  }

  // Handle child nodes
  for (let i = 0; i < element.childNodes.length; i++) {
    const child = element.childNodes[i];

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

function convertObjectToCsv(obj: any): string {
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '';
    return Papa.unparse(obj);
  } else {
    return Papa.unparse([obj]);
  }
}

function convertObjectToQueryString(obj: any): string {
  const params = new URLSearchParams();

  function flattenObject(obj: any, prefix: string = ''): void {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        flattenObject(value, fullKey);
      } else {
        params.append(fullKey, String(value));
      }
    }
  }

  flattenObject(obj);
  return params.toString();
}

// Main converter function
export function convertDataFormat(input: string, targetFormat: string): string {
  const sourceFormat = detectInputFormat(input);

  switch (sourceFormat) {
    case 'json':
      return convertFromJson(input, targetFormat);
    case 'yaml':
      return convertFromYaml(input, targetFormat);
    case 'xml':
      return convertFromXml(input, targetFormat);
    case 'csv':
      return convertFromCsv(input, targetFormat);
    case 'query':
      return convertFromQueryString(input, targetFormat);
    default:
      throw new Error(`Unable to detect input format`);
  }
}

// Examples
export const dataConverterExamples = {
  json: {
    input: '{"name": "John", "age": 30}',
    output: 'name: John\nage: 30',
    description: 'Convert JSON to YAML'
  },
  yaml: {
    input: 'name: John\nage: 30',
    output: '{"name":"John","age":30}',
    description: 'Convert YAML to JSON'
  },
  csv: {
    input: 'name,age\nJohn,30\nJane,25',
    output: '[{"name":"John","age":"30"},{"name":"Jane","age":"25"}]',
    description: 'Convert CSV to JSON'
  },
  query: {
    input: 'name=John&age=30&city=NYC',
    output: '{"name":"John","age":"30","city":"NYC"}',
    description: 'Convert query string to JSON'
  }
};