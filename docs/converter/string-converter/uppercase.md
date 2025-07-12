---
sidebar_position: 1
---

# Uppercase Converter

Convert your text to uppercase letters with real-time conversion.

import SimpleConverter from '@site/src/components/SimpleConverter';
import { convertToUppercase, convertToUppercaseExample } from '@site/src/converters/stringConverters';

<SimpleConverter
  conversion={convertToUppercase}
  placeholder="Enter text to convert to uppercase..."
  language="text"
  exampleInput={convertToUppercaseExample.input}
  showPreview={true}
  previewMode="inline"
/>
