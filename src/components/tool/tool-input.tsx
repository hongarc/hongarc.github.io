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
    'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-800';

  const renderInput = () => {
    switch (config.type) {
      case 'textarea': {
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
        // Use segmented control for 5 or fewer options, dropdown for more
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
          <select
            id={config.id}
            value={getStringValue(value)}
            onChange={(e) => {
              onChange(e.target.value);
            }}
            className={`${baseInputClass} cursor-pointer`}
            required={config.required}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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
              className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 transition-colors focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">{config.label}</span>
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
            className={`${baseInputClass} cursor-pointer file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-500/10 dark:file:text-blue-400`}
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
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {config.label}
          {config.required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      {renderInput()}
      {config.helpText && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{config.helpText}</p>
      )}
    </div>
  );
}
