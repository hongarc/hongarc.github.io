import React from 'react';
import styled from 'styled-components';

import ConverterCard from './common/card';
import {
  Container,
  Title,
  Description,
  Grid,
  BackButton,
} from './common/layout';

interface ConverterItem {
  title: string;
  description: string;
  link: string;
  example: string;
}

const usefulConverters: ConverterItem[] = [
  {
    title: 'Class to Function',
    description: 'Convert static class methods to named functions',
    link: '/docs/converter/class-to-named-function',
    example: 'static method → function',
  },
  {
    title: 'Data Format Converter',
    description: 'Convert between JSON, YAML, XML, CSV formats',
    link: '/docs/converter/data-format-converters',
    example: 'JSON ↔ YAML ↔ XML',
  },
  {
    title: 'ID Generator',
    description: 'Generate UUID, NanoID, CUID, and other IDs',
    link: '/docs/converter/id-generators',
    example: 'UUID v4, NanoID, CUID',
  },
  {
    title: 'Timestamp Converter',
    description: 'Convert between Unix timestamps and readable dates',
    link: '/docs/converter/timestamp-converters',
    example: 'Unix ↔ ISO ↔ Local',
  },
  {
    title: 'Color Converter',
    description: 'Convert between HEX, RGB, HSL, CMYK formats',
    link: '/docs/converter/color-converters',
    example: 'HEX ↔ RGB ↔ HSL',
  },
  {
    title: 'Byte Size Converter',
    description: 'Convert between bytes, KB, MB, GB, TB',
    link: '/docs/converter/byte-size-converters',
    example: '1 MB → 1024 KB',
  },
];

const StyledContainer = styled(Container)`
  margin: 3rem 0;
  padding: 2rem;
  background-color: var(--ifm-color-emphasis-50);
  border-radius: 12px;
  border: 1px solid var(--ifm-color-emphasis-200);
`;

const StyledTitle = styled(Title)`
  margin: 0 0 1.5rem 0;
  text-align: center;
`;

const StyledDescription = styled(Description)`
  text-align: center;
  margin: 0 0 2rem 0;
`;

const StyledGrid = styled(Grid)`
  margin-top: 1.5rem;
`;

const BottomSection = styled.div`
  text-align: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--ifm-color-emphasis-200);
`;

const AllConvertersButton = styled(BackButton)`
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
    <StyledContainer>
      <StyledTitle>🚀 Popular Converters</StyledTitle>
      <StyledDescription>
        Quick access to the most popular converter tools
      </StyledDescription>
      <StyledGrid>
        {usefulConverters.map((converter, index) => (
          <ConverterCard
            key={index}
            title={converter.title}
            description={converter.description}
            link={converter.link}
            example={converter.example}
          />
        ))}
      </StyledGrid>
      <BottomSection>
        <AllConvertersButton to='/docs/converter'>
          View All Converters →
        </AllConvertersButton>
      </BottomSection>
    </StyledContainer>
  );
}
