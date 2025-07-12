---
sidebar_position: 4
---

# KebabCase Converter

Convert your text to kebab-case format with real-time conversion.

import SimpleConverter from '@site/src/components/SimpleConverter';
import { convertToKebabCase, convertToKebabCaseExample } from '@site/src/converters/string-converter';

<SimpleConverter
  conversion={convertToKebabCase}
  placeholder="Enter text to convert to kebab-case..."
  language="text"
  exampleInput={convertToKebabCaseExample.input}
  showPreview={true}
  previewMode="inline"
/>