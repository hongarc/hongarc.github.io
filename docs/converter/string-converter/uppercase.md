---
sidebar_position: 1
---

# Uppercase Converter

Convert your text to uppercase letters with real-time conversion.

import SimpleConverter from '@site/src/components/SimpleConverter';
import { convertToUppercase } from '@site/src/converters/stringConverters';

<SimpleConverter
  conversion={convertToUppercase}
  placeholder="Enter text to convert to uppercase..."
/>

## How it works

This converter transforms all lowercase letters in your input to uppercase while preserving numbers, symbols, and spaces. The conversion happens automatically as you type, with a small delay to ensure smooth performance.

### Features

- **Real-time conversion**: See results as you type
- **Preserves formatting**: Maintains line breaks and spacing
- **Handles special characters**: Numbers, symbols, and spaces remain unchanged
- **Responsive design**: Works on all device sizes
