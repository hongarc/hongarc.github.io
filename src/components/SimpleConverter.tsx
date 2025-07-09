import React, { useState, useEffect } from 'react';
import useDebounce from '../hooks/useDebounce';

interface SimpleConverterProps {
  conversion: (input: string) => string;
  placeholder?: string;
}

export default function SimpleConverter({
  conversion,
  placeholder = "Enter your text here..."
}: SimpleConverterProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const debouncedInput = useDebounce(input, 300);

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

  return (
    <div style={{ margin: '2rem 0' }}>
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
        <label htmlFor="converter-output" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Output:
        </label>
        <pre
          style={{
            width: '100%',
            minHeight: '200px',
            padding: '0.75rem',
            border: '1px solid var(--ifm-color-emphasis-300)',
            borderRadius: '4px',
            backgroundColor: 'var(--ifm-background-color)',
            color: 'var(--ifm-color-emphasis-900)',
            fontFamily: 'var(--ifm-font-family-monospace)',
            fontSize: '0.9rem',
            overflow: 'auto',
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word'
          }}
        >
          <code>{output}</code>
        </pre>
      </div>
    </div>
  );
}
