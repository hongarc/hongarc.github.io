import {
  camelCase,
  kebabCase,
  startCase,
  snakeCase,
  capitalize,
  upperCase,
  lowerCase,
  trim,
  deburr,
  escape,
  unescape,
  toUpper,
  toLower,
} from 'lodash';

export function convertToUppercase(input: string): string {
  return toUpper(input);
}

export const convertToUppercaseExample = {
  input: 'abc',
  output: 'ABC',
  description: 'Converts all characters to uppercase',
};

export function convertToLowercase(input: string): string {
  return toLower(input);
}

export const convertToLowercaseExample = {
  input: 'ABC',
  output: 'abc',
  description: 'Converts all characters to lowercase',
};

export function convertToCamelCase(input: string): string {
  return camelCase(input);
}

const simpleHelloWorld = 'hello world';
export const convertToCamelCaseExample = {
  input: simpleHelloWorld,
  output: 'helloWorld',
  description: 'Converts to camelCase format',
};

export function convertToKebabCase(input: string): string {
  return kebabCase(input);
}

export const convertToKebabCaseExample = {
  input: simpleHelloWorld,
  output: 'hello-world',
  description: 'Converts to kebab-case format',
};

export function convertToStartCase(input: string): string {
  return startCase(input);
}

export const convertToStartCaseExample = {
  input: simpleHelloWorld,
  output: 'Hello World',
  description: 'Converts to Start Case format',
};

export function convertToSnakeCase(input: string): string {
  return snakeCase(input);
}

export const convertToSnakeCaseExample = {
  input: simpleHelloWorld,
  output: 'hello_world',
  description: 'Converts to snake_case format',
};

export function convertToCapitalize(input: string): string {
  return capitalize(input);
}

export const convertToCapitalizeExample = {
  input: simpleHelloWorld,
  output: 'Hello world',
  description: 'Capitalizes first letter of string',
};

export function convertToUpperCase(input: string): string {
  return upperCase(input);
}

export const convertToUpperCaseExample = {
  input: simpleHelloWorld,
  output: 'HELLO WORLD',
  description: 'Converts to UPPER CASE',
};

export function convertToLowerCase(input: string): string {
  return lowerCase(input);
}

export const convertToLowerCaseExample = {
  input: 'HELLO WORLD',
  output: 'hello world',
  description: 'Converts to lower case',
};

export function convertToTrim(input: string): string {
  return trim(input);
}

export const convertToTrimExample = {
  input: ' hello ',
  output: 'hello',
  description: 'Removes whitespace from both ends',
};

export function convertToDeburr(input: string): string {
  return deburr(input);
}

export const convertToDeburrExample = {
  input: 'café',
  output: 'cafe',
  description: 'Removes accents/diacritics',
};

export function convertToEscape(input: string): string {
  return escape(input);
}

export const convertToEscapeExample = {
  input: '<div>',
  output: '&lt;div&gt;',
  description: 'Escapes HTML entities',
};

export function convertToUnescape(input: string): string {
  return unescape(input);
}

export const convertToUnescapeExample = {
  input: '&lt;div&gt;',
  output: '<div>',
  description: 'Unescapes HTML entities',
};
