---
sidebar_position: 13
---

# Unescape Converter

Unescape HTML entities in text with real-time conversion.

import SimpleConverter from '@site/src/components/simple-converter';
import { convertToUnescape, convertToUnescapeExample } from '@site/src/converters/string-converter';

<SimpleConverter
  conversion={convertToUnescape}
  placeholder="Enter escaped HTML to unescape..."
  language="text"
  exampleInput={convertToUnescapeExample.input}
  showPreview={true}
  previewMode="inline"
/>
