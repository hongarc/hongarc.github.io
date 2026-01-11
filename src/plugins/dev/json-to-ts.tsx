import { Braces } from 'lucide-react';

import type { ToolPlugin } from '@/types/plugin';
import { failure, getBooleanInput, getSelectInput, getTrimmedInput, success } from '@/utils';

const ROOT_NAME_OPTIONS = ['Root', 'Data', 'Response', 'Result'] as const;

// Infer TypeScript type from a value
const inferType = (
  value: unknown,
  interfaces: Map<string, string>,
  depth: number,
  rootName: string
): string => {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';

  const type = typeof value;

  switch (type) {
    case 'string': {
      return 'string';
    }
    case 'number': {
      return Number.isInteger(value) ? 'number' : 'number';
    }
    case 'boolean': {
      return 'boolean';
    }
    case 'object': {
      if (Array.isArray(value)) {
        if (value.length === 0) return 'unknown[]';

        // Get types of all elements
        const elementTypes = new Set<string>();
        for (const item of value) {
          elementTypes.add(inferType(item, interfaces, depth + 1, rootName));
        }

        // If all same type, use that
        if (elementTypes.size === 1) {
          const elementType = [...elementTypes][0] ?? 'unknown';
          return `${elementType}[]`;
        }

        // Mixed types - use union
        return `(${[...elementTypes].join(' | ')})[]`;
      }

      // Object - create interface
      return generateInterface(value as Record<string, unknown>, interfaces, depth, rootName);
    }
    default: {
      return 'unknown';
    }
  }
};

// Generate interface name from depth
const getInterfaceName = (depth: number, rootName: string, key?: string): string => {
  if (depth === 0) return rootName;
  if (key) {
    // Convert key to PascalCase
    return key
      .split(/[_-]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
  return `${rootName}Item`;
};

// Generate interface for an object
const generateInterface = (
  obj: Record<string, unknown>,
  interfaces: Map<string, string>,
  depth: number,
  rootName: string,
  interfaceName?: string
): string => {
  const name = interfaceName ?? getInterfaceName(depth, rootName);

  // Check if we already have this interface
  if (interfaces.has(name)) {
    return name;
  }

  // Reserve the name to prevent infinite recursion
  interfaces.set(name, '');

  const properties: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const propertyType = inferType(
      value,
      interfaces,
      depth + 1,
      getInterfaceName(depth + 1, rootName, key)
    );

    // Check if key needs quotes
    const needsQuotes = !/^[a-zA-Z_$][\w$]*$/.test(key);
    const propertyKey = needsQuotes ? `"${key}"` : key;

    properties.push(`  ${propertyKey}: ${propertyType};`);
  }

  const interfaceBody = properties.length > 0 ? `{\n${properties.join('\n')}\n}` : '{}';

  interfaces.set(name, `interface ${name} ${interfaceBody}`);

  return name;
};

// Main conversion function
const jsonToTypeScript = (json: unknown, rootName: string, exportInterfaces: boolean): string => {
  const interfaces = new Map<string, string>();

  if (typeof json !== 'object' || json === null) {
    return `type ${rootName} = ${inferType(json, interfaces, 0, rootName)};`;
  }

  if (Array.isArray(json)) {
    if (json.length === 0) {
      return `type ${rootName} = unknown[];`;
    }

    const itemType = inferType(json[0], interfaces, 1, `${rootName}Item`);
    const prefix = exportInterfaces ? 'export ' : '';

    // Generate interfaces first
    const interfaceDefinitions = [...interfaces.values()]
      .filter(Boolean)
      .map((i) => `${prefix}${i}`)
      .join('\n\n');

    const typeDefinition = `${prefix}type ${rootName} = ${itemType}[];`;

    return interfaceDefinitions ? `${interfaceDefinitions}\n\n${typeDefinition}` : typeDefinition;
  }

  // Object
  generateInterface(json as Record<string, unknown>, interfaces, 0, rootName, rootName);

  const prefix = exportInterfaces ? 'export ' : '';
  return [...interfaces.values()]
    .filter(Boolean)
    .map((i) => `${prefix}${i}`)
    .join('\n\n');
};

const SAMPLE_JSON = `{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "isActive": true,
  "tags": ["developer", "designer"],
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zipCode": "10001"
  },
  "orders": [
    { "id": 101, "total": 99.99 },
    { "id": 102, "total": 149.50 }
  ]
}`;

export const jsonToTs: ToolPlugin = {
  id: 'json-to-ts',
  label: 'JSON to TypeScript',
  description: 'Generate TypeScript interfaces from JSON',
  category: 'dev',
  icon: <Braces className="h-4 w-4" />,
  keywords: ['json', 'typescript', 'interface', 'type', 'convert', 'generate', 'ts'],
  inputs: [
    {
      id: 'input',
      label: 'JSON',
      type: 'textarea',
      placeholder: 'Paste your JSON here...',
      required: true,
      rows: 12,
    },
    {
      id: 'rootName',
      label: 'Root Type Name',
      type: 'select',
      defaultValue: 'Root',
      options: [
        { value: 'Root', label: 'Root' },
        { value: 'Data', label: 'Data' },
        { value: 'Response', label: 'Response' },
        { value: 'Result', label: 'Result' },
      ],
      group: 'options',
    },
    {
      id: 'exportInterfaces',
      label: 'Export interfaces',
      type: 'checkbox',
      defaultValue: true,
      group: 'options',
    },
  ],
  transformer: (inputs) => {
    const input = getTrimmedInput(inputs, 'input');
    const rootName = getSelectInput(inputs, 'rootName', ROOT_NAME_OPTIONS, 'Root');
    const exportInterfaces = getBooleanInput(inputs, 'exportInterfaces', true);

    if (!input) {
      return failure(`Please enter JSON data. Example:\n\n${SAMPLE_JSON}`);
    }

    try {
      const json = JSON.parse(input) as unknown;
      const typescript = jsonToTypeScript(json, rootName, exportInterfaces);

      // Count interfaces
      const interfaceCount = (typescript.match(/interface\s+\w+/g) ?? []).length;
      const typeCount = (typescript.match(/type\s+\w+/g) ?? []).length;

      return success(typescript, {
        interfaces: interfaceCount,
        types: typeCount,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Conversion failed';
      return failure(`Invalid JSON: ${message}`);
    }
  },
};
