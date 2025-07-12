---
sidebar_position: 1
---

# Class to Named Function Converter

Convert static class methods to named functions with exports.

import SimpleConverter from '@site/src/components/SimpleConverter';
import { convertClassToNamedFunction, convertClassToNamedFunctionExample } from '@site/src/converters/class-to-named-function';

<SimpleConverter
  conversion={convertClassToNamedFunction}
  placeholder="Enter your class code here..."
  language="javascript"
  exampleInput={convertClassToNamedFunctionExample.input}
  showPreview={true}
  previewMode="multiline"
/>
