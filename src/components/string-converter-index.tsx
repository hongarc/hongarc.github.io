import React from 'react';

import ConverterCard from './common/card';
import {
  Container,
  Description,
  CategorySection,
  CategoryTitle,
  Grid,
  BackButton,
} from './common/layout';

interface ConverterItem {
  title: string;
  description: string;
  link: string;
  example: string;
  category: string;
}

const CASE_CATEGORY = 'Case Conversion';
const FORMAT_CATEGORY = 'Format Conversion';
const TEXT_CATEGORY = 'Text Processing';

const stringConverters: ConverterItem[] = [
  // Case Conversion
  {
    title: 'Uppercase',
    description: 'Convert text to uppercase letters',
    link: '/docs/converter/string-converter/uppercase',
    example: 'abc → ABC',
    category: CASE_CATEGORY,
  },
  {
    title: 'Lowercase',
    description: 'Convert text to lowercase letters',
    link: '/docs/converter/string-converter/lowercase',
    example: 'ABC → abc',
    category: CASE_CATEGORY,
  },
  {
    title: 'Capitalize',
    description: 'Capitalize first letter of string',
    link: '/docs/converter/string-converter/capitalize',
    example: 'hello world → Hello world',
    category: CASE_CATEGORY,
  },
  {
    title: 'StartCase',
    description: 'Convert to Start Case format',
    link: '/docs/converter/string-converter/startcase',
    example: 'hello world → Hello World',
    category: CASE_CATEGORY,
  },
  // Format Conversion
  {
    title: 'CamelCase',
    description: 'Convert to camelCase format',
    link: '/docs/converter/string-converter/camelcase',
    example: 'hello world → helloWorld',
    category: FORMAT_CATEGORY,
  },
  {
    title: 'KebabCase',
    description: 'Convert to kebab-case format',
    link: '/docs/converter/string-converter/kebabcase',
    example: 'hello world → hello-world',
    category: FORMAT_CATEGORY,
  },
  {
    title: 'SnakeCase',
    description: 'Convert to snake_case format',
    link: '/docs/converter/string-converter/snakecase',
    example: 'hello world → hello_world',
    category: FORMAT_CATEGORY,
  },
  // Text Processing
  {
    title: 'Trim',
    description: 'Remove whitespace from both ends',
    link: '/docs/converter/string-converter/trim',
    example: ' hello  → hello',
    category: TEXT_CATEGORY,
  },
  {
    title: 'Deburr',
    description: 'Remove accents and diacritics',
    link: '/docs/converter/string-converter/deburr',
    example: 'café → cafe',
    category: TEXT_CATEGORY,
  },
  {
    title: 'Escape',
    description: 'Escape special characters',
    link: '/docs/converter/string-converter/escape',
    example: '<div> → &lt;div&gt;',
    category: TEXT_CATEGORY,
  },
  {
    title: 'Unescape',
    description: 'Unescape special characters',
    link: '/docs/converter/string-converter/unescape',
    example: '&lt;div&gt; → <div>',
    category: TEXT_CATEGORY,
  },
];

export default function StringConverterIndex() {
  const categories = [
    ...new Set(stringConverters.map(converter => converter.category)),
  ];

  return (
    <Container>
      <Description>
        A comprehensive collection of string manipulation and formatting tools
        for developers. All tools feature real-time conversion, persistent
        preferences, and responsive design.
      </Description>

      {categories.map(category => (
        <CategorySection key={category}>
          <CategoryTitle>{category}</CategoryTitle>
          <Grid>
            {stringConverters
              .filter(converter => converter.category === category)
              .map((converter, index) => (
                <ConverterCard
                  key={index}
                  title={converter.title}
                  description={converter.description}
                  link={converter.link}
                  example={converter.example}
                />
              ))}
          </Grid>
        </CategorySection>
      ))}

      <BackButton to='/docs/converter'>← Back to All Converters</BackButton>
    </Container>
  );
}
