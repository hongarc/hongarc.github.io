import type { ParsedQRBase, QRTypeStrategy } from '../types';

interface ParsedEvent extends ParsedQRBase {
  type: 'event';
  summary: string | null;
  location: string | null;
  description: string | null;
  start: string | null;
  end: string | null;
}

// Helper to extract value from iCal field
const getValue = (content: string, key: string): string | null => {
  const regex = new RegExp(`^${key}[;:](.*)$`, 'im');
  const match = content.match(regex);
  const value = match?.[1];
  return value ? value.trim() : null;
};

export const eventStrategy: QRTypeStrategy<ParsedEvent> = {
  type: 'event',
  label: 'Event',
  badge: { bg: 'bg-ctp-lavender/20', text: 'text-ctp-lavender' },
  subtitle: 'Calendar',

  canParse: (content) => content.includes('BEGIN:VEVENT'),

  parse: (content) => ({
    type: 'event',
    summary: getValue(content, 'SUMMARY'),
    location: getValue(content, 'LOCATION'),
    description: getValue(content, 'DESCRIPTION'),
    start: getValue(content, 'DTSTART'),
    end: getValue(content, 'DTEND'),
    raw: content,
  }),

  render: (parsed) => ({
    rows: [
      ...(parsed.summary ? [{ label: 'Event', value: parsed.summary }] : []),
      ...(parsed.location ? [{ label: 'Location', value: parsed.location }] : []),
      ...(parsed.start ? [{ label: 'Start', value: parsed.start }] : []),
      ...(parsed.end ? [{ label: 'End', value: parsed.end }] : []),
      ...(parsed.description ? [{ label: 'Description', value: parsed.description }] : []),
    ],
    showRaw: true,
  }),
};
