import { describe, expect, it } from 'vitest';

import { textDiff } from '@/plugins/text/text-diff';

interface WordDiff {
  type: 'equal' | 'added' | 'removed';
  value: string;
}

interface LineDiffResult {
  type: 'equal' | 'added' | 'removed';
  content: string;
  oldLineNum?: number;
  newLineNum?: number;
  wordDiffs?: WordDiff[];
}

interface DiffData {
  lines: LineDiffResult[];
  stats: { insertions: number; deletions: number };
  viewMode?: 'inline' | 'side-by-side';
  hasWordHighlighting?: boolean;
}

describe('Text Diff Plugin', () => {
  it('should identify intra-line differences for single line modification', async () => {
    const result = await textDiff.transformer({
      oldText: 'hong tu is good',
      newText: 'hong tu is bad',
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const diffData = result.meta?._diffData as DiffData;
    expect(diffData).toBeDefined();
    expect(diffData.lines).toHaveLength(2);

    const deleteLine = diffData.lines[0];
    const insertLine = diffData.lines[1];

    expect(deleteLine).toBeDefined();
    expect(insertLine).toBeDefined();

    if (!deleteLine || !insertLine) return;

    expect(deleteLine.type).toBe('removed');
    expect(insertLine.type).toBe('added');

    // Check word-level highlights
    expect(deleteLine.wordDiffs).toBeDefined();
    expect(insertLine.wordDiffs).toBeDefined();

    // Verify 'good' is marked as removed in the old line
    const deletedWord = deleteLine.wordDiffs?.find(
      (p) => p.type === 'removed' && p.value.includes('good')
    );
    expect(deletedWord).toBeDefined();

    // Verify 'bad' is marked as added in the new line
    const insertedWord = insertLine.wordDiffs?.find(
      (p) => p.type === 'added' && p.value.includes('bad')
    );
    expect(insertedWord).toBeDefined();
  });

  it('should handle multi-line inputs with modifications', async () => {
    const oldText = 'line 1\nline 2 changes\nline 3';
    const newText = 'line 1\nline 2 fixed\nline 3';

    const result = await textDiff.transformer({
      oldText,
      newText,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const diffData = result.meta?._diffData as DiffData;
    expect(diffData.lines).toHaveLength(4);

    const modDel = diffData.lines[1];
    const modIns = diffData.lines[2];

    expect(modDel).toBeDefined();
    expect(modIns).toBeDefined();

    if (!modDel || !modIns) return;

    expect(modDel.type).toBe('removed');
    expect(modIns.type).toBe('added');

    expect(modDel.wordDiffs?.some((p) => p.type === 'removed' && p.value === 'changes')).toBe(true);
    expect(modIns.wordDiffs?.some((p) => p.type === 'added' && p.value === 'fixed')).toBe(true);
  });
});
