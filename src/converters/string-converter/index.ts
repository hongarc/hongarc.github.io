// String conversion functions
export {
  convertToUppercase,
  convertToLowercase,
  convertToCamelCase,
  convertToKebabCase,
  convertToStartCase,
  convertToSnakeCase,
  convertToCapitalize,
  convertToUpperCase,
  convertToLowerCase,
  convertToTrim,
  convertToDeburr,
  convertToEscape,
  convertToUnescape,
} from '../string-converter';

// Example objects
export {
  convertToUppercaseExample,
  convertToLowercaseExample,
  convertToCamelCaseExample,
  convertToKebabCaseExample,
  convertToStartCaseExample,
  convertToSnakeCaseExample,
  convertToCapitalizeExample,
  convertToUpperCaseExample,
  convertToLowerCaseExample,
  convertToTrimExample,
  convertToDeburrExample,
  convertToEscapeExample,
  convertToUnescapeExample,
} from '../string-converter';

// All available string conversion functions
export const STRING_CONVERSION_FUNCTIONS = [
  {
    name: 'Uppercase',
    function: 'convertToUppercase',
    description: 'Converts all characters to uppercase',
    example: { input: 'abc', output: 'ABC' },
  },
  {
    name: 'Lowercase',
    function: 'convertToLowercase',
    description: 'Converts all characters to lowercase',
    example: { input: 'ABC', output: 'abc' },
  },
  {
    name: 'Camel Case',
    function: 'convertToCamelCase',
    description: 'Converts to camelCase format',
    example: { input: 'hello world', output: 'helloWorld' },
  },
  {
    name: 'Kebab Case',
    function: 'convertToKebabCase',
    description: 'Converts to kebab-case format',
    example: { input: 'hello world', output: 'hello-world' },
  },
  {
    name: 'Start Case',
    function: 'convertToStartCase',
    description: 'Converts to Start Case format',
    example: { input: 'hello world', output: 'Hello World' },
  },
  {
    name: 'Snake Case',
    function: 'convertToSnakeCase',
    description: 'Converts to snake_case format',
    example: { input: 'hello world', output: 'hello_world' },
  },
  {
    name: 'Capitalize',
    function: 'convertToCapitalize',
    description: 'Capitalizes first letter of string',
    example: { input: 'hello world', output: 'Hello world' },
  },
  {
    name: 'Upper Case',
    function: 'convertToUpperCase',
    description: 'Converts to UPPER CASE',
    example: { input: 'hello world', output: 'HELLO WORLD' },
  },
  {
    name: 'Lower Case',
    function: 'convertToLowerCase',
    description: 'Converts to lower case',
    example: { input: 'HELLO WORLD', output: 'hello world' },
  },
  {
    name: 'Trim',
    function: 'convertToTrim',
    description: 'Removes whitespace from both ends',
    example: { input: ' hello ', output: 'hello' },
  },
  {
    name: 'Deburr',
    function: 'convertToDeburr',
    description: 'Removes accents/diacritics',
    example: { input: 'café', output: 'cafe' },
  },
  {
    name: 'Escape',
    function: 'convertToEscape',
    description: 'Escapes HTML entities',
    example: { input: '<div>', output: '&lt;div&gt;' },
  },
  {
    name: 'Unescape',
    function: 'convertToUnescape',
    description: 'Unescapes HTML entities',
    example: { input: '&lt;div&gt;', output: '<div>' },
  },
];
