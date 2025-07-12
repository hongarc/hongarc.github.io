---
sidebar_position: 12
---

# Escape Converter

Escape HTML entities in text with real-time conversion.

import SimpleConverter from '@site/src/components/SimpleConverter';
import { convertToEscape, convertToEscapeExample } from '@site/src/converters/stringConverters';

<SimpleConverter
  conversion={convertToEscape}
  placeholder="Enter HTML to escape..."
  language="text"
  exampleInput={convertToEscapeExample.input}
  showPreview={true}
  previewMode="inline"
/>