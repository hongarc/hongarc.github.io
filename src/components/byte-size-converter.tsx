import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import {
  convertByteSize,
  toBytes,
  toHumanReadable,
} from '../converters/byte-size-converters';
import useThrottle from '../hooks/use-throttle';

const FORMAT_OPTIONS = [
  { value: 'bytes', label: 'Bytes' },
  { value: 'kb', label: 'KB' },
  { value: 'mb', label: 'MB' },
  { value: 'gb', label: 'GB' },
  { value: 'tb', label: 'TB' },
  { value: 'pb', label: 'PB' },
  { value: 'human', label: 'Human-Readable' },
];

const Container = styled.div`
  margin: 2rem 0;
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: 8px;
  overflow: hidden;
`;

const Header = styled.div`
  background-color: var(--ifm-color-emphasis-100);
  padding: 1rem;
  border-bottom: 1px solid var(--ifm-color-emphasis-300);
`;

const HeaderTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: var(--ifm-color-emphasis-900);
`;

const HeaderDescription = styled.p`
  margin: 0;
  color: var(--ifm-color-emphasis-700);
  font-size: 0.9rem;
`;

const Controls = styled.div`
  padding: 1rem;
  border-bottom: 1px solid var(--ifm-color-emphasis-300);
`;

const ControlsRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const ExampleButton = styled.button`
  padding: 0.25rem 0.5rem;
  background-color: var(--ifm-color-emphasis-200);
  color: var(--ifm-color-emphasis-800);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
  padding: 1rem;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
`;

const SectionLabel = styled.label`
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--ifm-color-emphasis-800);
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 300px;
  padding: 0.75rem;
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: 4px;
  font-family: var(--ifm-font-family-monospace);
  font-size: 0.9rem;
  resize: vertical;
  background-color: var(--ifm-background-color);
  color: var(--ifm-color-emphasis-900);
`;

const OutputContainer = styled.div`
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: 4px;
  background-color: var(--ifm-background-color);
  min-height: 300px;
  max-height: 600px;
  overflow: auto;
  padding: 0.75rem;
`;

const OutputGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const OutputCard = styled.div`
  border: 1px solid var(--ifm-color-emphasis-200);
  border-radius: 4px;
  padding: 0.75rem;
  background-color: var(--ifm-color-emphasis-50);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const CardTitle = styled.span`
  font-weight: 600;
  color: var(--ifm-color-emphasis-800);
  font-size: 0.9rem;
`;

const CopyButton = styled.button`
  padding: 0.25rem 0.5rem;
  background-color: var(--ifm-color-emphasis-200);
  color: var(--ifm-color-emphasis-800);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.7rem;
`;

const CardContent = styled.div`
  font-family: var(--ifm-font-family-monospace);
  font-size: 0.9rem;
  color: var(--ifm-color-emphasis-900);
  word-break: break-all;
`;

const EmptyState = styled.div`
  color: var(--ifm-color-emphasis-500);
  font-style: italic;
  text-align: center;
  padding: 2rem;
`;

const handleCopy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Silently handle copy errors
  }
};

export default function ByteSizeConverter() {
  const [input, setInput] = useState('');
  const [outputs, setOutputs] = useState<Record<string, string>>({});

  // Throttle the conversion function instead of the input
  const throttledConversion = useThrottle((inputValue: string) => {
    if (inputValue.trim()) {
      const newOutputs: Record<string, string> = {};
      for (const option of FORMAT_OPTIONS) {
        try {
          if (option.value === 'human') {
            // Handle human-readable format specially
            const bytes = toBytes(inputValue);
            newOutputs[option.value] = toHumanReadable(bytes);
          } else {
            newOutputs[option.value] = convertByteSize(
              inputValue,
              option.value
            );
          }
        } catch (error) {
          newOutputs[option.value] =
            `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
      }
      setOutputs(newOutputs);
    } else {
      setOutputs({});
    }
  }, 300);

  // Convert input when it changes
  useEffect(() => {
    throttledConversion(input);
  }, [input, throttledConversion]);

  const handleExample = () => {
    const example = '1024';
    setInput(example);
  };

  return (
    <Container>
      {/* Header */}
      <Header>
        <HeaderTitle>Byte Size Converter</HeaderTitle>
        <HeaderDescription>
          Convert between bytes, KB, MB, GB, TB, PB, and human-readable formats.
        </HeaderDescription>
      </Header>

      {/* Controls */}
      <Controls>
        <ControlsRow>
          <ExampleButton onClick={handleExample}>Load Example</ExampleButton>
        </ControlsRow>
      </Controls>

      {/* Content */}
      <Content>
        {/* Input Section */}
        <Section>
          <SectionLabel>Input Size (Auto-detected)</SectionLabel>
          <TextArea
            value={input}
            onChange={event => setInput(event.target.value)}
            placeholder='Enter size (e.g., 1024, 1KB, 1.5MB)...'
          />
        </Section>

        {/* Output Section */}
        <Section>
          <SectionLabel>All Output Formats</SectionLabel>
          <OutputContainer>
            {Object.keys(outputs).length > 0 ? (
              <OutputGrid>
                {FORMAT_OPTIONS.map(option => {
                  const output = outputs[option.value];
                  // Hide output if it's 0 or contains "0 " (like "0 B", "0 KB", etc.)
                  if (output === '0' || output.startsWith('0 ')) {
                    return;
                  }
                  return (
                    <OutputCard key={option.value}>
                      <CardHeader>
                        <CardTitle>{option.label}</CardTitle>
                        <CopyButton onClick={() => handleCopy(output)}>
                          Copy
                        </CopyButton>
                      </CardHeader>
                      <CardContent>{output}</CardContent>
                    </OutputCard>
                  );
                }).filter(Boolean)}
              </OutputGrid>
            ) : (
              <EmptyState>Enter a size to see conversions...</EmptyState>
            )}
          </OutputContainer>
        </Section>
      </Content>
    </Container>
  );
}
