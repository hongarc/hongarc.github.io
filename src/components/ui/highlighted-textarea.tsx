import { forwardRef, useMemo, useRef, useEffect } from 'react';

import type { HighlightRange } from '@/types/highlight';

interface HighlightedTextareaProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  /** Ranges to highlight - generic interface for any highlighting needs */
  ranges: HighlightRange[];
  placeholder?: string;
  rows?: number;
  /** Custom color palette - cycles through these for different groups */
  colors?: string[];
}

// Default Catppuccin color palette for highlights
const DEFAULT_COLORS = [
  'bg-ctp-blue/30',
  'bg-ctp-green/30',
  'bg-ctp-yellow/30',
  'bg-ctp-mauve/30',
  'bg-ctp-pink/30',
  'bg-ctp-peach/30',
];

interface Segment {
  text: string;
  isHighlight: boolean;
  colorIndex: number;
  className?: string;
}

/**
 * Build text segments with highlighting info
 * Pure function - easy to test and memoize
 */
const buildSegments = (text: string, ranges: HighlightRange[]): Segment[] => {
  if (ranges.length === 0) {
    return [{ text, isHighlight: false, colorIndex: -1 }];
  }

  const segments: Segment[] = [];
  let lastIndex = 0;

  // Sort ranges by start index (copy to avoid mutation)
  const sortedRanges = [...ranges];
  sortedRanges.sort((a, b) => a.start - b.start);

  for (const [i, range] of sortedRanges.entries()) {
    // Add text before this range
    if (range.start > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, range.start),
        isHighlight: false,
        colorIndex: -1,
      });
    }

    // Add the highlighted range
    segments.push({
      text: text.slice(range.start, range.end),
      isHighlight: true,
      colorIndex: range.group ?? i,
      className: range.className,
    });

    lastIndex = range.end;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      isHighlight: false,
      colorIndex: -1,
    });
  }

  return segments;
};

export const HighlightedTextarea = forwardRef<HTMLTextAreaElement, HighlightedTextareaProps>(
  ({ id, value, onChange, ranges, placeholder, rows = 6, colors = DEFAULT_COLORS }, ref) => {
    const backdropRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Memoize segments to avoid recalculating on every render
    const segments = useMemo(() => buildSegments(value, ranges), [value, ranges]);

    // Sync scroll between textarea and backdrop
    const handleScroll = () => {
      if (backdropRef.current && textareaRef.current) {
        backdropRef.current.scrollTop = textareaRef.current.scrollTop;
        backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
      }
    };

    // Get color for a segment
    const getColor = (index: number): string => {
      if (index < 0) return '';
      return colors[index % colors.length] ?? colors[0] ?? DEFAULT_COLORS[0] ?? '';
    };

    // Forward ref handling
    useEffect(() => {
      if (typeof ref === 'function') {
        ref(textareaRef.current);
      } else if (ref) {
        ref.current = textareaRef.current;
      }
    }, [ref]);

    return (
      <div className="relative">
        {/* Backdrop with highlights */}
        <div
          ref={backdropRef}
          className="bg-ctp-mantle border-ctp-surface1 pointer-events-none absolute inset-0 overflow-auto rounded-lg border px-3.5 py-2.5 font-mono text-[13px] leading-relaxed break-words whitespace-pre-wrap text-transparent"
          aria-hidden="true"
        >
          {segments.map((segment, i) =>
            segment.isHighlight ? (
              <mark
                key={i}
                className={`${segment.className ?? getColor(segment.colorIndex)} rounded-sm`}
              >
                {segment.text}
              </mark>
            ) : (
              <span key={i}>{segment.text}</span>
            )
          )}
          {'\n'}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          id={id}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          onScroll={handleScroll}
          placeholder={placeholder}
          rows={rows}
          className="text-ctp-text placeholder:text-ctp-overlay0 focus:border-ctp-blue focus:ring-ctp-blue/20 relative w-full resize-y rounded-lg border border-transparent bg-transparent px-3.5 py-2.5 font-mono text-[13px] leading-relaxed break-words whitespace-pre-wrap caret-current focus:ring-2 focus:outline-none"
          style={{ background: 'transparent' }}
        />
      </div>
    );
  }
);

HighlightedTextarea.displayName = 'HighlightedTextarea';
