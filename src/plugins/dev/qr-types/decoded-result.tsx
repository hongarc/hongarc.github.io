import { CopyButton } from '@/components/ui/copy-button';

import { qrTypeRegistry } from './registry';
import type { ActionData, InfoRowData, QRTypeStrategy } from './types';

// Info row component
function InfoRow({ label, value, copyable = false, link = false }: InfoRowData) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="text-ctp-subtext0 shrink-0 text-xs">{label}</span>
      <div className="flex min-w-0 items-center gap-2">
        {link ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ctp-blue hover:text-ctp-sapphire truncate text-sm underline"
          >
            {value}
          </a>
        ) : (
          <span className="text-ctp-text truncate text-sm font-medium">{value}</span>
        )}
        {copyable && <CopyButton text={value} variant="ghost" />}
      </div>
    </div>
  );
}

// Type badge component
function TypeBadge({ strategy }: { strategy: QRTypeStrategy }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`${strategy.badge.bg} ${strategy.badge.text} rounded px-2 py-0.5 text-xs font-medium`}
      >
        {strategy.label}
      </span>
      {strategy.subtitle && <span className="text-ctp-subtext1 text-xs">{strategy.subtitle}</span>}
    </div>
  );
}

// Action button component
function ActionButton({ action }: { action: ActionData }) {
  const colorClasses = `bg-${action.color}/10 text-${action.color} hover:bg-${action.color}/20`;

  return (
    <a
      href={action.href}
      target={action.external ? '_blank' : undefined}
      rel={action.external ? 'noopener noreferrer' : undefined}
      className={`${colorClasses} mt-2 block rounded-lg px-4 py-2 text-center text-sm font-medium transition-colors`}
    >
      {action.label}
    </a>
  );
}

// Raw data collapsible
function RawData({ content }: { content: string }) {
  return (
    <details className="text-xs">
      <summary className="text-ctp-subtext0 hover:text-ctp-text cursor-pointer">
        Show raw data
      </summary>
      <pre className="text-ctp-overlay1 mt-2 overflow-auto font-mono break-all whitespace-pre-wrap">
        {content}
      </pre>
    </details>
  );
}

// Main decoded result component
export function DecodedResult({ content }: { content: string }) {
  const result = qrTypeRegistry.parse(content);

  // Fallback for unparseable content (shouldn't happen with text fallback)
  if (!result) {
    return (
      <div className="bg-ctp-mantle border-ctp-surface1 rounded-lg border p-4">
        <pre className="text-ctp-text font-mono text-sm break-all whitespace-pre-wrap">
          {content}
        </pre>
      </div>
    );
  }

  const { strategy, parsed } = result;
  const { rows, action, showRaw } = strategy.render(parsed);

  // Special case for plain text - simpler display
  if (strategy.type === 'text') {
    return (
      <div className="bg-ctp-mantle border-ctp-surface1 rounded-lg border p-4">
        <div className="mb-2 flex items-center justify-between">
          <TypeBadge strategy={strategy} />
          <CopyButton text={content} />
        </div>
        <pre className="text-ctp-text font-mono text-sm break-all whitespace-pre-wrap">
          {content}
        </pre>
      </div>
    );
  }

  return (
    <div className="bg-ctp-mantle border-ctp-surface1 space-y-3 rounded-lg border p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <TypeBadge strategy={strategy} />
        <CopyButton text={content} />
      </div>

      {/* Info rows */}
      {rows.length > 0 && (
        <div className="divide-ctp-surface1 divide-y">
          {rows.map((row, i) => (
            <InfoRow key={`${row.label}-${String(i)}`} {...row} />
          ))}
        </div>
      )}

      {/* Action button */}
      {action && <ActionButton action={action} />}

      {/* Raw data */}
      {showRaw && <RawData content={content} />}
    </div>
  );
}
