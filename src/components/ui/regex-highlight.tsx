interface Match {
  match: string;
  index: number;
  groups: string[];
}

interface RegexHighlightProps {
  text: string;
  matches: Match[];
}

// Colors for matches (cycling through for multiple matches)
const MATCH_COLORS = [
  'bg-blue-200 dark:bg-blue-500/40',
  'bg-green-200 dark:bg-green-500/40',
  'bg-yellow-200 dark:bg-yellow-500/40',
  'bg-purple-200 dark:bg-purple-500/40',
  'bg-pink-200 dark:bg-pink-500/40',
  'bg-orange-200 dark:bg-orange-500/40',
];

const getMatchColor = (index: number): string => {
  return (
    MATCH_COLORS[index % MATCH_COLORS.length] ??
    MATCH_COLORS[0] ??
    'bg-blue-200 dark:bg-blue-500/40'
  );
};

export function RegexHighlight({ text, matches }: RegexHighlightProps) {
  if (matches.length === 0) {
    return (
      <pre className="font-mono text-[13px] leading-relaxed break-all whitespace-pre-wrap text-slate-700 dark:text-slate-300">
        {text}
      </pre>
    );
  }

  // Build segments with highlighting
  const segments: { text: string; isMatch: boolean; matchIndex: number }[] = [];
  let lastIndex = 0;

  // Sort matches by index
  const sortedMatches: Match[] = [...matches];
  sortedMatches.sort((a, b) => a.index - b.index);

  for (const [i, match] of sortedMatches.entries()) {
    // Add text before this match
    if (match.index > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, match.index),
        isMatch: false,
        matchIndex: -1,
      });
    }

    // Add the match
    segments.push({
      text: match.match,
      isMatch: true,
      matchIndex: i,
    });

    lastIndex = match.index + match.match.length;
  }

  // Add remaining text after last match
  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      isMatch: false,
      matchIndex: -1,
    });
  }

  return (
    <pre className="font-mono text-[13px] leading-relaxed break-all whitespace-pre-wrap text-slate-700 dark:text-slate-300">
      {segments.map((segment, i) =>
        segment.isMatch ? (
          <mark
            key={i}
            className={`${getMatchColor(segment.matchIndex)} rounded px-0.5`}
            title={`Match ${String(segment.matchIndex + 1)}`}
          >
            {segment.text}
          </mark>
        ) : (
          <span key={i}>{segment.text}</span>
        )
      )}
    </pre>
  );
}
