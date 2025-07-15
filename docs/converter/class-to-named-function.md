---
sidebar_position: 6
title: 'Named Function'
---

# Class to Named Function Converter

Convert static class methods to named functions with exports.

import SimpleConverter from '@site/src/components/simple-converter';
import { convertClassToNamedFunction, convertClassToNamedFunctionExample } from '@site/src/converters/class-to-named-function';

<SimpleConverter
  conversion={convertClassToNamedFunction}
  placeholder="Enter your class code here..."
  language="javascript"
  exampleInput={convertClassToNamedFunctionExample.input}
  showPreview={true}
  previewMode="multiline"
/>
