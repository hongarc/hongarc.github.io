---
sidebar_position: 1
---

# Binary Units Converter

Convert between binary byte size units (B, KB, MB, GB, TB, PB) using 1024 base.

import SimpleConverter from '@site/src/components/SimpleConverter';
import { convertByteSize } from '@site/src/converters/byte-size-converters';

<SimpleConverter
  conversion={(input) => convertByteSize(input, 'MB', 'binary')}
  placeholder="Enter byte size to convert (e.g., 1024 B)..."
  language="text"
  exampleInput="1048576 B"
  showPreview={true}
  previewMode="inline"
/>