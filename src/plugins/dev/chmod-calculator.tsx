import { Shield } from 'lucide-react';

import type { ToolPlugin } from '@/types/plugin';
import { failure, getTrimmedInput, success } from '@/utils';

interface Permission {
  read: boolean;
  write: boolean;
  execute: boolean;
}

interface Permissions {
  owner: Permission;
  group: Permission;
  other: Permission;
}

// Pure function: parse octal digit to permission
const parseOctalDigit = (n: string): Permission => {
  const num = Number.parseInt(n, 10);
  return {
    read: (num & 4) !== 0,
    write: (num & 2) !== 0,
    execute: (num & 1) !== 0,
  };
};

// Pure function: parse symbolic string to permission
const parseSymbolicChars = (s: string): Permission => ({
  read: s.startsWith('r'),
  write: s[1] === 'w',
  execute: s[2] === 'x',
});

// Pure function: parse numeric permission (e.g., "755")
const parseNumeric = (input: string): Permissions | null => {
  if (!/^[0-7]{3,4}$/.test(input)) return null;

  const digits = input.slice(-3);
  return {
    owner: parseOctalDigit(digits[0] ?? '0'),
    group: parseOctalDigit(digits[1] ?? '0'),
    other: parseOctalDigit(digits[2] ?? '0'),
  };
};

// Pure function: parse symbolic permission (e.g., "rwxr-xr-x")
const parseSymbolic = (input: string): Permissions | null => {
  const clean = input.replace(/^-/, '');
  if (!/^[rwx-]{9}$/.test(clean)) return null;

  return {
    owner: parseSymbolicChars(clean.slice(0, 3)),
    group: parseSymbolicChars(clean.slice(3, 6)),
    other: parseSymbolicChars(clean.slice(6, 9)),
  };
};

// Pure function: convert permission to numeric digit
const toDigit = (p: Permission): number => {
  return (p.read ? 4 : 0) + (p.write ? 2 : 0) + (p.execute ? 1 : 0);
};

// Pure function: convert permission to symbolic string
const toSymbolic = (p: Permission): string => {
  return (p.read ? 'r' : '-') + (p.write ? 'w' : '-') + (p.execute ? 'x' : '-');
};

// Pure function: format permissions to numeric
const toNumericString = (perms: Permissions): string => {
  return `${String(toDigit(perms.owner))}${String(toDigit(perms.group))}${String(toDigit(perms.other))}`;
};

// Pure function: format permissions to symbolic
const toSymbolicString = (perms: Permissions): string => {
  return `${toSymbolic(perms.owner)}${toSymbolic(perms.group)}${toSymbolic(perms.other)}`;
};

// Pure function: describe permission
const describePermission = (p: Permission, role: string): string => {
  const parts: string[] = [];
  if (p.read) parts.push('read');
  if (p.write) parts.push('write');
  if (p.execute) parts.push('execute');
  return `${role}: ${parts.length > 0 ? parts.join(', ') : 'none'}`;
};

// Pure function: parse input (auto-detect format)
const parseInput = (input: string): Permissions | null => {
  const trimmed = input.trim();
  return parseNumeric(trimmed) ?? parseSymbolic(trimmed);
};

export const chmodCalculator: ToolPlugin = {
  id: 'chmod',
  label: 'Chmod Calculator',
  description: 'Calculate and convert Unix file permissions online',
  category: 'dev',
  icon: <Shield className="h-4 w-4" />,
  keywords: ['chmod', 'permission', 'unix', 'linux', 'file', 'rwx', '755', '644'],
  inputs: [
    {
      id: 'input',
      label: 'Permission',
      type: 'text',
      placeholder: '755 or rwxr-xr-x',
      required: true,
      helpText: 'Enter numeric (755) or symbolic (rwxr-xr-x)',
    },
  ],
  transformer: (inputs) => {
    const input = getTrimmedInput(inputs, 'input');

    if (!input) {
      return failure('Please enter a permission value');
    }

    const perms = parseInput(input);
    if (!perms) {
      return failure('Invalid format. Use 755 or rwxr-xr-x');
    }

    const numeric = toNumericString(perms);
    const symbolic = toSymbolicString(perms);

    const breakdown = [
      describePermission(perms.owner, 'Owner'),
      describePermission(perms.group, 'Group'),
      describePermission(perms.other, 'Other'),
    ].join('\n');

    return success(breakdown, {
      _viewMode: 'sections',
      _sections: {
        stats: [
          {
            label: 'Numeric',
            value: numeric,
            tooltip: 'Octal format: 4=read, 2=write, 1=execute. Sum for each role.',
          },
          {
            label: 'Symbolic',
            value: symbolic,
            tooltip: 'Letters format: r=read, w=write, x=execute, -=denied.',
          },
          { label: 'Full', value: `-${symbolic}` },
        ],
        content: breakdown,
        contentLabel: 'Breakdown',
      },
    });
  },
};
