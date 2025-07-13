import React, { useState, useEffect } from 'react';

import {
  convertByteSize,
  toBytes,
  toHumanReadable,
} from '../converters/byte-size-converters';
import useThrottle from '../hooks/use-throttle';
import {
  Container,
  Header,
  HeaderTitle,
  HeaderDescription,
  Controls,
  ControlsRow,
  ExampleButton,
  Content,
  Section,
  SectionLabel,
  TextArea,
  OutputContainer,
  OutputGrid,
  OutputCard,
  CardHeader,
  CardTitle,
  CopyButton,
  CardContent,
  EmptyState,
} from '../styles/common';

const FORMAT_OPTIONS = [
  { value: 'bytes', label: 'Bytes' },
  { value: 'kb', label: 'KB' },
  { value: 'mb', label: 'MB' },
  { value: 'gb', label: 'GB' },
  { value: 'tb', label: 'TB' },
  { value: 'pb', label: 'PB' },
  { value: 'human', label: 'Human-Readable' },
];

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
