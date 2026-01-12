/**
 * Blog initialization - registers all blog posts
 * This file is imported for its side effects
 */

import type { BlogPost } from './types';

import { blogRegistry, markdownProcessor, readingTimeCalculator } from './index';

// Import sample blog posts
const samplePosts: { slug: string; content: string }[] = [
  {
    slug: 'getting-started-with-friendly-toolbox',
    content: `---
title: "Getting Started with Friendly Toolbox"
description: "Learn how to use the Friendly Toolbox to boost your developer productivity with our collection of essential utilities."
publishedAt: "2024-12-15"
tags: ["tutorial", "getting-started"]
author: "Friendly Team"
---

# Getting Started with Friendly Toolbox

Welcome to **Friendly Toolbox**! This guide will help you get the most out of our collection of developer utilities.

## What is Friendly Toolbox?

Friendly Toolbox is a collection of essential developer tools, all available in one place. From encoding and formatting to cryptography and text manipulation, we've got you covered.

## Key Features

### 1. Instant Transformations

All tools work instantly in your browser. No data is sent to any server - everything happens locally.

\`\`\`javascript
// Example: Base64 encoding
const encoded = btoa('Hello, World!');
console.log(encoded); // "SGVsbG8sIFdvcmxkIQ=="
\`\`\`

### 2. Keyboard Shortcuts

We support keyboard shortcuts for power users:

- **⌘/Ctrl + K**: Open command palette
- **⌘/Ctrl + Enter**: Execute transformation
- **?**: Show keyboard shortcuts

### 3. Theme Support

Switch between light and dark modes based on your preference or system settings.

## Popular Tools

Here are some of our most popular tools:

1. **JSON Formatter** - Format and validate JSON with syntax highlighting
2. **Base64 Encoder** - Encode and decode Base64 strings
3. **UUID Generator** - Generate various UUID versions
4. **Hash Generator** - Create MD5, SHA-1, SHA-256 hashes

## Getting Help

Need help? Press **?** at any time to see available keyboard shortcuts, or use the command palette with **⌘/Ctrl + K**.

Happy coding! 🚀
`,
  },
  {
    slug: 'mastering-json-formatting',
    content: `---
title: "Mastering JSON Formatting and Validation"
description: "Deep dive into JSON formatting best practices, common pitfalls, and how to validate your JSON data effectively."
publishedAt: "2024-12-20"
tags: ["json", "formatting", "tutorial"]
author: "Friendly Team"
---

# Mastering JSON Formatting and Validation

JSON (JavaScript Object Notation) is the backbone of modern web development. Let's explore how to work with it effectively.

## Why JSON Formatting Matters

Properly formatted JSON is:

- **Readable**: Easier for humans to understand
- **Debuggable**: Easier to spot errors
- **Maintainable**: Easier to modify and update

## Common JSON Pitfalls

### 1. Trailing Commas

\`\`\`json
// ❌ Invalid - trailing comma
{
  "name": "John",
  "age": 30,
}

// ✅ Valid
{
  "name": "John",
  "age": 30
}
\`\`\`

### 2. Single Quotes

\`\`\`json
// ❌ Invalid - single quotes
{
  'name': 'John'
}

// ✅ Valid - double quotes only
{
  "name": "John"
}
\`\`\`

### 3. Unquoted Keys

\`\`\`json
// ❌ Invalid - unquoted keys
{
  name: "John"
}

// ✅ Valid
{
  "name": "John"
}
\`\`\`

## Validation Tips

1. **Use a linter**: Catch errors before they cause problems
2. **Validate early**: Check JSON structure at API boundaries
3. **Use TypeScript**: Define interfaces for your JSON structures

## Using Our JSON Formatter

Our JSON Formatter tool helps you:

- Format minified JSON for readability
- Validate JSON syntax
- Detect common errors
- Copy formatted output

Try it out in the Tools section!
`,
  },
  {
    slug: 'security-best-practices-hashing',
    content: `---
title: "Security Best Practices: Understanding Hashing"
description: "A comprehensive guide to cryptographic hashing, when to use different algorithms, and common security mistakes to avoid."
publishedAt: "2025-01-05"
tags: ["security", "cryptography", "hashing"]
author: "Friendly Team"
---

# Security Best Practices: Understanding Hashing

Cryptographic hashing is fundamental to modern security. Let's understand when and how to use different hashing algorithms.

## What is Hashing?

A hash function takes input data and produces a fixed-size output (the "hash" or "digest"). Good hash functions are:

- **Deterministic**: Same input always produces same output
- **One-way**: Cannot reverse the hash to get the input
- **Collision-resistant**: Hard to find two inputs with the same hash

## Common Hashing Algorithms

### MD5

\`\`\`
Input: "Hello, World!"
MD5:   65a8e27d8879283831b664bd8b7f0ad4
\`\`\`

⚠️ **Warning**: MD5 is broken for security purposes. Only use for checksums.

### SHA-256

\`\`\`
Input: "Hello, World!"
SHA-256: dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f
\`\`\`

✅ **Recommended** for most security applications.

### SHA-3

The latest SHA standard, offering additional security properties.

## When to Use What

| Use Case | Recommended Algorithm |
|----------|----------------------|
| Password hashing | bcrypt, Argon2 |
| File integrity | SHA-256 |
| Digital signatures | SHA-256/384/512 |
| Quick checksums | MD5 (non-security) |

## Password Hashing Special Notes

Never use plain hashing for passwords! Always use:

1. **Salt**: Random data added before hashing
2. **Work factor**: Slow algorithms to prevent brute force
3. **Proper libraries**: bcrypt, Argon2, or scrypt

\`\`\`javascript
// ❌ Never do this
const hash = sha256(password);

// ✅ Use proper password hashing
const hash = await bcrypt.hash(password, 12);
\`\`\`

## Try It Yourself

Use our **Hash Generator** tool to experiment with different algorithms and see how they work!
`,
  },
  {
    slug: 'draft-upcoming-features',
    content: `---
title: "Upcoming Features Preview"
description: "A sneak peek at the exciting new features coming to Friendly Toolbox."
publishedAt: "2025-01-10"
tags: ["updates", "features"]
author: "Friendly Team"
isDraft: true
---

# Upcoming Features Preview

This is a draft post that won't be shown in the public listing.

## Coming Soon

- More encoding tools
- API integration
- Team features
`,
  },
];

/**
 * Parse a markdown string and create a BlogPost object
 */
function createBlogPost(slug: string, rawContent: string): BlogPost {
  const parsed = markdownProcessor.parse(rawContent);
  const readingTime = readingTimeCalculator.calculate(rawContent);
  const excerpt = markdownProcessor.extractExcerpt(parsed.content, 160);

  return {
    slug,
    title: parsed.metadata.title,
    description: parsed.metadata.description,
    content: parsed.content,
    publishedAt: new Date(parsed.metadata.publishedAt),
    updatedAt: parsed.metadata.updatedAt ? new Date(parsed.metadata.updatedAt) : undefined,
    tags: parsed.metadata.tags,
    readingTime: readingTime.minutes,
    isDraft: parsed.metadata.isDraft ?? false,
    author: parsed.metadata.author,
    excerpt,
  };
}

// Register all sample posts
for (const { slug, content } of samplePosts) {
  try {
    const post = createBlogPost(slug, content);
    blogRegistry.register(post);
  } catch (error) {
    console.error(`Failed to register blog post "${slug}":`, error);
  }
}

console.info(
  `Blog initialized: ${String(blogRegistry.publishedCount)} published posts, ${String(blogRegistry.count)} total`
);
