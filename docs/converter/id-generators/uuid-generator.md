---
sidebar_position: 1
---

# UUID Generator

Generate UUID v4 identifiers for database records and API endpoints.

import SimpleConverter from '@site/src/components/SimpleConverter';
import { generateUuidV4 } from '@site/src/converters/id-generators';

<SimpleConverter
  conversion={() => generateUuidV4()}
  placeholder="Click to generate a new UUID..."
  language="text"
  exampleInput=""
  showPreview={true}
  previewMode="inline"
/>