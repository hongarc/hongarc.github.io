---
sidebar_position: 2
---

# Lowercase Converter

Convert your text to lowercase letters with real-time conversion.

import SimpleConverter from '@site/src/components/SimpleConverter';
import { convertToLowercase } from '@site/src/converters/stringConverters';

<SimpleConverter
  conversion={convertToLowercase}
  placeholder="Enter text to convert to lowercase..."
/>

## How it works

This converter transforms all uppercase letters in your input to lowercase while preserving numbers, symbols, and spaces. The conversion happens automatically as you type, with a small delay to ensure smooth performance.

### Features

- **Real-time conversion**: See results as you type
- **Preserves formatting**: Maintains line breaks and spacing
- **Handles special characters**: Numbers, symbols, and spaces remain unchanged
- **Responsive design**: Works on all device sizes
