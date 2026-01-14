import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { NavigationSection } from '@/blog/types';
import { registry } from '@/plugins/registry';
import type { ToolPlugin, TransformResult } from '@/types/plugin';
import { executeTransformer } from '@/utils/transformer';

interface ToolState {
  // Navigation section
  activeSection: NavigationSection;

  // Current tool
  selectedToolId: string | null;
  selectedTool: ToolPlugin | null;

  // Input/Output
  inputs: Record<string, unknown>;
  result: TransformResult | null;
  isProcessing: boolean;

  // Search
  searchQuery: string;

  // Theme
  theme: 'light' | 'dark' | 'system';

  // Recent tools
  recentToolIds: string[];

  // Pinned tools
  pinnedToolIds: string[];

  // Sidebar
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;

  // Per-tool settings persistence
  toolSettings: Record<string, Record<string, unknown>>;

  // Actions
  setActiveSection: (section: NavigationSection) => void;
  selectTool: (toolId: string | null) => void;
  setInput: (inputId: string, value: unknown) => void;
  setInputs: (inputs: Record<string, unknown>) => void;
  clearInputs: () => void;
  transform: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  copyToClipboard: () => Promise<boolean>;
  togglePinTool: (toolId: string) => void;
  isPinned: (toolId: string) => boolean;
  // For Firestore sync
  setPinnedToolIds: (ids: string[]) => void;
  setRecentToolIds: (ids: string[]) => void;
}

const MAX_RECENT_TOOLS = 5;

export const useToolStore = create<ToolState>()(
  persist(
    (set, get) => ({
      // Initial state
      activeSection: 'tools',
      selectedToolId: null,
      selectedTool: null,
      inputs: {},
      result: null,
      isProcessing: false,
      searchQuery: '',
      theme: 'system',
      recentToolIds: [],
      pinnedToolIds: [],
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      toolSettings: {},

      // Set active navigation section
      setActiveSection: (section: NavigationSection) => {
        set({ activeSection: section, searchQuery: '' });
      },

      // Select a tool by ID (or clear selection with null)
      selectTool: (toolId: string | null) => {
        // Clear selection
        if (toolId === null) {
          set({
            selectedToolId: null,
            selectedTool: null,
            inputs: {},
            result: null,
          });
          return;
        }

        const tool = registry.get(toolId);
        if (!tool) {
          console.warn(`Tool "${toolId}" not found in registry`);
          return;
        }

        // Build default inputs from tool config
        const defaultInputs: Record<string, unknown> = {};
        for (const input of tool.inputs) {
          if (input.defaultValue !== undefined) {
            defaultInputs[input.id] = input.defaultValue;
          }
        }

        // Restore saved settings (excluding sensitive fields)
        const { toolSettings } = get();
        const savedSettings = toolSettings[toolId] ?? {};

        // Filter saved settings - only restore config options, not text inputs
        const safeSavedSettings: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(savedSettings)) {
          const inputConfig = tool.inputs.find((i) => i.id === key);
          // Only restore if input exists, is NOT sensitive, and is a config option (not text/textarea)
          if (
            inputConfig &&
            !inputConfig.sensitive &&
            !['text', 'textarea'].includes(inputConfig.type)
          ) {
            safeSavedSettings[key] = value;
          }
        }

        const mergedInputs = { ...defaultInputs, ...safeSavedSettings };

        // Update recent tools
        const { recentToolIds } = get();
        const updatedRecent = [toolId, ...recentToolIds.filter((id) => id !== toolId)].slice(
          0,
          MAX_RECENT_TOOLS
        );

        set({
          selectedToolId: toolId,
          selectedTool: tool,
          inputs: mergedInputs,
          result: null,
          recentToolIds: updatedRecent,
          mobileSidebarOpen: false,
        });
      },

      // Set a single input value and persist to tool settings (config options only)
      setInput: (inputId: string, value: unknown) => {
        const { selectedToolId, toolSettings, selectedTool } = get();
        set((state) => {
          const newInputs = { ...state.inputs, [inputId]: value };
          // Only persist config options (select, checkbox, number), not text inputs
          if (selectedToolId && selectedTool) {
            const inputConfig = selectedTool.inputs.find((i) => i.id === inputId);
            // Skip persistence for sensitive fields and text/textarea inputs
            if (inputConfig?.sensitive || ['text', 'textarea'].includes(inputConfig?.type ?? '')) {
              return { inputs: newInputs };
            }

            const currentSettings = toolSettings[selectedToolId] ?? {};
            return {
              inputs: newInputs,
              toolSettings: {
                ...toolSettings,
                [selectedToolId]: { ...currentSettings, [inputId]: value },
              },
            };
          }
          return { inputs: newInputs };
        });
      },

      // Set multiple inputs at once
      setInputs: (inputs: Record<string, unknown>) => {
        set((state) => ({
          inputs: { ...state.inputs, ...inputs },
        }));
      },

      // Clear all inputs
      clearInputs: () => {
        const { selectedTool } = get();
        if (!selectedTool) return;

        const defaultInputs: Record<string, unknown> = {};
        for (const input of selectedTool.inputs) {
          if (input.defaultValue !== undefined) {
            defaultInputs[input.id] = input.defaultValue;
          }
        }

        set({ inputs: defaultInputs, result: null });
      },

      // Execute the transformation
      transform: async () => {
        const { selectedTool, inputs } = get();
        if (!selectedTool) return;

        set({ isProcessing: true });

        try {
          const result = await executeTransformer(selectedTool, inputs);
          set({ result, isProcessing: false });
        } catch {
          set({
            result: { success: false, error: 'Unexpected error occurred' },
            isProcessing: false,
          });
        }
      },

      // Set search query
      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      // Set theme
      setTheme: (newTheme: 'light' | 'dark' | 'system') => {
        set({ theme: newTheme });
      },

      // Toggle sidebar
      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      // Set mobile sidebar open state
      setMobileSidebarOpen: (open: boolean) => {
        set({ mobileSidebarOpen: open });
      },

      // Copy result to clipboard
      copyToClipboard: async () => {
        const { result } = get();
        if (!result?.success || !result.output) return false;

        try {
          await navigator.clipboard.writeText(result.output);
          return true;
        } catch {
          return false;
        }
      },

      // Toggle pin status for a tool
      togglePinTool: (toolId: string) => {
        const { pinnedToolIds } = get();
        const isPinned = pinnedToolIds.includes(toolId);
        set({
          pinnedToolIds: isPinned
            ? pinnedToolIds.filter((id) => id !== toolId)
            : [...pinnedToolIds, toolId],
        });
      },

      // Check if a tool is pinned
      isPinned: (toolId: string) => {
        return get().pinnedToolIds.includes(toolId);
      },

      // Set pinned tools (for Firestore sync)
      setPinnedToolIds: (ids: string[]) => {
        set({ pinnedToolIds: ids });
      },

      // Set recent tools (for Firestore sync)
      setRecentToolIds: (ids: string[]) => {
        set({ recentToolIds: ids });
      },
    }),
    {
      name: 'friendly-storage',
      partialize: (state) => ({
        activeSection: state.activeSection,
        theme: state.theme,
        recentToolIds: state.recentToolIds,
        pinnedToolIds: state.pinnedToolIds,
        sidebarCollapsed: state.sidebarCollapsed,
        toolSettings: state.toolSettings,
      }),
    }
  )
);
