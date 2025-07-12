import React, { useState, useEffect } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { convertDataFormat } from '../converters/data-format-converter';
import useThrottle from '../hooks/useThrottle';

const FORMAT_OPTIONS = ['json', 'yaml', 'xml', 'csv', 'query'];

export default function DataFormatConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [fromFormat, setFromFormat] = useState('json');
  const [toFormat, setToFormat] = useState('yaml');
  const throttledInput = useThrottle(input, 300);

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedFromFormat = localStorage.getItem('dataFormatFrom');
    const savedToFormat = localStorage.getItem('dataFormatTo');

    if (savedFromFormat && FORMAT_OPTIONS.includes(savedFromFormat)) {
      setFromFormat(savedFromFormat);
    }
    if (savedToFormat && FORMAT_OPTIONS.includes(savedToFormat)) {
      setToFormat(savedToFormat);
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('dataFormatFrom', fromFormat);
    localStorage.setItem('dataFormatTo', toFormat);
  }, [fromFormat, toFormat]);

  // Convert input when it changes
  useEffect(() => {
    if (throttledInput.trim()) {
      try {
        const result = convertDataFormat(throttledInput, toFormat);
        setOutput(result);
      } catch (error) {
        setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      setOutput('');
    }
  }, [throttledInput, toFormat]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted.${toFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExample = () => {
    let example = '';
    switch (fromFormat) {
      case 'json':
        example = '{"name": "John", "age": 30, "city": "New York"}';
        break;
      case 'yaml':
        example = 'name: John\nage: 30\ncity: New York';
        break;
      case 'xml':
        example = '<person><name>John</name><age>30</age><city>New York</city></person>';
        break;
      case 'csv':
        example = 'name,age,city\nJohn,30,New York\nJane,25,Boston';
        break;
      case 'query':
        example = 'name=John&age=30&city=New%20York';
        break;
      default:
        example = '{"name": "John", "age": 30, "city": "New York"}';
    }
    setInput(example);
  };

  const getLanguage = () => {
    switch (toFormat) {
      case 'json':
        return 'json';
      case 'yaml':
        return 'yaml';
      case 'xml':
        return 'xml';
      case 'csv':
        return 'text';
      case 'query':
        return 'text';
      default:
        return 'text';
    }
  };

  return (
    <div style={{
      margin: '2rem 0',
      border: '1px solid var(--ifm-color-emphasis-300)',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'var(--ifm-color-emphasis-100)',
        padding: '1rem',
        borderBottom: '1px solid var(--ifm-color-emphasis-300)'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--ifm-color-emphasis-900)' }}>
          Data Format Converter
        </h3>
        <p style={{ margin: '0', color: 'var(--ifm-color-emphasis-700)', fontSize: '0.9rem' }}>
          Convert between JSON, YAML, XML, CSV, and query string formats with automatic format detection.
        </p>
      </div>

      {/* Controls */}
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--ifm-color-emphasis-300)' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontWeight: '600', color: 'var(--ifm-color-emphasis-800)' }}>
            Convert from:
          </label>
          <select
            value={fromFormat}
            onChange={(e) => setFromFormat(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: '4px',
              backgroundColor: 'var(--ifm-background-color)',
              color: 'var(--ifm-color-emphasis-900)'
            }}
          >
            {FORMAT_OPTIONS.map(option => (
              <option key={option} value={option}>{option.toUpperCase()}</option>
            ))}
          </select>
          <span style={{ color: 'var(--ifm-color-emphasis-600)' }}>to</span>
          <select
            value={toFormat}
            onChange={(e) => setToFormat(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: '4px',
              backgroundColor: 'var(--ifm-background-color)',
              color: 'var(--ifm-color-emphasis-900)'
            }}
          >
            {FORMAT_OPTIONS.map(option => (
              <option key={option} value={option}>{option.toUpperCase()}</option>
            ))}
          </select>
          <button
            onClick={handleExample}
            style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: 'var(--ifm-color-emphasis-200)',
              color: 'var(--ifm-color-emphasis-800)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            Load Example
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem' }}>
        {/* Input Section */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'var(--ifm-color-emphasis-800)' }}>
            Input ({fromFormat.toUpperCase()})
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Enter ${fromFormat.toUpperCase()} data...`}
            style={{
              width: '100%',
              minHeight: '200px',
              padding: '0.75rem',
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: '4px',
              fontFamily: 'var(--ifm-font-family-monospace)',
              fontSize: '0.9rem',
              resize: 'vertical',
              backgroundColor: 'var(--ifm-background-color)',
              color: 'var(--ifm-color-emphasis-900)'
            }}
          />
        </div>

        {/* Output Section */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: '600', color: 'var(--ifm-color-emphasis-800)' }}>
              Output ({toFormat.toUpperCase()})
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleCopy}
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: 'var(--ifm-color-emphasis-200)',
                  color: 'var(--ifm-color-emphasis-800)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Copy
              </button>
              <button
                onClick={handleDownload}
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: 'var(--ifm-color-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Download
              </button>
            </div>
          </div>
          <div style={{
            border: '1px solid var(--ifm-color-emphasis-300)',
            borderRadius: '4px',
            backgroundColor: 'var(--ifm-background-color)',
            minHeight: '200px',
            position: 'relative'
          }}>
            {output ? (
              <Highlight
                theme={themes.github}
                code={output}
                language={getLanguage()}
              >
                {({ className, style, tokens, getLineProps, getTokenProps }) => (
                  <pre
                    className={className}
                    style={{
                      ...style,
                      margin: 0,
                      padding: '0.75rem',
                      fontSize: '0.9rem',
                      fontFamily: 'var(--ifm-font-family-monospace)',
                      whiteSpace: 'pre-wrap',
                      overflow: 'visible'
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
            ) : (
              <div style={{
                padding: '0.75rem',
                color: 'var(--ifm-color-emphasis-500)',
                fontStyle: 'italic',
                fontSize: '0.9rem'
              }}>
                Enter input to see conversion result...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}