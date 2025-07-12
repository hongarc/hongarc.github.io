---
sidebar_position: 1
---

# Unix Timestamp Converter

Convert between Unix timestamps and human-readable date formats.

import SimpleConverter from '@site/src/components/SimpleConverter';
import { convertTimestamp } from '@site/src/converters/timestamp-converters';

<SimpleConverter
  conversion={(input) => convertTimestamp(input, 'timestamp')}
  placeholder="Enter timestamp or date to convert..."
  language="text"
  exampleInput="1640995200"
  showPreview={true}
  previewMode="inline"
/>