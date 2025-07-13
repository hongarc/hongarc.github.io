// Setup file for Jest tests
import '@testing-library/jest-dom';

// Mock performance for tests
Object.defineProperty(globalThis, 'performance', {
  value: {
    now: () => Date.now(),
  },
  writable: true,
});

// Mock TextEncoder for cuid2
Object.defineProperty(globalThis, 'TextEncoder', {
  value: class TextEncoder {
    encode(text: string) {
      return new Uint8Array(Buffer.from(text, 'utf8'));
    }
  },
  writable: true,
});
