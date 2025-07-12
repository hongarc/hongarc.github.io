import React, { useState, useEffect } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import useDebounce from '../hooks/useDebounce';

interface SimpleConverterProps {
  conversion: (input: string) => string;
  placeholder?: string;
  language?: string;
  exampleInput?: string;
  showPreview?: boolean;
  previewMode?: 'inline' | 'multiline';
}

export default function SimpleConverter({
  conversion,
  placeholder = "Enter your text here...",
  language = "text",
  exampleInput,
  showPreview = true,
  previewMode = 'inline'
}: SimpleConverterProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const debouncedInput = useDebounce(input, 300);

  // Calculate example output if example input is provided
  const exampleOutput = exampleInput ? conversion(exampleInput) : '';

  useEffect(() => {
    if (debouncedInput) {
      try {
        const result = conversion(debouncedInput);
        setOutput(result);
      } catch (error) {
        setOutput('Error: Invalid input');
      }
    } else {
      setOutput('');
    }
  }, [debouncedInput, conversion]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output || exampleOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text: ', error);
    }
  };

  const renderPreview = () => {
    if (!showPreview || !exampleInput) return null;

    if (previewMode === 'inline') {
      return (
        <div style={{
          marginBottom: '1rem',
          padding: '0.5rem',
          backgroundColor: 'var(--ifm-color-emphasis-100)',
          borderRadius: '4px',
          fontSize: '0.9rem',
          fontFamily: 'var(--ifm-font-family-monospace)'
        }}>
          <code>{exampleInput} → {exampleOutput}</code>
        </div>
      );
    }

    return (
      <div style={{
        marginBottom: '1rem',
        padding: '0.75rem',
        backgroundColor: 'var(--ifm-color-emphasis-100)',
        borderRadius: '4px',
        fontFamily: 'var(--ifm-font-family-monospace)',
        fontSize: '0.9rem'
      }}>
        <div style={{ marginBottom: '0.25rem' }}>
          <code>{exampleInput}</code>
        </div>
        <div style={{ fontSize: '1.2rem', textAlign: 'center', margin: '0.25rem 0' }}>↓</div>
        <div>
          <code>{exampleOutput}</code>
        </div>
      </div>
    );
  };

  const renderHighlightedOutput = (code: string) => {
    return (
      <Highlight
        theme={themes.github}
        code={code}
        language={language}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={className}
            style={{
              ...style,
              margin: 0,
              padding: '0.75rem',
              fontFamily: 'var(--ifm-font-family-monospace)',
              fontSize: '0.9rem',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              minHeight: '200px',
              display: 'flex',
              alignItems: 'flex-start'
            }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    );
  };

  return (
    <div style={{ margin: '2rem 0' }}>
      {/* Real Data Conversion Preview */}
      {renderPreview()}

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="converter-input" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Input:
        </label>
        <textarea
          id="converter-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          rows={8}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid var(--ifm-color-emphasis-300)',
            borderRadius: '4px',
            fontFamily: 'var(--ifm-font-family-monospace)',
            fontSize: '0.9rem',
            resize: 'vertical',
            backgroundColor: 'var(--ifm-background-color)',
            color: 'var(--ifm-color-emphasis-900)',
            minHeight: '200px'
          }}
        />
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label htmlFor="converter-output" style={{ fontWeight: 'bold', margin: 0 }}>
            Output:
          </label>
          <button
            onClick={handleCopy}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: '4px',
              backgroundColor: copied ? 'var(--ifm-color-success)' : 'var(--ifm-background-color)',
              color: copied ? 'white' : 'var(--ifm-color-emphasis-900)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            title="Copy to clipboard"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div
          style={{
            position: 'relative',
            border: '1px solid var(--ifm-color-emphasis-300)',
            borderRadius: '4px',
            backgroundColor: 'var(--ifm-background-color)',
            minHeight: '200px'
          }}
        >
          {renderHighlightedOutput(output || exampleOutput || 'Output will appear here...')}
        </div>
      </div>
    </div>
  );
}
