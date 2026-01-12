/**
 * Command Registry - Exports all available commands
 */

import type { ShortcutCommand } from '../types';

import { blogCommands } from './blog-commands';
import { globalCommands } from './global-commands';
import { toolCommands } from './tool-commands';

export * from './blog-commands';
export * from './global-commands';
export * from './tool-commands';

/**
 * Get all default commands
 */
export function getAllCommands(): ShortcutCommand[] {
  return [...globalCommands, ...toolCommands, ...blogCommands];
}
