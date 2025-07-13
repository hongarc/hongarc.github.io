import { Highlight, themes } from 'prism-react-renderer';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import { generateId } from '../converters/id-generators';
import useLocalStorage from '../hooks/use-local-storage';

const GENERATOR_TYPES = [
  { value: 'uuid-v4', label: 'UUID v4' },
  { value: 'nanoid', label: 'NanoID' },
  { value: 'cuid', label: 'CUID' },
  { value: 'cuid2', label: 'CUID2' },
  { value: 'ulid', label: 'ULID' },
  { value: 'crypto-random-uuid', label: 'Crypto UUID' },
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
  margin-bottom: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const Label = styled.label`
  font-weight: 600;
  color: var(--ifm-color-emphasis-800);
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: 4px;
  background-color: var(--ifm-background-color);
  color: var(--ifm-color-emphasis-900);
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: 4px;
  background-color: var(--ifm-background-color);
  color: var(--ifm-color-emphasis-900);
  width: 80px;
`;

const GenerateButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: var(--ifm-color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
`;

const AutoGenerateNotice = styled.div`
  padding: 0.5rem;
  background-color: var(--ifm-color-emphasis-50);
  border-radius: 4px;
  font-size: 0.8rem;
  color: var(--ifm-color-emphasis-700);
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
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

const SettingsBox = styled.div`
  padding: 1rem;
  background-color: var(--ifm-color-emphasis-50);
  border-radius: 4px;
  border: 1px solid var(--ifm-color-emphasis-200);
`;

const SettingsText = styled.p`
  margin: 0 0 0.5rem 0;
  color: var(--ifm-color-emphasis-700);
  font-size: 0.9rem;
`;

const SettingsTextSmall = styled.p`
  margin: 0;
  color: var(--ifm-color-emphasis-600);
  font-size: 0.8rem;
`;

const OutputHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const CopyButton = styled.button<{ disabled: boolean }>`
  padding: 0.25rem 0.5rem;
  background-color: ${properties =>
    properties.disabled
      ? 'var(--ifm-color-emphasis-300)'
      : 'var(--ifm-color-emphasis-200)'};
  color: ${properties =>
    properties.disabled
      ? 'var(--ifm-color-emphasis-500)'
      : 'var(--ifm-color-emphasis-800)'};
  border: none;
  border-radius: 4px;
  cursor: ${properties => (properties.disabled ? 'not-allowed' : 'pointer')};
  font-size: 0.8rem;
  opacity: ${properties => (properties.disabled ? 0.5 : 1)};
`;

const OutputContainer = styled.div`
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: 4px;
  background-color: var(--ifm-background-color);
  min-height: 200px;
  position: relative;
`;

const EmptyOutput = styled.div`
  padding: 0.75rem;
  color: var(--ifm-color-emphasis-500);
  font-style: italic;
  font-size: 0.9rem;
`;

export default function IdGenerator() {
  const [output, setOutput] = useState('');
  const [hasError, setHasError] = useState(false);

  // Use useLocalStorage hook for type-safe localStorage management
  const [generatorType, setGeneratorType] = useLocalStorage(
    'idGeneratorType',
    'uuid-v4'
  );
  const [generatorCount, setGeneratorCount] = useLocalStorage(
    'idGeneratorCount',
    1
  );

  // Auto-generate when count <= 5 or when type/count changes
  useEffect(() => {
    if (generatorCount <= 5) {
      handleGenerate();
    }
  }, [generatorType, generatorCount]);

  const handleGenerate = () => {
    try {
      const results = [];
      for (let index = 0; index < generatorCount; index++) {
        results.push(generateId(generatorType));
      }
      setOutput(results.join('\n'));
      setHasError(false);
    } catch (error) {
      setOutput(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      setHasError(true);
    }
  };

  const handleCopyClick = async () => {
    if (hasError) return; // Disable copy for errors
    try {
      await navigator.clipboard.writeText(output);
    } catch {
      // Silently handle copy errors
    }
  };

  return (
    <Container>
      {/* Header */}
      <Header>
        <HeaderTitle>ID Generator</HeaderTitle>
        <HeaderDescription>
          Generate various types of unique identifiers for your applications.
        </HeaderDescription>
      </Header>

      {/* Controls */}
      <Controls>
        <ControlsRow>
          <Label>Generator Type:</Label>
          <Select
            value={generatorType}
            onChange={event => setGeneratorType(event.target.value)}
          >
            {GENERATOR_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
          <Label>Count:</Label>
          <Input
            type='number'
            min='1'
            max='100'
            value={generatorCount}
            onChange={event =>
              setGeneratorCount(Number.parseInt(event.target.value) || 1)
            }
          />
          <GenerateButton onClick={handleGenerate}>Generate</GenerateButton>
        </ControlsRow>
        {generatorCount <= 5 && (
          <AutoGenerateNotice>
            Auto-generating {generatorCount} identifier
            {generatorCount > 1 ? 's' : ''}...
          </AutoGenerateNotice>
        )}
      </Controls>

      {/* Content */}
      <Content>
        {/* Settings Section */}
        <Section>
          <SectionLabel>Settings</SectionLabel>
          <SettingsBox>
            <SettingsText>
              <strong>Type:</strong>{' '}
              {GENERATOR_TYPES.find(t => t.value === generatorType)?.label}
            </SettingsText>
            <SettingsText>
              <strong>Count:</strong> {generatorCount} identifier
              {generatorCount > 1 ? 's' : ''}
            </SettingsText>
            <SettingsTextSmall>
              {generatorCount <= 5
                ? 'Auto-generating on change'
                : 'Click "Generate" to create identifiers'}
            </SettingsTextSmall>
          </SettingsBox>
        </Section>

        {/* Output Section */}
        <Section>
          <OutputHeader>
            <SectionLabel>Generated IDs</SectionLabel>
            <CopyButton onClick={handleCopyClick} disabled={hasError}>
              Copy
            </CopyButton>
          </OutputHeader>
          <OutputContainer>
            {output ? (
              <Highlight theme={themes.github} code={output} language='text'>
                {({
                  className,
                  style,
                  tokens,
                  getLineProps,
                  getTokenProps,
                }) => (
                  <pre
                    className={className}
                    style={{
                      ...style,
                      margin: 0,
                      padding: '0.75rem',
                      fontSize: '0.9rem',
                      fontFamily: 'var(--ifm-font-family-monospace)',
                      whiteSpace: 'pre-wrap',
                      overflow: 'visible',
                    }}
                  >
                    {tokens.map((line, index) => (
                      <div key={index} {...getLineProps({ line })}>
                        {line.map((token, key) => (
                          <span key={key} {...getTokenProps({ token })} />
                        ))}
                      </div>
                    ))}
                  </pre>
                )}
              </Highlight>
            ) : (
              <EmptyOutput>Click Generate to create identifiers...</EmptyOutput>
            )}
          </OutputContainer>
        </Section>
      </Content>
    </Container>
  );
}
