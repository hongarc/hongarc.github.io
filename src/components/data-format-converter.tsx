import { Highlight, themes } from 'prism-react-renderer';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import { convertDataFormat } from '../converters/data-format-converter';
import useLocalStorage from '../hooks/use-local-storage';
import useThrottle from '../hooks/use-throttle';

const FORMAT_OPTIONS = ['json', 'yaml', 'xml', 'csv', 'query'];

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

const ToLabel = styled.span`
  color: var(--ifm-color-emphasis-600);
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

const TextArea = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: 0.75rem;
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: 4px;
  font-family: var(--ifm-font-family-monospace);
  font-size: 0.9rem;
  resize: vertical;
  background-color: var(--ifm-background-color);
  color: var(--ifm-color-emphasis-900);
`;

const OutputHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const CopyButton = styled.button`
  padding: 0.25rem 0.5rem;
  background-color: var(--ifm-color-emphasis-200);
  color: var(--ifm-color-emphasis-800);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
`;

const DownloadButton = styled.button`
  padding: 0.25rem 0.5rem;
  background-color: var(--ifm-color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
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

export default function DataFormatConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  // Use useLocalStorage hook for type-safe localStorage management
  const [fromFormat, setFromFormat] = useLocalStorage('dataFormatFrom', 'json');
  const [toFormat, setToFormat] = useLocalStorage('dataFormatTo', 'yaml');

  // Throttle the conversion function instead of the input
  const throttledConversion = useThrottle(
    (inputValue: string, fromFmt: string, toFmt: string) => {
      if (inputValue.trim() && fromFmt !== toFmt) {
        try {
          const result = convertDataFormat(inputValue, toFmt);
          setOutput(result);
        } catch (error) {
          setOutput(
            `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      } else {
        setOutput('');
      }
    },
    300
  );

  // Convert input when it changes
  useEffect(() => {
    throttledConversion(input, fromFormat, toFormat);
  }, [input, fromFormat, toFormat, throttledConversion]);

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch {
      // Silently handle copy errors
    }
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted.${toFormat}`;
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExample = () => {
    let example = '';
    switch (fromFormat) {
      case 'json': {
        example = '{"name": "John", "age": 30, "city": "New York"}';
        break;
      }
      case 'yaml': {
        example = 'name: John\nage: 30\ncity: New York';
        break;
      }
      case 'xml': {
        example =
          '<person><name>John</name><age>30</age><city>New York</city></person>';
        break;
      }
      case 'csv': {
        example = 'name,age,city\nJohn,30,New York\nJane,25,Boston';
        break;
      }
      case 'query': {
        example = 'name=John&age=30&city=New%20York';
        break;
      }
      default: {
        example = '{"name": "John", "age": 30, "city": "New York"}';
      }
    }
    setInput(example);
  };

  const getLanguage = () => {
    switch (toFormat) {
      case 'json': {
        return 'json';
      }
      case 'yaml': {
        return 'yaml';
      }
      case 'xml': {
        return 'xml';
      }
      case 'csv': {
        return 'text';
      }
      case 'query': {
        return 'text';
      }
      default: {
        return 'text';
      }
    }
  };

  return (
    <Container>
      {/* Header */}
      <Header>
        <HeaderTitle>Data Format Converter</HeaderTitle>
        <HeaderDescription>
          Convert between JSON, YAML, XML, CSV, and query string formats with
          automatic format detection.
        </HeaderDescription>
      </Header>

      {/* Controls */}
      <Controls>
        <ControlsRow>
          <Label>Convert from:</Label>
          <Select
            value={fromFormat}
            onChange={event => setFromFormat(event.target.value)}
          >
            {FORMAT_OPTIONS.map(option => (
              <option key={option} value={option}>
                {option.toUpperCase()}
              </option>
            ))}
          </Select>
          <ToLabel>to</ToLabel>
          <Select
            value={toFormat}
            onChange={event => setToFormat(event.target.value)}
          >
            {FORMAT_OPTIONS.map(option => (
              <option key={option} value={option}>
                {option.toUpperCase()}
              </option>
            ))}
          </Select>
          <ExampleButton onClick={handleExample}>Load Example</ExampleButton>
        </ControlsRow>
      </Controls>

      {/* Content */}
      <Content>
        {/* Input Section */}
        <Section>
          <SectionLabel>Input ({fromFormat.toUpperCase()})</SectionLabel>
          <TextArea
            value={input}
            onChange={event => setInput(event.target.value)}
            placeholder={`Enter ${fromFormat.toUpperCase()} data...`}
          />
        </Section>

        {/* Output Section */}
        <Section>
          <OutputHeader>
            <SectionLabel>Output ({toFormat.toUpperCase()})</SectionLabel>
            <ButtonGroup>
              <CopyButton onClick={handleCopyClick}>Copy</CopyButton>
              <DownloadButton onClick={handleDownload}>Download</DownloadButton>
            </ButtonGroup>
          </OutputHeader>
          <OutputContainer>
            {output ? (
              <Highlight
                theme={themes.github}
                code={output}
                language={getLanguage()}
              >
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
              <EmptyOutput>Enter input to see conversion result...</EmptyOutput>
            )}
          </OutputContainer>
        </Section>
      </Content>
    </Container>
  );
}
