---
sidebar_position: 9
---

# LowerCase Converter (Lodash)

Convert text to lower case using Lodash with real-time conversion.

import SimpleConverter from '@site/src/components/SimpleConverter';
import { convertToLowerCase, convertToLowerCaseExample } from '@site/src/converters/stringConverters';

<SimpleConverter
  conversion={convertToLowerCase}
  placeholder="Enter text to convert to lower case..."
  language="text"
  exampleInput={convertToLowerCaseExample.input}
  showPreview={true}
  previewMode="inline"
/>