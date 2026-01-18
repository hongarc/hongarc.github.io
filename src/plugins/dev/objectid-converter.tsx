import { ArrowDownUp, Check, Copy, Database } from 'lucide-react';
import { useCallback, useState } from 'react';

import type { ToolPlugin } from '@/types/plugin';
import { success } from '@/utils';

// ObjectId structure: 4 bytes timestamp + 5 bytes random + 3 bytes counter
const OBJECTID_LENGTH = 24;
const TIMESTAMP_HEX_LENGTH = 8;

// Validate ObjectId format (24 hex characters)
const isValidObjectId = (str: string): boolean => {
  if (str.length !== OBJECTID_LENGTH) return false;
  return /^[\da-f]{24}$/i.test(str);
};

// Extract timestamp from ObjectId (first 4 bytes = 8 hex chars)
const extractTimestamp = (objectId: string): number => {
  const timestampHex = objectId.slice(0, TIMESTAMP_HEX_LENGTH);
  return Number.parseInt(timestampHex, 16);
};

// Generate ObjectId prefix from timestamp (for querying documents by date)
const generateObjectIdPrefix = (timestamp: number): string => {
  const hex = Math.floor(timestamp).toString(16).padStart(TIMESTAMP_HEX_LENGTH, '0');
  return `${hex}0000000000000000`;
};

// Format date to ISO string without milliseconds for cleaner display
const formatIsoTimestamp = (date: Date): string => {
  return date.toISOString().replace('.000Z', 'Z');
};

// Parse ISO timestamp string to Date
const parseIsoTimestamp = (iso: string): Date | null => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
};

// Copy button component
function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // Clipboard API failed
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-all ${
        copied
          ? 'bg-ctp-green/20 text-ctp-green'
          : 'text-ctp-subtext1 hover:bg-ctp-surface0 hover:text-ctp-text'
      }`}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {label ?? (copied ? 'Copied' : 'Copy')}
    </button>
  );
}

// Get initial values based on current time
const getInitialValues = () => {
  const now = new Date();
  const unixSeconds = Math.floor(now.getTime() / 1000);
  return {
    objectId: generateObjectIdPrefix(unixSeconds),
    timestamp: formatIsoTimestamp(now),
  };
};

// Main custom component with bidirectional binding (Observer Pattern)
function ObjectIdConverterComponent() {
  const [objectId, setObjectId] = useState(() => getInitialValues().objectId);
  const [timestamp, setTimestamp] = useState(() => getInitialValues().timestamp);
  const [lastEdited, setLastEdited] = useState<'objectId' | 'timestamp' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle ObjectId change -> update timestamp
  const handleObjectIdChange = useCallback((value: string) => {
    setObjectId(value);
    setLastEdited('objectId');
    setError(null);

    const trimmed = value.trim();
    if (!trimmed) {
      setTimestamp('');
      return;
    }

    if (isValidObjectId(trimmed)) {
      const unixSeconds = extractTimestamp(trimmed);
      const date = new Date(unixSeconds * 1000);
      setTimestamp(formatIsoTimestamp(date));
    } else if (trimmed.length === OBJECTID_LENGTH) {
      setError('Invalid ObjectId format');
    }
  }, []);

  // Handle timestamp change -> update ObjectId
  const handleTimestampChange = useCallback((value: string) => {
    setTimestamp(value);
    setLastEdited('timestamp');
    setError(null);

    const trimmed = value.trim();
    if (!trimmed) {
      setObjectId('');
      return;
    }

    const date = parseIsoTimestamp(trimmed);
    if (date) {
      const unixSeconds = Math.floor(date.getTime() / 1000);
      setObjectId(generateObjectIdPrefix(unixSeconds));
    } else {
      setError('Invalid timestamp format');
    }
  }, []);

  const unixSeconds = timestamp ? Math.floor(new Date(timestamp).getTime() / 1000) : 0;
  const mongoQuery = objectId
    ? `db.collection.find({ _id: { $gte: ObjectId("${objectId}") } })`
    : '';

  return (
    <div className="space-y-4">
      {/* Bidirectional inputs */}
      <div className="space-y-3">
        {/* ObjectId Input */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="objectId" className="text-ctp-subtext1 text-xs font-medium">
              ObjectId
            </label>
            {objectId && <CopyButton text={objectId} />}
          </div>
          <input
            id="objectId"
            type="text"
            value={objectId}
            onChange={(e) => {
              handleObjectIdChange(e.target.value);
            }}
            placeholder="507f1f77bcf86cd799439011"
            className={`bg-ctp-mantle border-ctp-surface1 text-ctp-text placeholder:text-ctp-overlay0 focus:border-ctp-blue focus:ring-ctp-blue/20 w-full rounded-lg border px-3 py-2 font-mono text-sm focus:ring-2 focus:outline-none ${
              lastEdited === 'objectId' && error ? 'border-ctp-red' : ''
            }`}
          />
        </div>

        {/* Sync indicator */}
        <div className="flex justify-center">
          <div className="bg-ctp-surface0 text-ctp-overlay1 rounded-full p-1.5">
            <ArrowDownUp className="h-4 w-4" />
          </div>
        </div>

        {/* Timestamp Input */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="timestamp" className="text-ctp-subtext1 text-xs font-medium">
              ISO Timestamp
            </label>
            {timestamp && <CopyButton text={timestamp} />}
          </div>
          <input
            id="timestamp"
            type="text"
            value={timestamp}
            onChange={(e) => {
              handleTimestampChange(e.target.value);
            }}
            placeholder="2024-01-01T00:00:00Z"
            className={`bg-ctp-mantle border-ctp-surface1 text-ctp-text placeholder:text-ctp-overlay0 focus:border-ctp-blue focus:ring-ctp-blue/20 w-full rounded-lg border px-3 py-2 font-mono text-sm focus:ring-2 focus:outline-none ${
              lastEdited === 'timestamp' && error ? 'border-ctp-red' : ''
            }`}
          />
        </div>
      </div>

      {/* Error message */}
      {error && <p className="text-ctp-red text-xs">{error}</p>}

      {/* Info display */}
      {objectId && timestamp && !error && (
        <div className="space-y-3">
          {/* Stats row */}
          <div className="bg-ctp-mantle flex items-center justify-between rounded-lg px-3 py-2">
            <span className="text-ctp-subtext1 text-xs">Unix Timestamp</span>
            <div className="flex items-center gap-2">
              <span className="text-ctp-text font-mono text-sm">{unixSeconds}</span>
              <CopyButton text={String(unixSeconds)} />
            </div>
          </div>

          {/* MongoDB Query */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-ctp-subtext1 text-xs font-medium">MongoDB Query</span>
              <CopyButton text={mongoQuery} />
            </div>
            <pre className="bg-ctp-mantle border-ctp-surface1 text-ctp-text overflow-x-auto rounded-lg border p-3 font-mono text-xs">
              {mongoQuery}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export const objectIdConverter: ToolPlugin = {
  id: 'objectid',
  label: 'MongoDB ObjectId Tool',
  description: 'Convert MongoDB ObjectId to timestamp and generate ObjectId online',
  category: 'dev',
  icon: <Database className="h-4 w-4" />,
  keywords: ['mongodb', 'objectid', 'timestamp', 'bson', 'id', 'convert', 'mongo'],
  inputs: [],
  transformer: () => success(''),
  customComponent: ObjectIdConverterComponent,
};
