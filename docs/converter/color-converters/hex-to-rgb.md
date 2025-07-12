---
sidebar_position: 1
---

# HEX to RGB Converter

Convert hexadecimal color codes to RGB format.

import SimpleConverter from '@site/src/components/SimpleConverter';
import { convertColor } from '@site/src/converters/color-converters';

<SimpleConverter
  conversion={(input) => convertColor(input, 'rgb')}
  placeholder="Enter HEX color code (e.g., #FF0000)..."
  language="text"
  exampleInput="#FF0000"
  showPreview={true}
  previewMode="inline"
/>