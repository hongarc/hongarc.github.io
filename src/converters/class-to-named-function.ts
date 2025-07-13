// Convert class to named function
export function convertClassToNamedFunction(inputString: string): string {
  // Regular expression to match static method declarations
  const methodRegex =
    /\s*static\s+(async\s+)?(\w+)\(([^)]*)\)\s*{\s*(?:return )?(\w+)\.(\w+)\(([^)]*)\);\s*}/g;

  // Replace static method declarations with the desired output
  const convertedString = inputString.replaceAll(
    methodRegex,
    (
      match,
      isAsync,
      methodName,
      parameters,
      serviceName,
      serviceMethodName,
      serviceParameters
    ) => {
      const asyncKeyword = isAsync ? 'async ' : '';
      return `
${asyncKeyword}function ${methodName}(${parameters}) {
  return ${serviceName}.${serviceMethodName}(${serviceParameters});
}
exports.${methodName} = ${methodName};\n`;
    }
  );

  return convertedString
    .replace(/class .+ {\s*/, '')
    .replace(/}((\n\s*)*module.exports = .+(\n\s*)*)?$/, '//injection')
    .trim();
}

export const convertClassToNamedFunctionExample = {
  input: `class MyClass implements MyInterface {
  method() {
    return 'test';
  }
}`,
  output: `function MyClass implements MyInterface {
  function method() {
    return 'test';
  }
}`,
  description:
    'Converts class syntax to function syntax with method conversion',
};
