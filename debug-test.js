// Simple debug script to test byte size converter
const {
  parseSize,
  normalizeUnit,
} = require('./src/converters/byte-size-converters.ts');

console.log('Testing normalizeUnit:');
console.log('normalizeUnit("B") =', normalizeUnit('B'));
console.log('normalizeUnit("b") =', normalizeUnit('b'));
console.log('normalizeUnit("KB") =', normalizeUnit('KB'));

console.log('\nTesting parseSize:');
console.log('parseSize("1024B") =', parseSize('1024B'));
console.log('parseSize("8B") =', parseSize('8B'));
