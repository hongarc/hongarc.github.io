import { flow, replace, trim } from 'lodash/fp';

export function convertClassToNamedFunction(inputString: string): string {
  const methodRegex =
    /\s*static\s+(async\s+)?(\w+)\(([^)]*)\)\s*{\s*(?:return\s+)?(\w+)\.(\w+)\(([^)]*)\);\s*}/g;

  const replaceStaticMethods = replace(
    methodRegex,
    (match, isAsync, methodName, params, serviceName, serviceMethod, serviceParams) => {
      const asyncKeyword = isAsync ? 'async ' : '';
      return `
${asyncKeyword}function ${methodName}(${params}) {
  return ${serviceName}.${serviceMethod}(${serviceParams});
}
exports.${methodName} = ${methodName};\n`;
    }
  );

  return flow(
    replaceStaticMethods,
    replace(/class\s+\w+\s*{\s*/, ''),
    replace(/}((\n\s*)*module\.exports\s*=\s*.+(\n\s*)*)?$/, '//injection'),
    trim
  )(inputString);
}
