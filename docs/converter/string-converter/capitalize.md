---
sidebar_position: 7
---

# Capitalize Converter

Capitalize the first letter of a string with real-time conversion.

import SimpleConverter from '@site/src/components/SimpleConverter';
import { convertToCapitalize, convertToCapitalizeExample } from '@site/src/converters/string-converter';

<SimpleConverter
  conversion={convertToCapitalize}
  placeholder="Enter text to capitalize first letter..."
  language="text"
  exampleInput={convertToCapitalizeExample.input}
  showPreview={true}
  previewMode="inline"
/>