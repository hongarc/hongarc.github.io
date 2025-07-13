---
sidebar_position: 10
---

# Trim Converter

Remove whitespace from both ends of a string with real-time conversion.

import SimpleConverter from '@site/src/components/simple-converter';
import { convertToTrim, convertToTrimExample } from '@site/src/converters/string-converter';

<SimpleConverter
  conversion={convertToTrim}
  placeholder="Enter text to trim whitespace..."
  language="text"
  exampleInput={convertToTrimExample.input}
  showPreview={true}
  previewMode="inline"
/>
