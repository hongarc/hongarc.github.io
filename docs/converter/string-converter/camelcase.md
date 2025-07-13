---
sidebar_position: 3
---

# CamelCase Converter

Convert your text to camelCase format with real-time conversion.

import SimpleConverter from '@site/src/components/simple-converter';
import { convertToCamelCase, convertToCamelCaseExample } from '@site/src/converters/string-converter';

<SimpleConverter
  conversion={convertToCamelCase}
  placeholder="Enter text to convert to camelCase..."
  language="text"
  exampleInput={convertToCamelCaseExample.input}
  showPreview={true}
  previewMode="inline"
/>
