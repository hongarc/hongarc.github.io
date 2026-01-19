import { ArrowRight, Command, Pin, RotateCcw, Sparkles, Zap } from 'lucide-react';
import { equals } from 'ramda';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { useDebounce } from '@/hooks/use-debounce';
import { TrackingProvider } from '@/hooks/use-tracking';
import { registry } from '@/plugins/registry';
import { useToolStore } from '@/store/tool-store';
import type { InputConfig } from '@/types/plugin';

import { ToolInput } from './tool-input';
import { ToolOutput } from './tool-output';

// Popular tools for quick access (6 items)
const POPULAR_TOOL_IDS = ['json', 'hash', 'uuid', 'url-encode', 'case', 'base64'];

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
            <div className="bg-ctp-blue/20 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg">
              <Sparkles className="text-ctp-blue h-8 w-8" />
            </div>
            <h2 className="text-ctp-text text-2xl font-bold tracking-tight">
              Welcome to Friendly Toolbox
            </h2>
            <p className="text-ctp-subtext1 mt-3">30+ developer utilities at your fingertips</p>
          </div>

          {/* Pinned Tools - max 3 */}
          {pinnedTools.length > 0 && (
            <div className="mb-8">
              <h3 className="text-ctp-subtext1 mb-4 flex items-center justify-center gap-2 text-sm font-medium">
                <Pin className="text-ctp-yellow h-4 w-4" />
                Pinned Tools
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {pinnedTools.slice(0, 3).map((tool) => (
                  <Link
                    key={tool.id}
                    to={`/${tool.id}`}
                    className="bg-ctp-yellow\/10 border-ctp-yellow group border-opacity-30 hover:border-opacity-50 flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all hover:shadow-md"
                  >
                    <span className="bg-ctp-yellow\/20 text-ctp-yellow group-hover:bg-opacity-30 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-colors">
                      {tool.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-ctp-text truncate text-sm font-medium">{tool.label}</p>
                    </div>
                    <ArrowRight className="text-ctp-yellow h-4 w-4 flex-shrink-0 opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Popular Tools */}
          <div className="mb-8">
            <h3 className="text-ctp-subtext1 mb-4 text-center text-sm font-medium">
              Popular Tools
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {popularTools.map((tool) => (
                <Link
                  key={tool.id}
                  to={`/${tool.id}`}
                  className="bg-ctp-base border-ctp-surface1 hover:border-ctp-blue group flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all hover:shadow-md"
                >
                  <span className="bg-ctp-surface0 text-ctp-subtext1 group-hover:bg-ctp-blue\/10 group-hover:text-ctp-blue flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-colors">
                    {tool.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-ctp-text truncate text-sm font-medium">{tool.label}</p>
                  </div>
                  <ArrowRight className="text-ctp-overlay0 group-hover:text-ctp-blue h-4 w-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="bg-ctp-mantle border-ctp-surface1 rounded-xl border p-4">
            <h3 className="text-ctp-subtext1 mb-3 text-center text-sm font-medium">
              Keyboard Shortcuts
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <kbd className="bg-ctp-surface0 border-ctp-surface2 text-ctp-text flex items-center gap-0.5 rounded border px-2 py-1 font-mono text-xs">
                  <Command className="h-3 w-3" />
                  <span>K</span>
                </kbd>
                <span className="text-ctp-subtext1">Search</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="bg-ctp-surface0 border-ctp-surface2 text-ctp-text flex items-center gap-0.5 rounded border px-2 py-1 font-mono text-xs">
                  <Command className="h-3 w-3" />
                  <span>D</span>
                </kbd>
                <span className="text-ctp-subtext1">Dark mode</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="bg-ctp-surface0 border-ctp-surface2 text-ctp-text flex items-center gap-0.5 rounded border px-2 py-1 font-mono text-xs">
                  <Command className="h-3 w-3" />
                  <span>B</span>
                </kbd>
                <span className="text-ctp-subtext1">Sidebar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render custom component if available
  if (selectedTool.customComponent) {
    const CustomComponent = selectedTool.customComponent;
    return (
      <div className="mx-auto max-w-4xl">
        <div className="bg-ctp-base border-ctp-surface1 rounded-xl border p-4 shadow-sm">
          <CustomComponent />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="space-y-4">
        {/* Input Section */}
        <div className="bg-ctp-base border-ctp-surface1 rounded-xl border p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-ctp-subtext1 flex items-center gap-2 text-xs">
              <Zap className="text-ctp-yellow h-3.5 w-3.5" />
              <span>Auto-transform enabled</span>
            </div>
            <button
              type="button"
              onClick={clearInputs}
              className="text-ctp-subtext1 hover:bg-ctp-surface0 hover:text-ctp-text inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
          <div className="space-y-4">
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

                  // Collect all visible inputs with the same group
                  const groupedInputs = selectedTool.inputs.filter(
                    (inp) => inp.group === groupName && isInputVisible(inp)
                  );

                  // Only render group if there are visible inputs
                  if (groupedInputs.length > 0) {
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
                  }
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
        <TrackingProvider toolId={selectedTool.id}>
          <div className="bg-ctp-base border-ctp-surface1 rounded-xl border p-4 shadow-sm">
            <ToolOutput
              result={
                selectedTool.preferFresh && !hasTransformedOnClient && !userInteracted
                  ? null
                  : result
              }
              isProcessing={isProcessing}
            />
          </div>
        </TrackingProvider>
      </div>
    </div>
  );
}
