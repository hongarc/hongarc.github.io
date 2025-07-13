import Link from '@docusaurus/Link';
import React from 'react';
import styled from 'styled-components';

interface ConverterItem {
  title: string;
  description: string;
  link: string;
  example: string;
}

const usefulConverters: ConverterItem[] = [
  {
    title: 'Uppercase',
    description: 'Convert text to uppercase letters',
    link: '/docs/converter/string-converter/uppercase',
    example: 'abc → ABC',
  },
  {
    title: 'CamelCase',
    description: 'Convert to camelCase format',
    link: '/docs/converter/string-converter/camelcase',
    example: 'hello world → helloWorld',
  },
  {
    title: 'KebabCase',
    description: 'Convert to kebab-case format',
    link: '/docs/converter/string-converter/kebabcase',
    example: 'hello world → hello-world',
  },
  {
    title: 'SnakeCase',
    description: 'Convert to snake_case format',
    link: '/docs/converter/string-converter/snakecase',
    example: 'hello world → hello_world',
  },
  {
    title: 'Capitalize',
    description: 'Capitalize first letter of string',
    link: '/docs/converter/string-converter/capitalize',
    example: 'hello world → Hello world',
  },
  {
    title: 'Trim',
    description: 'Remove whitespace from both ends',
    link: '/docs/converter/string-converter/trim',
    example: ' hello  → hello',
  },
  {
    title: 'Deburr',
    description: 'Remove accents and diacritics',
    link: '/docs/converter/string-converter/deburr',
    example: 'café → cafe',
  },
  {
    title: 'Class to Function',
    description: 'Convert static class methods to named functions',
    link: '/docs/converter/class-to-named-function',
    example: 'static method → function',
  },
];

const Container = styled.div`
  margin: 3rem 0;
  padding: 2rem;
  background-color: var(--ifm-color-emphasis-50);
  border-radius: 12px;
  border: 1px solid var(--ifm-color-emphasis-200);
`;

const Title = styled.h2`
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ifm-color-emphasis-900);
  text-align: center;
`;

const Description = styled.p`
  text-align: center;
  margin: 0 0 2rem 0;
  color: var(--ifm-color-emphasis-700);
  font-size: 1rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
`;

const CardLink = styled(Link)`
  display: block;
  padding: 1.5rem;
  background-color: var(--ifm-background-color);
  border: 1px solid var(--ifm-color-emphasis-200);
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  text-align: center;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CardTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--ifm-color-primary);
`;

const CardDesc = styled.p`
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  color: var(--ifm-color-emphasis-600);
  line-height: 1.4;
`;

const CardExample = styled.div`
  padding: 0.5rem;
  background-color: var(--ifm-color-emphasis-100);
  border-radius: 4px;
  font-family: var(--ifm-font-family-monospace);
  font-size: 0.8rem;
  color: var(--ifm-color-emphasis-800);
`;

const BottomSection = styled.div`
  text-align: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--ifm-color-emphasis-200);
`;

const AllConvertersButton = styled(Link)`
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: var(--ifm-color-primary);
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: background-color 0.2s ease;
  &:hover {
    background-color: var(--ifm-color-primary-dark);
  }
`;

export default function UsefulConverters() {
  return (
    <Container>
      <Title>🚀 Useful Converters</Title>
      <Description>
        Quick access to the most frequently used converters
      </Description>
      <Grid>
        {usefulConverters.map((converter, index) => (
          <CardLink key={index} to={converter.link}>
            <CardTitle>{converter.title}</CardTitle>
            <CardDesc>{converter.description}</CardDesc>
            <CardExample>{converter.example}</CardExample>
          </CardLink>
        ))}
      </Grid>
      <BottomSection>
        <AllConvertersButton to='/docs/converter'>
          View All Converters →
        </AllConvertersButton>
      </BottomSection>
    </Container>
  );
}
