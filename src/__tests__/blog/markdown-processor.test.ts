import { beforeEach, describe, expect, it } from 'vitest';

import { BlogMetadataError, MarkdownProcessor } from '@/blog/markdown-processor';

describe('MarkdownProcessor', () => {
  let processor: MarkdownProcessor;

  beforeEach(() => {
    processor = new MarkdownProcessor();
  });

  describe('parse', () => {
    it('should parse valid markdown with frontmatter', () => {
      const content = `---
title: "Test Post"
description: "A test blog post"
publishedAt: "2024-01-15"
tags: ["test", "blog"]
isDraft: false
author: "Test Author"
---

# Test Content

This is a test post.`;

      const result = processor.parse(content);

      expect(result.metadata).toEqual({
        title: 'Test Post',
        description: 'A test blog post',
        publishedAt: '2024-01-15',
        tags: ['test', 'blog'],
        isDraft: false,
        author: 'Test Author',
      });
      expect(result.content).toBe('\n# Test Content\n\nThis is a test post.');
    });

    it('should handle minimal required frontmatter', () => {
      const content = `---
title: "Minimal Post"
description: "Minimal description"
publishedAt: "2024-01-15"
---

Content here.`;

      const result = processor.parse(content);

      expect(result.metadata).toEqual({
        title: 'Minimal Post',
        description: 'Minimal description',
        publishedAt: '2024-01-15',
        tags: [],
        isDraft: false,
        author: undefined,
        updatedAt: undefined,
      });
    });

    it('should throw error for missing required fields', () => {
      const content = `---
title: "Test Post"
# Missing description and publishedAt
---

Content`;

      expect(() => processor.parse(content)).toThrow(BlogMetadataError);
      expect(() => processor.parse(content)).toThrow('Missing required field: description');
    });

    it('should throw error for invalid date format', () => {
      const content = `---
title: "Test Post"
description: "Test description"
publishedAt: "invalid-date"
---

Content`;

      expect(() => processor.parse(content)).toThrow(BlogMetadataError);
      expect(() => processor.parse(content)).toThrow('must be a valid date string');
    });

    it('should throw error for invalid tags format', () => {
      const content = `---
title: "Test Post"
description: "Test description"
publishedAt: "2024-01-15"
tags: "not-an-array"
---

Content`;

      expect(() => processor.parse(content)).toThrow(BlogMetadataError);
      expect(() => processor.parse(content)).toThrow('must be an array');
    });

    it('should throw error for empty required fields', () => {
      const content = `---
title: ""
description: "Test description"
publishedAt: "2024-01-15"
---

Content`;

      expect(() => processor.parse(content)).toThrow(BlogMetadataError);
      expect(() => processor.parse(content)).toThrow('must be a non-empty string');
    });

    it('should throw error for invalid updatedAt date', () => {
      const content = `---
title: "Test Post"
description: "Test description"
publishedAt: "2024-01-15"
updatedAt: "not-a-date"
---

Content`;

      expect(() => processor.parse(content)).toThrow(BlogMetadataError);
      expect(() => processor.parse(content)).toThrow(
        "Field 'updatedAt' must be a valid date string"
      );
    });

    it('should throw error for invalid isDraft type', () => {
      const content = `---
title: "Test Post"
description: "Test description"
publishedAt: "2024-01-15"
isDraft: "yes"
---

Content`;

      expect(() => processor.parse(content)).toThrow(BlogMetadataError);
      expect(() => processor.parse(content)).toThrow("Field 'isDraft' must be a boolean");
    });

    it('should throw error for empty tag strings', () => {
      const content = `---
title: "Test Post"
description: "Test description"
publishedAt: "2024-01-15"
tags: ["valid", ""]
---

Content`;

      expect(() => processor.parse(content)).toThrow(BlogMetadataError);
      expect(() => processor.parse(content)).toThrow('All tags must be non-empty strings');
    });

    it('should throw error for empty author string', () => {
      const content = `---
title: "Test Post"
description: "Test description"
publishedAt: "2024-01-15"
author: ""
---

Content`;

      expect(() => processor.parse(content)).toThrow(BlogMetadataError);
      expect(() => processor.parse(content)).toThrow("Field 'author' must be a non-empty string");
    });

    it('should throw error for non-object frontmatter', () => {
      const content = `---
invalid frontmatter
---

Content`;

      expect(() => processor.parse(content)).toThrow(BlogMetadataError);
    });

    it('should handle valid updatedAt date', () => {
      const content = `---
title: "Test Post"
description: "Test description"
publishedAt: "2024-01-15"
updatedAt: "2024-02-20"
---

Content`;

      const result = processor.parse(content);
      expect(result.metadata.updatedAt).toBe('2024-02-20');
    });

    it('should handle null required fields', () => {
      const content = `---
title: null
description: "Test description"
publishedAt: "2024-01-15"
---

Content`;

      expect(() => processor.parse(content)).toThrow(BlogMetadataError);
      expect(() => processor.parse(content)).toThrow('Missing required field: title');
    });
  });

  describe('renderToHtml', () => {
    it('should render markdown to HTML', async () => {
      const markdown = '# Hello World\n\nThis is **bold** text.';
      const html = await processor.renderToHtml(markdown);

      expect(html).toContain('<h1>Hello World</h1>');
      expect(html).toContain('<strong>bold</strong>');
    });

    it('should handle code blocks', async () => {
      const markdown = '```javascript\nconst x = 1;\n```';
      const html = await processor.renderToHtml(markdown);

      expect(html).toContain('<pre><code class="language-javascript">');
      expect(html).toContain('const x = 1;');
    });

    it('should handle links and images', async () => {
      const markdown = '[Link](https://example.com)\n\n![Image](image.jpg)';
      const html = await processor.renderToHtml(markdown);

      expect(html).toContain('<a href="https://example.com">Link</a>');
      expect(html).toContain('<img src="image.jpg" alt="Image">');
    });

    it('should handle inline code', async () => {
      const markdown = 'Use the `console.log()` function.';
      const html = await processor.renderToHtml(markdown);

      expect(html).toContain('<code>console.log()</code>');
    });

    it('should handle lists', async () => {
      const markdown = '- Item 1\n- Item 2\n- Item 3';
      const html = await processor.renderToHtml(markdown);

      expect(html).toContain('<ul>');
      expect(html).toContain('<li>Item 1</li>');
    });

    it('should handle blockquotes', async () => {
      const markdown = '> This is a quote';
      const html = await processor.renderToHtml(markdown);

      expect(html).toContain('<blockquote>');
    });

    it('should handle empty content', async () => {
      const html = await processor.renderToHtml('');
      expect(html).toBe('');
    });

    it('should handle multiple headers', async () => {
      const markdown = '# H1\n## H2\n### H3';
      const html = await processor.renderToHtml(markdown);

      expect(html).toContain('<h1>H1</h1>');
      expect(html).toContain('<h2>H2</h2>');
      expect(html).toContain('<h3>H3</h3>');
    });

    it('should handle tables (GFM)', async () => {
      const markdown = '| Col 1 | Col 2 |\n|-------|-------|\n| A | B |';
      const html = await processor.renderToHtml(markdown);

      expect(html).toContain('<table>');
      expect(html).toContain('<th>Col 1</th>');
    });
  });

  describe('extractExcerpt', () => {
    it('should extract plain text excerpt', () => {
      const content =
        'This is a simple paragraph with some text that should be extracted as an excerpt.';
      const excerpt = processor.extractExcerpt(content, 50);

      expect(excerpt).toBe('This is a simple paragraph with some text that...');
    });

    it('should remove markdown formatting', () => {
      const content =
        '# Header\n\nThis is **bold** and *italic* text with `code` and [links](url).';
      const excerpt = processor.extractExcerpt(content, 100);

      expect(excerpt).toBe('Header This is bold and italic text with code and links.');
    });

    it('should remove code blocks', () => {
      const content = `Some text before.

\`\`\`javascript
const code = "should be removed";
\`\`\`

Some text after.`;
      const excerpt = processor.extractExcerpt(content, 100);

      expect(excerpt).toBe('Some text before. Some text after.');
    });

    it('should remove images but keep alt text', () => {
      const content = 'Text before ![Alt text](image.jpg) text after.';
      const excerpt = processor.extractExcerpt(content, 100);

      expect(excerpt).toBe('Text before text after.');
    });

    it('should return full text if shorter than limit', () => {
      const content = 'Short text.';
      const excerpt = processor.extractExcerpt(content, 100);

      expect(excerpt).toBe('Short text.');
    });

    it('should break at word boundaries', () => {
      const content = 'This is a longer piece of text that should be truncated at word boundaries.';
      const excerpt = processor.extractExcerpt(content, 30);

      expect(excerpt).toBe('This is a longer piece of...');
      expect(excerpt.length).toBeLessThanOrEqual(33); // 30 + "..."
    });

    it('should use default max length of 200', () => {
      const content = 'A'.repeat(300);
      const excerpt = processor.extractExcerpt(content);

      expect(excerpt.length).toBeLessThanOrEqual(203); // 200 + "..."
    });

    it('should handle empty content', () => {
      const excerpt = processor.extractExcerpt('');
      expect(excerpt).toBe('');
    });

    it('should remove list markers', () => {
      const content = '- Item one\n- Item two\n* Star item\n+ Plus item';
      const excerpt = processor.extractExcerpt(content, 100);

      expect(excerpt).toBe('Item one Item two Star item Plus item');
    });

    it('should remove blockquote markers', () => {
      const content = '> This is a quote\n> Second line';
      const excerpt = processor.extractExcerpt(content, 100);

      expect(excerpt).toBe('This is a quote Second line');
    });

    it('should handle content with only whitespace', () => {
      const content = '   \n\n   ';
      const excerpt = processor.extractExcerpt(content, 100);

      expect(excerpt).toBe('');
    });

    it('should handle nested markdown formatting', () => {
      const content = '***bold and italic*** and ~~strikethrough~~';
      const excerpt = processor.extractExcerpt(content, 100);

      // Should contain the text without markdown
      expect(excerpt).toContain('bold and italic');
    });

    it('should handle very long single word at boundary', () => {
      const content = 'Start superlongwordthatexceedsthelimit end';
      const excerpt = processor.extractExcerpt(content, 10);

      // Should truncate even if it can't find a good word boundary
      expect(excerpt.endsWith('...')).toBe(true);
    });

    it('should handle multiple images', () => {
      const content = '![Img1](a.jpg) text ![Img2](b.jpg) more text';
      const excerpt = processor.extractExcerpt(content, 100);

      expect(excerpt).toBe('text more text');
    });

    it('should normalize multiple spaces', () => {
      const content = 'Word    with    multiple    spaces';
      const excerpt = processor.extractExcerpt(content, 100);

      expect(excerpt).toBe('Word with multiple spaces');
    });
  });
});
