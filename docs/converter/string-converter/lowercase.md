---
sidebar_position: 2
---

# Lowercase Converter

Convert your text to lowercase letters with real-time conversion.

import SimpleConverter from '@site/src/components/simple-converter';
import { convertToLowercase, convertToLowercaseExample } from '@site/src/converters/string-converter';

<SimpleConverter
  conversion={convertToLowercase}
  placeholder="Enter text to convert to lowercase..."
  language="text"
  exampleInput={convertToLowercaseExample.input}
  showPreview={true}
  previewMode="inline"
/>
