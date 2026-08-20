import { FileSearch } from 'lucide-react';

import type { OutputStat } from '@/components/ui/sectioned-output';
import {
  HEAD_BYTES,
  checkAllowList,
  checkExtension,
  checkSize,
  compareDeclared,
  decodeTextHead,
  extensionOf,
  formatByteSize,
  readImageSize,
  readTextFacts,
  type Verdict,
} from '@/domain/file/inspect';
import { detectType } from '@/domain/file/signature';
import type { ToolPlugin } from '@/types/plugin';
import {
  failure,
  getErrorMessage,
  getNumberInput,
  getTrimmedInput,
  instruction,
  success,
} from '@/utils';

/** Map a verdict level onto the badge variants the sections view understands. */
const VERDICT_VARIANTS: Record<Verdict['level'], OutputStat['variant']> = {
  pass: 'success',
  warn: 'warning',
  fail: 'error',
};

const toStat = (label: string, verdict: Verdict): OutputStat => ({
  label,
  value: verdict.summary,
  type: 'badge',
  variant: VERDICT_VARIANTS[verdict.level],
  tooltip: verdict.detail,
});

export const fileInspector: ToolPlugin = {
  id: 'file-inspector',
  label: 'File Inspector',
  description:
    'Identify a file from its magic bytes and compare that with what its name and mimetype claim. Reads the file in your browser — nothing is uploaded.',
  category: 'dev',
  icon: <FileSearch className="h-4 w-4" />,
  keywords: [
    'file',
    'mime',
    'mimetype',
    'magic bytes',
    'signature',
    'file type',
    'upload',
    'validate',
    'spoof',
    'extension',
    'encoding',
    'bom',
    'csv',
    'delimiter',
    'image size',
    'dimensions',
  ],
  isAsync: true,
  preferFresh: true,
  inputs: [
    {
      id: 'file',
      label: 'File',
      type: 'file',
      accept: '*/*',
      sensitive: true,
      helpText: 'Read locally in your browser. Only the first 64 KB is examined.',
    },
    {
      id: 'allowedTypes',
      label: 'Allowed types (optional)',
      type: 'text',
      placeholder: 'text/csv, application/pdf, image/*, .xlsx',
      helpText:
        'Mimetypes, wildcards or extensions your upload accepts, comma separated. Leave empty to skip the allow-list check.',
    },
    {
      id: 'maxSizeMb',
      label: 'Max size (MB)',
      type: 'number',
      defaultValue: 0,
      min: 0,
      max: 4096,
      helpText: '0 means no size check.',
    },
  ],
  transformer: async (inputs) => {
    const file = inputs.file as File | undefined;
    const allowedTypes = getTrimmedInput(inputs, 'allowedTypes');
    const maxSizeMb = getNumberInput(inputs, 'maxSizeMb');

    if (!file) {
      return instruction('Choose a file to see what it actually is, and what it claims to be');
    }

    try {
      const head = new Uint8Array(await file.slice(0, HEAD_BYTES).arrayBuffer());
      const detected = detectType(head);
      const declared = file.type.trim();
      const extension = extensionOf(file.name);

      const declaredVerdict = compareDeclared(declared, detected);
      const extensionVerdict = checkExtension(file.name, declared);
      const allowListVerdict = checkAllowList(allowedTypes, file.name, declared);
      const sizeVerdict = checkSize(file.size, maxSizeMb);

      const stats: OutputStat[] = [
        { label: 'Detected from bytes', value: detected.label },
        { label: 'Declared (file.type)', value: declared.length > 0 ? declared : 'empty' },
        { label: 'Extension', value: extension.length > 0 ? `.${extension}` : 'none' },
        { label: 'Size', value: formatByteSize(file.size) },
        toStat('Declared vs bytes', declaredVerdict),
        toStat('Name vs declared', extensionVerdict),
      ];

      if (allowListVerdict) stats.push(toStat('Allow-list', allowListVerdict));
      if (sizeVerdict) stats.push(toStat('Size limit', sizeVerdict));

      const reportLines: string[] = [
        `Name         ${file.name}`,
        `Size         ${String(file.size)} bytes (${formatByteSize(file.size)})`,
        `Modified     ${new Date(file.lastModified).toISOString()}`,
        `Declared     ${declared.length > 0 ? declared : '(empty — the browser had no mapping)'}`,
        `Detected     ${detected.label}`,
        `Verdict      ${declaredVerdict.detail}`,
        `Name check   ${extensionVerdict.detail}`,
      ];

      if (allowListVerdict) reportLines.push(`Allow-list   ${allowListVerdict.detail}`);
      if (sizeVerdict) reportLines.push(`Size limit   ${sizeVerdict.detail}`);

      if (detected.mimetypes.length > 0) {
        reportLines.push(`Bytes fit    ${detected.mimetypes.join(', ')}`);
      }

      const image = readImageSize(head);
      if (image) {
        const pixels = `${String(image.width)} x ${String(image.height)} px`;
        stats.push({ label: 'Dimensions', value: pixels });
        reportLines.push(`Dimensions   ${pixels}`);
      }

      const text = detected.family === 'text' ? decodeTextHead(head) : null;
      if (text !== null) {
        const facts = readTextFacts(head, text);
        stats.push({ label: 'Encoding', value: facts.encoding });

        if (facts.delimiter) {
          const shape = `${String(facts.delimiter.columns)} columns, ${facts.delimiter.name}`;
          stats.push({
            label: 'Delimited shape',
            value: facts.delimiter.consistent ? shape : `${shape}, uneven`,
            type: 'badge',
            variant: facts.delimiter.consistent ? 'success' : 'warning',
            tooltip: facts.delimiter.consistent
              ? 'Every sampled line has the same column count.'
              : 'The column count changes between lines — an unquoted delimiter is the usual cause.',
          });
        }

        reportLines.push(
          `Encoding     ${facts.encoding}${facts.hasBom ? ' (byte order mark present)' : ''}`,
          `Line endings ${facts.lineEndings}`,
          `Sampled      ${String(facts.sampledLines)} non-empty lines in the first 64 KB`
        );

        if (facts.delimiter) {
          const evenness = facts.delimiter.consistent ? 'consistent' : 'inconsistent across lines';
          const columns = String(facts.delimiter.columns);
          reportLines.push(`Delimiter    ${facts.delimiter.name}, ${columns} columns, ${evenness}`);
        }
      }

      const content = reportLines.join('\n');

      return success(content, {
        _viewMode: 'sections',
        _sections: { stats, content, contentLabel: 'Inspection' },
      });
    } catch (error) {
      return failure(getErrorMessage(error));
    }
  },
};
