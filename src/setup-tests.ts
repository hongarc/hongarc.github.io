// Setup file for Jest tests
import '@testing-library/jest-dom';

// Mock global crypto for tests
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: () => 'mock-crypto-uuid',
    getRandomValues: (array: Uint8Array) => {
      for (let index = 0; index < array.length; index++) {
        array[index] = Math.floor(Math.random() * 256);
      }
      return array;
    },
  },
  writable: true,
});
