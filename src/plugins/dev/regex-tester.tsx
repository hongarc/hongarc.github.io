import { Regex } from 'lucide-react';

import type { ToolPlugin } from '@/types/plugin';
import { failure, getBooleanInput, getTrimmedInput, success } from '@/utils';

interface MatchResult {
  match: string;
  index: number;
  groups: string[];
}

// Pure function: parse regex pattern and flags
const parseRegex = (pattern: string, flags: string): RegExp | null => {
  try {
    return new RegExp(pattern, flags);
  } catch {
    return null;
  }
};

// Pure function: get all matches with groups
const getMatches = (regex: RegExp, text: string): MatchResult[] => {
  const matches: MatchResult[] = [];
  const globalRegex = new RegExp(
    regex.source,
    regex.flags.includes('g') ? regex.flags : `${regex.flags}g`
  );

  let result;
  while ((result = globalRegex.exec(text)) !== null) {
    matches.push({
      match: result[0],
      index: result.index,
      groups: result.slice(1),
    });
    // Prevent infinite loop for zero-length matches
    if (result[0].length === 0) {
      globalRegex.lastIndex++;
    }
  }

  return matches;
};

// Pure function: format matches output
const formatMatches = (matches: MatchResult[]): string => {
  if (matches.length === 0) {
    return 'No matches found';
  }

  const lines: string[] = [
    `Found ${String(matches.length)} match${matches.length === 1 ? '' : 'es'}:`,
    '',
  ];

  for (const [i, m] of matches.entries()) {
    lines.push(`Match ${String(i + 1)} at index ${String(m.index)}:`, `  "${m.match}"`);
    if (m.groups.length > 0) {
      for (const [gi, g] of m.groups.entries()) {
        lines.push(`  Group ${String(gi + 1)}: "${g}"`);
      }
    }
    lines.push('');
  }

  return lines.join('\n');
};

export const regexTester: ToolPlugin = {
  id: 'regex',
  label: 'Regex Tester',
  description: 'Test and debug regular expressions online with match highlighting',
  category: 'dev',
  icon: <Regex className="h-4 w-4" />,
  keywords: ['regex', 'regexp', 'regular', 'expression', 'pattern', 'match', 'test'],
  inputs: [
    {
      id: 'pattern',
      label: 'Pattern',
      type: 'text',
      placeholder: String.raw`\d+|[a-z]+`,
      required: true,
      helpText: 'Regular expression pattern (without delimiters)',
    },
    {
      id: 'text',
      label: 'Test String',
      type: 'textarea',
      placeholder: 'Enter text to test against...',
      required: true,
      rows: 5,
    },
    {
      id: 'caseInsensitive',
      label: 'i (ignore case)',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      id: 'multiline',
      label: 'm (multiline)',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      id: 'dotAll',
      label: 's (dot all)',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
  transformer: (inputs) => {
    const pattern = getTrimmedInput(inputs, 'pattern');
    const text = (inputs.text as string | undefined) ?? '';
    const caseInsensitive = getBooleanInput(inputs, 'caseInsensitive');
    const multiline = getBooleanInput(inputs, 'multiline');
    const dotAll = getBooleanInput(inputs, 'dotAll');

    if (!pattern) {
      return failure('Please enter a regex pattern');
    }

    if (!text) {
      return failure('Please enter test text');
    }

    // Build flags
    let flags = 'g';
    if (caseInsensitive) flags += 'i';
    if (multiline) flags += 'm';
    if (dotAll) flags += 's';

    const regex = parseRegex(pattern, flags);
    if (!regex) {
      return failure('Invalid regular expression pattern');
    }

    const matches = getMatches(regex, text);
    const matchOutput = formatMatches(matches);

    const output = [`Pattern: /${pattern}/${flags}`, '', matchOutput].join('\n');

    return success(output, {
      matches: matches.length,
      flags,
      _viewMode: 'regex',
      _regexData: { text, matches },
    });
  },
};
