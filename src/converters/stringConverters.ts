export function convertToUppercase(input: string): string {
  return input.toUpperCase();
}

export const convertToUppercaseExample = {
  input: "abc",
  output: "ABC",
  description: "Converts all characters to uppercase"
};

export function convertToLowercase(input: string): string {
  return input.toLowerCase();
}

export const convertToLowercaseExample = {
  input: "ABC",
  output: "abc",
  description: "Converts all characters to lowercase"
};
