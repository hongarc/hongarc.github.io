---
sidebar_position: 1
---

# JSON to YAML Converter

Convert JSON data to YAML format with proper formatting and structure preservation.

import SimpleConverter from '@site/src/components/SimpleConverter';
import { convertDataFormat } from '@site/src/converters/data-format-converter';

<SimpleConverter
  conversion={(input) => convertDataFormat(input, 'yaml')}
  placeholder="Enter JSON data to convert to YAML..."
  language="json"
  exampleInput='{"name": "John", "age": 30, "city": "New York"}'
  showPreview={true}
  previewMode="multiline"
/>