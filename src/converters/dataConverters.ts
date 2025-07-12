import * as yaml from 'yaml';
import * as jsYaml from 'js-yaml';
import { parse as csvParse } from 'csv-parse/sync';
import { stringify as csvStringify } from 'csv-stringify/sync';
import * as xml2js from 'xml2js';

export interface DataFormatConverter {
  name: string;
  convert: (input: string, targetFormat: string) => string;
  detectFormat: (input: string) => string | null;
}

// Auto-detect input format
export function detectInputFormat(input: string): string {
  const trimmed = input.trim();

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
    default:
      throw new Error(`Unsupported target format: ${targetFormat}`);
  }
}

// Convert XML to other formats
export function convertFromXml(input: string, targetFormat: string): Promise<string> {
  return new Promise((resolve, reject) => {
    xml2js.parseString(input, { explicitArray: false }, (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        let output: string;
        switch (targetFormat.toLowerCase()) {
          case 'json':
            output = JSON.stringify(result, null, 2);
            break;
          case 'yaml':
            output = yaml.stringify(result);
            break;
          case 'csv':
            output = convertObjectToCsv(result);
            break;
          case 'query':
            output = convertObjectToQueryString(result);
            break;
          default:
            throw new Error(`Unsupported target format: ${targetFormat}`);
        }
        resolve(output);
      } catch (error) {
        reject(error);
      }
    });
  });
}

// Convert CSV to other formats
export function convertFromCsv(input: string, targetFormat: string): string {
  const records = csvParse(input, { columns: true });

  switch (targetFormat.toLowerCase()) {
    case 'json':
      return JSON.stringify(records, null, 2);
    case 'yaml':
      return yaml.stringify(records);
    case 'xml':
      return convertObjectToXml(records);
    case 'query':
      return convertObjectToQueryString(records);
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
    default:
      throw new Error(`Unsupported target format: ${targetFormat}`);
  }
}

// Helper functions
function convertObjectToXml(obj: any, rootName: string = 'root'): string {
  const builder = new xml2js.Builder({ rootName, headless: true });
  return builder.buildObject(obj);
}

function convertObjectToCsv(obj: any): string {
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '';
    const headers = Object.keys(obj[0]);
    return csvStringify(obj, { header: true });
  } else {
    const headers = Object.keys(obj);
    return csvStringify([obj], { header: true });
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
export async function convertDataFormat(input: string, targetFormat: string): Promise<string> {
  const sourceFormat = detectInputFormat(input);

  switch (sourceFormat) {
    case 'json':
      return convertFromJson(input, targetFormat);
    case 'yaml':
      return convertFromYaml(input, targetFormat);
    case 'xml':
      return await convertFromXml(input, targetFormat);
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
  jsonToYaml: {
    input: '{"name": "John", "age": 30, "city": "New York"}',
    output: `name: John
age: 30
city: New York`,
    description: "Convert JSON to YAML format"
  },
  yamlToJson: {
    input: `name: John
age: 30
city: New York`,
    output: '{\n  "name": "John",\n  "age": 30,\n  "city": "New York"\n}',
    description: "Convert YAML to JSON format"
  },
  csvToJson: {
    input: `name,age,city
John,30,New York
Jane,25,Boston`,
    output: '[\n  {\n    "name": "John",\n    "age": "30",\n    "city": "New York"\n  },\n  {\n    "name": "Jane",\n    "age": "25",\n    "city": "Boston"\n  }\n]',
    description: "Convert CSV to JSON format"
  }
};