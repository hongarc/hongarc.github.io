import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface JsonTreeProps {
  data: unknown;
  name?: string;
  defaultExpanded?: boolean;
}

interface JsonNodeProps {
  name: string | number;
  value: unknown;
  depth: number;
  defaultExpanded: boolean;
}

const getValueType = (value: unknown): string => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
};

const getValueColor = (type: string): string => {
  switch (type) {
    case 'string': {
      return 'text-green-600 dark:text-green-400';
    }
    case 'number': {
      return 'text-blue-600 dark:text-blue-400';
    }
    case 'boolean': {
      return 'text-purple-600 dark:text-purple-400';
    }
    case 'null': {
      return 'text-slate-400 dark:text-slate-500';
    }
    default: {
      return 'text-slate-900 dark:text-white';
    }
  }
};

function JsonNode({ name, value, depth, defaultExpanded }: JsonNodeProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded && depth < 2);
  const type = getValueType(value);
  const isExpandable = type === 'object' || type === 'array';
  const indent = depth * 16;

  const renderValue = () => {
    if (type === 'string') {
      return <span className={getValueColor(type)}>&quot;{String(value)}&quot;</span>;
    }
    if (type === 'null') {
      return <span className={getValueColor(type)}>null</span>;
    }
    if (type === 'boolean') {
      return <span className={getValueColor(type)}>{String(value)}</span>;
    }
    if (type === 'number') {
      return <span className={getValueColor(type)}>{String(value)}</span>;
    }
    return null;
  };

  const renderExpandable = () => {
    const isArray = Array.isArray(value);
    const entries = isArray
      ? (value as unknown[]).map((v, i) => [i, v] as const)
      : Object.entries(value as Record<string, unknown>);
    const count = entries.length;

    return (
      <div>
        <button
          type="button"
          onClick={() => {
            setIsExpanded(!isExpanded);
          }}
          className="-ml-1 flex cursor-pointer items-center gap-1 rounded px-1 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          )}
          <span className="text-slate-500 dark:text-slate-400">{name}</span>
          <span className="text-slate-400 dark:text-slate-500">:</span>
          <span className="text-slate-400 dark:text-slate-500">{isArray ? '[' : '{'}</span>
          {!isExpanded && (
            <>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {count} {count === 1 ? 'item' : 'items'}
              </span>
              <span className="text-slate-400 dark:text-slate-500">{isArray ? ']' : '}'}</span>
            </>
          )}
        </button>
        {isExpanded && (
          <div className="ml-2 border-l border-slate-200 dark:border-slate-700">
            {entries.map(([key, val]) => (
              <JsonNode
                key={String(key)}
                name={key}
                value={val}
                depth={depth + 1}
                defaultExpanded={defaultExpanded}
              />
            ))}
            <div className="pl-2 text-slate-400 dark:text-slate-500">{isArray ? ']' : '}'}</div>
          </div>
        )}
      </div>
    );
  };

  if (isExpandable) {
    return (
      <div style={{ paddingLeft: indent }} className="py-0.5 font-mono text-sm">
        {renderExpandable()}
      </div>
    );
  }

  return (
    <div style={{ paddingLeft: indent }} className="py-0.5 font-mono text-sm">
      <span className="text-slate-500 dark:text-slate-400">{name}</span>
      <span className="text-slate-400 dark:text-slate-500">: </span>
      {renderValue()}
    </div>
  );
}

export function JsonTree({ data, name = 'root', defaultExpanded = true }: JsonTreeProps) {
  const type = getValueType(data);

  if (type !== 'object' && type !== 'array') {
    return (
      <div className="font-mono text-sm">
        <span className={getValueColor(type)}>
          {type === 'string' ? `"${String(data)}"` : String(data)}
        </span>
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <JsonNode name={name} value={data} depth={0} defaultExpanded={defaultExpanded} />
    </div>
  );
}
