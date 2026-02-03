import type { ParsedQRBase, QRTypeStrategy } from './types';

/**
 * Registry for QR type strategies
 * Uses singleton pattern for global access
 */
class QRTypeRegistry {
  private strategies: QRTypeStrategy[] = [];

  /**
   * Register a new QR type strategy
   * Strategies are checked in registration order
   */
  register<T extends ParsedQRBase>(strategy: QRTypeStrategy<T>): void {
    this.strategies.push(strategy as unknown as QRTypeStrategy);
  }

  /**
   * Parse content using registered strategies
   * Returns first successful parse or null
   */
  parse(content: string): { strategy: QRTypeStrategy; parsed: ParsedQRBase } | null {
    const trimmed = content.trim();

    for (const strategy of this.strategies) {
      if (strategy.canParse(trimmed)) {
        const parsed = strategy.parse(trimmed);
        if (parsed) {
          return { strategy, parsed: { ...parsed, raw: content } };
        }
      }
    }

    return null;
  }

  /**
   * Get all registered strategies
   */
  getAll(): QRTypeStrategy[] {
    return [...this.strategies];
  }
}

// Singleton instance
export const qrTypeRegistry = new QRTypeRegistry();
