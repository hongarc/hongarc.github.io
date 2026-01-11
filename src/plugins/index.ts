// Import all plugins
import { hashGenerator } from './crypto/hash-generator';
import { passwordGenerator } from './crypto/password-generator';
import { chmodCalculator } from './dev/chmod-calculator';
import { colorConverter } from './dev/color-converter';
import { cronParser } from './dev/cron-parser';
import { jsonToTs } from './dev/json-to-ts';
import { jwtDecoder } from './dev/jwt-decoder';
import { qrGenerator } from './dev/qr-generator';
import { regexTester } from './dev/regex-tester';
import { timestampConverter } from './dev/timestamp-converter';
import { urlParser } from './dev/url-parser';
import { base64Encoder } from './encoding/base64';
import { stringEscape } from './encoding/string-escape';
import { urlEncoder } from './encoding/url-encoder';
import { dataConverter } from './format/data-converter';
import { jsonFormatter } from './format/json-formatter';
import { sqlFormatter } from './format/sql-formatter';
import { baseConverter } from './math/base-converter';
import { numberFormatter } from './math/number-formatter';
import { registry } from './registry';
import { caseConverter } from './text/case-converter';
import { htmlEntity } from './text/html-entity';
import { lineTools } from './text/line-tools';
import { loremIpsum } from './text/lorem-ipsum';
import { slugGenerator } from './text/slug-generator';
import { textDiff } from './text/text-diff';
import { uuidGenerator } from './text/uuid-generator';
import { wordCounter } from './text/word-counter';

// Register all plugins (ordered by frequency of use within each category)
registry.registerAll([
  // Format tools (most used first)
  jsonFormatter,
  dataConverter,
  sqlFormatter,

  // Encoding tools (most used first)
  base64Encoder,
  urlEncoder,
  stringEscape,

  // Dev tools (most used first)
  regexTester,
  jsonToTs,
  qrGenerator,
  timestampConverter,
  jwtDecoder,
  urlParser,
  colorConverter,
  cronParser,
  chmodCalculator,

  // Crypto tools
  hashGenerator,
  passwordGenerator,

  // Text tools (most used first)
  caseConverter,
  textDiff,
  uuidGenerator,
  slugGenerator,
  wordCounter,
  lineTools,
  loremIpsum,
  htmlEntity,

  // Math tools
  baseConverter,
  numberFormatter,
]);

// Export registry for use in components

export { registry } from './registry';
