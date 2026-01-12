import { ArrowRight, Command, Pin, RotateCcw, Sparkles, Zap } from 'lucide-react';
import { equals } from 'ramda';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { useDebounce } from '@/hooks/use-debounce';
import { registry } from '@/plugins/registry';
import { useToolStore } from '@/store/tool-store';
import type { InputConfig } from '@/types/plugin';

import { ToolInput } from './tool-input';
import { ToolOutput } from './tool-output';

// Popular tools for quick access
const POPULAR_TOOL_IDS = [
  'json-formatter',
  'base64',
  'hash-generator',
  'uuid-generator',
  'url-encoder',
  'case-converter',
];

const DEBOUNCE_DELAY = 300;

export function ToolView() {
  const {
    selectedTool,
    inputs,
    setInput,
    result,
    isProcessing,
    transform,
    clearInputs,
    pinnedToolIds,
  } = useToolStore();

  // Debounce inputs for auto-transform
  const debouncedInputs = useDebounce(inputs, DEBOUNCE_DELAY);

  // Check if any required input has value
  const hasRequiredInputs = useMemo(() => {
    if (!selectedTool) return false;
    return selectedTool.inputs
      .filter((input) => input.required)
      .every((input) => {
        const value = inputs[input.id];
        return value !== undefined && value !== null && value !== '';
      });
  }, [selectedTool, inputs]);

  // Track initial mount and transformations
  const isInitialMount = useRef(true);
  const lastTransformedInputs = useRef<Record<string, unknown> | null>(null);
  const [hasTransformedOnClient, setHasTransformedOnClient] = useState(!selectedTool?.preferFresh);
  const [userInteracted, setUserInteracted] = useState(false);

  // Auto-transform when debounced inputs change
  useEffect(() => {
    if (!selectedTool || !hasRequiredInputs) return;

    // Skip auto-transform on initial mount if there's already a result (from prerendering)
    // This prevents hydration mismatch for tools with random output like lorem-ipsum
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // Only skip if we haven't had user interaction and there's already a result
      // AND tool doesn't prefer a fresh start (deterministic tools)
      if (!userInteracted && result && !selectedTool.preferFresh) {
        return;
      }
    }

    // Only transform if inputs have actually changed from last transform
    if (equals(debouncedInputs, lastTransformedInputs.current)) {
      return;
    }

    lastTransformedInputs.current = debouncedInputs;
    void transform().then(() => {
      setHasTransformedOnClient(true);
    });
  }, [debouncedInputs, selectedTool, hasRequiredInputs, transform, result, userInteracted]);

  // Get pinned tools
  const pinnedTools = useMemo(() => {
    const allTools = registry.getAll();
    return pinnedToolIds
      .map((id) => allTools.find((t) => t.id === id))
      .filter((t) => t !== undefined);
  }, [pinnedToolIds]);

  // Get popular tools
  const popularTools = useMemo(() => {
    const allTools = registry.getAll();
    return POPULAR_TOOL_IDS.map((id) => allTools.find((t) => t.id === id)).filter(
      (t) => t !== undefined
    );
  }, []);

  if (!selectedTool) {
    return (
      <div className="flex h-full items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25">
              <Sparkles className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome to Friendly Toolbox
            </h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400">
              30+ developer utilities at your fingertips
            </p>
          </div>

          {/* Pinned Tools */}
          {pinnedTools.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-4 flex items-center justify-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                <Pin className="h-4 w-4" />
                Pinned Tools
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {pinnedTools.map((tool) => (
                  <Link
                    key={tool.id}
                    to={`/${tool.id}`}
                    className="group flex cursor-pointer items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4 transition-all hover:border-amber-300 hover:shadow-md dark:border-amber-500/30 dark:bg-amber-500/5 dark:hover:border-amber-500/50"
                  >
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 transition-colors group-hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:group-hover:bg-amber-500/30">
                      {tool.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                        {tool.label}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 flex-shrink-0 text-amber-300 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-500 dark:text-amber-600" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Popular Tools */}
          <div className="mb-8">
            <h3 className="mb-4 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
              Popular Tools
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {popularTools.map((tool) => (
                <Link
                  key={tool.id}
                  to={`/${tool.id}`}
                  className="group flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-blue-500/50"
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600 dark:bg-slate-700 dark:text-slate-400 dark:group-hover:bg-blue-500/10 dark:group-hover:text-blue-400">
                    {tool.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                      {tool.label}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500 dark:text-slate-600" />
                </Link>
              ))}
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
            <h3 className="mb-3 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
              Keyboard Shortcuts
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <kbd className="flex items-center gap-0.5 rounded border border-slate-300 bg-white px-2 py-1 font-mono text-xs text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  <Command className="h-3 w-3" />
                  <span>K</span>
                </kbd>
                <span className="text-slate-500 dark:text-slate-400">Search</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="flex items-center gap-0.5 rounded border border-slate-300 bg-white px-2 py-1 font-mono text-xs text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  <Command className="h-3 w-3" />
                  <span>D</span>
                </kbd>
                <span className="text-slate-500 dark:text-slate-400">Dark mode</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="flex items-center gap-0.5 rounded border border-slate-300 bg-white px-2 py-1 font-mono text-xs text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  <Command className="h-3 w-3" />
                  <span>B</span>
                </kbd>
                <span className="text-slate-500 dark:text-slate-400">Sidebar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="space-y-6">
        {/* Input Section */}
        <div className="rounded-xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/50">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Zap className="h-3.5 w-3.5" />
              <span>Auto-transform enabled</span>
            </div>
            <button
              type="button"
              onClick={clearInputs}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
          <div className="space-y-5">
            {(() => {
              const elements: React.ReactNode[] = [];
              let i = 0;
              const processedGroups = new Set<string>();

              // Helper to check if input should be visible based on visibleWhen
              const isInputVisible = (inputConfig: (typeof selectedTool.inputs)[0]): boolean => {
                if (!inputConfig.visibleWhen) return true;
                const { inputId, value: expectedValue } = inputConfig.visibleWhen;
                const currentValue = inputs[inputId];
                if (Array.isArray(expectedValue)) {
                  return expectedValue.includes(String(currentValue));
                }
                return String(currentValue) === expectedValue;
              };

              while (i < selectedTool.inputs.length) {
                const inputConfig = selectedTool.inputs[i];
                if (!inputConfig) {
                  i++;
                  continue;
                }

                // Skip inputs that should be hidden
                if (!isInputVisible(inputConfig)) {
                  i++;
                  continue;
                }

                // Handle grouped inputs (side-by-side layout)
                if (inputConfig.group && !processedGroups.has(inputConfig.group)) {
                  const groupName = inputConfig.group;
                  processedGroups.add(groupName);

                  // Collect all inputs with the same group
                  const groupedInputs = selectedTool.inputs.filter(
                    (inp) => inp.group === groupName
                  );

                  elements.push(
                    <div key={`group-${groupName}`} className="grid grid-cols-2 gap-4">
                      {groupedInputs.map((inp) => (
                        <ToolInput
                          key={inp.id}
                          config={inp}
                          value={inputs[inp.id]}
                          onChange={(value) => {
                            setUserInteracted(true);
                            setInput(inp.id, value);
                          }}
                        />
                      ))}
                    </div>
                  );
                  i++;
                  continue;
                }

                // Skip already processed grouped inputs
                if (inputConfig.group && processedGroups.has(inputConfig.group)) {
                  i++;
                  continue;
                }

                // Group consecutive checkboxes
                if (inputConfig.type === 'checkbox') {
                  const checkboxes: InputConfig[] = [];
                  while (
                    i < selectedTool.inputs.length &&
                    selectedTool.inputs[i]?.type === 'checkbox'
                  ) {
                    const cb = selectedTool.inputs[i];
                    if (cb) checkboxes.push(cb);
                    i++;
                  }

                  const firstId = checkboxes[0]?.id ?? 'checkbox';
                  elements.push(
                    <div
                      key={`checkbox-group-${firstId}`}
                      className="flex flex-wrap gap-x-6 gap-y-2"
                    >
                      {checkboxes.map((cb) => (
                        <ToolInput
                          key={cb.id}
                          config={cb}
                          value={inputs[cb.id]}
                          onChange={(value) => {
                            setUserInteracted(true);
                            setInput(cb.id, value);
                          }}
                        />
                      ))}
                    </div>
                  );
                } else {
                  elements.push(
                    <ToolInput
                      key={inputConfig.id}
                      config={inputConfig}
                      value={inputs[inputConfig.id]}
                      onChange={(value) => {
                        setUserInteracted(true);
                        setInput(inputConfig.id, value);
                      }}
                    />
                  );
                  i++;
                }
              }

              return elements;
            })()}
          </div>
        </div>

        {/* Output Section */}
        <div className="rounded-xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/50">
          <ToolOutput
            result={
              selectedTool.preferFresh && !hasTransformedOnClient && !userInteracted ? null : result
            }
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </div>
  );
}
