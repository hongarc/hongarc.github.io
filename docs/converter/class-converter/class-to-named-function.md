---
sidebar_position: 1
title: Class to Named Function Converter
---

# 🔁 Class to Named Function Converter

Convert ES6 static class methods into named function exports — in real time, with syntax highlighting.

---

import SimpleConverter from '@site/src/components/SimpleConverter';
import { convertClassToNamedFunction } from '@site/src/converters/classToNamedFunction';

<SimpleConverter
  placeholder="Enter your ES6 class code here..."
  conversion={convertClassToNamedFunction}
/>
