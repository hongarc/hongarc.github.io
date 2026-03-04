import { CodeTextarea } from '@/components/ui/code-textarea';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { SegmentedControl } from '@/components/ui/segmented-control';
import type { InputConfig } from '@/types/plugin';

interface ToolInputProps {
  config: InputConfig;
  value: unknown;
  onChange: (value: unknown) => void;
}

const getStringValue = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
};

export function ToolInput({ config, value, onChange }: ToolInputProps) {
  const baseInputClass =
    'w-full rounded-lg border border-ctp-surface1 bg-ctp-mantle px-3.5 py-2.5 text-sm text-ctp-text shadow-sm placeholder-ctp-overlay0 transition-all focus:border-ctp-blue focus:outline-none focus:ring-4 focus:ring-ctp-blue/10';

  const renderInput = () => {
    switch (config.type) {
      case 'textarea': {
        // Use CodeTextarea for syntax highlighting if codeLanguage is specified
        if (config.codeLanguage) {
          return (
            <CodeTextarea
              id={config.id}
              value={getStringValue(value)}
              onChange={(v) => {
                onChange(v);
              }}
              language={config.codeLanguage}
              placeholder={config.placeholder}
              rows={config.rows ?? 6}
              required={config.required}
            />
          );
        }
        return (
          <textarea
            id={config.id}
            value={getStringValue(value)}
            onChange={(e) => {
              onChange(e.target.value);
            }}
            placeholder={config.placeholder}
            rows={config.rows ?? 6}
            className={`${baseInputClass} resize-y font-mono text-[13px] leading-relaxed`}
            required={config.required}
          />
        );
      }

      case 'number': {
        return (
          <input
            type="number"
            id={config.id}
            value={value === undefined ? '' : Number(value)}
            onChange={(e) => {
              onChange(e.target.valueAsNumber);
            }}
            placeholder={config.placeholder}
            min={config.min}
            max={config.max}
            className={baseInputClass}
            required={config.required}
          />
        );
      }

      case 'select': {
        const options = config.options ?? [];
        // Use searchable select if marked as searchable
        if (config.searchable) {
          return (
            <SearchableSelect
              id={config.id}
              options={options}
              value={getStringValue(value)}
              onChange={(v) => {
                onChange(v);
              }}
              placeholder={config.placeholder}
              required={config.required}
            />
          );
        }
        // Use segmented control for 5 or fewer options, searchable select for more
        if (options.length <= 5) {
          return (
            <SegmentedControl
              id={config.id}
              options={options}
              value={getStringValue(value)}
              onChange={(v) => {
                onChange(v);
              }}
            />
          );
        }
        return (
          <SearchableSelect
            id={config.id}
            options={options}
            value={getStringValue(value)}
            onChange={(v) => {
              onChange(v);
            }}
            placeholder={config.placeholder}
            required={config.required}
          />
        );
      }

      case 'checkbox': {
        return (
          <label className="inline-flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              id={config.id}
              checked={Boolean(value)}
              onChange={(e) => {
                onChange(e.target.checked);
              }}
              className="border-ctp-surface1 bg-ctp-mantle text-ctp-blue h-4 w-4 cursor-pointer rounded transition-colors focus:ring-2 focus:ring-ctp-blue/10"
            />
            <span className="text-ctp-subtext1 text-sm">{config.label}</span>
          </label>
        );
      }

      case 'file': {
        return (
          <input
            type="file"
            id={config.id}
            accept={config.accept}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onChange(file);
              }
            }}
            className={`${baseInputClass} cursor-pointer file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-ctp-blue/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ctp-blue hover:file:bg-ctp-blue/20`}
            required={config.required}
          />
        );
      }

      default: {
        return (
          <input
            type="text"
            id={config.id}
            value={getStringValue(value)}
            onChange={(e) => {
              onChange(e.target.value);
            }}
            placeholder={config.placeholder}
            pattern={config.pattern}
            className={baseInputClass}
            required={config.required}
          />
        );
      }
    }
  };

  return (
    <div className="space-y-1.5">
      {config.type !== 'checkbox' && (
        <label
          htmlFor={config.id}
          className="text-ctp-subtext1 block text-sm font-medium"
        >
          {config.label}
          {config.required && <span className="text-ctp-red ml-1">*</span>}
        </label>
      )}
      {renderInput()}
      {config.helpText && (
        <p className="text-ctp-overlay0 text-xs">{config.helpText}</p>
      )}
    </div>
  );
}
