/* global jest */

globalThis.crypto = {
  randomUUID: jest.fn(() => 'mock-uuid-v4'),
  getRandomValues: jest.fn(() => new Uint8Array(16)),
  subtle: {
    digest: jest.fn(),
  },
};
