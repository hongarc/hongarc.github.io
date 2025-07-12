---
sidebar_position: 5
---

# StartCase Converter

Convert your text to Start Case format with real-time conversion.

import SimpleConverter from '@site/src/components/SimpleConverter';
import { convertToStartCase, convertToStartCaseExample } from '@site/src/converters/stringConverters';

<SimpleConverter
  conversion={convertToStartCase}
  placeholder="Enter text to convert to Start Case..."
  language="text"
  exampleInput={convertToStartCaseExample.input}
  showPreview={true}
  previewMode="inline"
/>