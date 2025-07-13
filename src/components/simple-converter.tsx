import { Highlight, themes } from 'prism-react-renderer';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import useThrottle from '../hooks/use-throttle';

interface SimpleConverterProperties {
  conversion: (input: string) => string;
  placeholder?: string;
  language?: string;
  exampleInput?: string;
  showPreview?: boolean;
  previewMode?: 'inline' | 'multiline';
}

const FONT_FAMILY = 'var(--ifm-font-family-monospace)';

const Container = styled.div`
  margin: 2rem 0;
`;

const PreviewInline = styled.div`
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: var(--ifm-color-emphasis-100);
  border-radius: 4px;
  font-size: 0.9rem;
  font-family: ${FONT_FAMILY};
`;

const PreviewMultiline = styled.div`
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: var(--ifm-color-emphasis-100);
  border-radius: 4px;
  font-family: ${FONT_FAMILY};
  font-size: 0.9rem;
`;

const PreviewInput = styled.div`
  margin-bottom: 0.25rem;
`;

const PreviewArrow = styled.div`
  font-size: 1.2rem;
  text-align: center;
  margin: 0.25rem 0;
`;

const InputSection = styled.div`
  margin-bottom: 1rem;
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: 4px;
  font-family: ${FONT_FAMILY};
  font-size: 0.9rem;
  resize: vertical;
  background-color: var(--ifm-background-color);
  color: var(--ifm-color-emphasis-900);
  min-height: 200px;
`;

const OutputHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const OutputLabel = styled.label`
  font-weight: bold;
  margin: 0;
`;

const CopyButton = styled.button<{ disabled: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: 4px;
  background-color: ${properties =>
    properties.disabled
      ? 'var(--ifm-color-emphasis-300)'
      : 'var(--ifm-background-color)'};
  color: ${properties =>
    properties.disabled
      ? 'var(--ifm-color-emphasis-500)'
      : 'var(--ifm-color-emphasis-900)'};
  cursor: ${properties => (properties.disabled ? 'not-allowed' : 'pointer')};
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: ${properties => (properties.disabled ? 0.5 : 1)};
`;

const OutputContainer = styled.div`
  position: relative;
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: 4px;
  background-color: var(--ifm-background-color);
  min-height: 200px;
`;

const HighlightedPre = styled.pre`
  margin: 0;
  padding: 0.75rem;
  font-family: ${FONT_FAMILY};
  font-size: 0.9rem;
  overflow: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  min-height: 200px;
  display: flex;
  align-items: flex-start;
`;

export default function SimpleConverter({
  conversion,
  placeholder = 'Enter your text here...',
  language = 'text',
  exampleInput,
  showPreview = true,
  previewMode = 'inline',
}: SimpleConverterProperties) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  // Throttle the conversion function instead of the input
  const throttledConversion = useThrottle((inputValue: string) => {
    if (inputValue) {
      try {
        const result = conversion(inputValue);
        setOutput(result);
      } catch {
        setOutput('Error: Invalid input');
      }
    } else {
      setOutput('');
    }
  }, 300);

  // Calculate example output if example input is provided
  const exampleOutput = exampleInput ? conversion(exampleInput) : '';

  useEffect(() => {
    throttledConversion(input);
  }, [input, throttledConversion]);

  const handleCopy = async () => {
    if ((output || exampleOutput).startsWith('Error:')) return;
    try {
      await navigator.clipboard.writeText(output || exampleOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently handle copy errors
    }
  };

  const renderPreview = () => {
    if (!showPreview || !exampleInput) return;

    if (previewMode === 'inline') {
      return (
        <PreviewInline>
          <code>
            {exampleInput} → {exampleOutput}
          </code>
        </PreviewInline>
      );
    }

    return (
      <PreviewMultiline>
        <PreviewInput>
          <code>{exampleInput}</code>
        </PreviewInput>
        <PreviewArrow>↓</PreviewArrow>
        <div>
          <code>{exampleOutput}</code>
        </div>
      </PreviewMultiline>
    );
  };

  const renderHighlightedOutput = (code: string) => {
    return (
      <Highlight theme={themes.github} code={code} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <HighlightedPre className={className} style={style}>
            {tokens.map((line, index) => (
              <div key={index} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </HighlightedPre>
        )}
      </Highlight>
    );
  };

  return (
    <Container>
      {/* Real Data Conversion Preview */}
      {renderPreview()}

      <InputSection>
        <InputLabel htmlFor='converter-input'>Input:</InputLabel>
        <TextArea
          id='converter-input'
          value={input}
          onChange={event => setInput(event.target.value)}
          placeholder={placeholder}
          rows={8}
        />
      </InputSection>

      <div>
        <OutputHeader>
          <OutputLabel htmlFor='converter-output'>Output:</OutputLabel>
          <CopyButton
            onClick={handleCopy}
            disabled={(output || exampleOutput).startsWith('Error:')}
            title='Copy to clipboard'
          >
            {copied ? 'Copied!' : 'Copy'}
          </CopyButton>
        </OutputHeader>
        <OutputContainer>
          {renderHighlightedOutput(
            output || exampleOutput || 'Output will appear here...'
          )}
        </OutputContainer>
      </div>
    </Container>
  );
}
