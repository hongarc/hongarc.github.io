/* global jest */

const nanoid = jest.fn(() => 'mock-nanoid-id');
nanoid.nanoid = jest.fn(() => 'mock-nanoid-id');

module.exports = nanoid;
