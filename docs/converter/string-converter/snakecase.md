---
sidebar_position: 6
---

# SnakeCase Converter

Convert your text to snake_case format with real-time conversion.

import SimpleConverter from '@site/src/components/SimpleConverter';
import { convertToSnakeCase, convertToSnakeCaseExample } from '@site/src/converters/string-converter';

<SimpleConverter
  conversion={convertToSnakeCase}
  placeholder="Enter text to convert to snake_case..."
  language="text"
  exampleInput={convertToSnakeCaseExample.input}
  showPreview={true}
  previewMode="inline"
/>