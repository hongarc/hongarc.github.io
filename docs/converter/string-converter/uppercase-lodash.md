---
sidebar_position: 8
---

# UpperCase Converter (Lodash)

Convert text to UPPER CASE using Lodash with real-time conversion.

import SimpleConverter from '@site/src/components/SimpleConverter';
import { convertToUpperCase, convertToUpperCaseExample } from '@site/src/converters/string-converter';

<SimpleConverter
  conversion={convertToUpperCase}
  placeholder="Enter text to convert to UPPER CASE..."
  language="text"
  exampleInput={convertToUpperCaseExample.input}
  showPreview={true}
  previewMode="inline"
/>