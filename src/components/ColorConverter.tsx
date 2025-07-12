import React, { useState, useEffect } from 'react';
import { convertColor } from '../converters/color-converters';

const FORMAT_OPTIONS = [
  { value: 'hex', label: 'HEX' },
  { value: 'rgb', label: 'RGB' },
  { value: 'rgba', label: 'RGBA' },
  { value: 'hsl', label: 'HSL' },
  { value: 'hsla', label: 'HSLA' },
  { value: 'hsv', label: 'HSV' },
  { value: 'cmyk', label: 'CMYK' }
];

export default function ColorConverter() {
  const [input, setInput] = useState('');
  const [outputs, setOutputs] = useState<Record<string, string>>({});

  // Convert input when it changes
  useEffect(() => {
    if (input.trim()) {
      const newOutputs: Record<string, string> = {};
      FORMAT_OPTIONS.forEach(option => {
        try {
          newOutputs[option.value] = convertColor(input, option.value);
        } catch (error) {
          newOutputs[option.value] = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
      });
      setOutputs(newOutputs);
    } else {
      setOutputs({});
    }
  }, [input]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleExample = () => {
    const example = '#ff0000';
    setInput(example);
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
          Color Converter
        </h3>
        <p style={{ margin: '0', color: 'var(--ifm-color-emphasis-700)', fontSize: '0.9rem' }}>
          Convert colors between HEX, RGB, HSL, HSV, and CMYK formats with automatic detection.
        </p>
      </div>

      {/* Controls */}
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--ifm-color-emphasis-300)' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', padding: '1rem' }}>
        {/* Input Section */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'var(--ifm-color-emphasis-800)' }}>
            Input Color (Auto-detected)
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter color (HEX, RGB, HSL, etc.)..."
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid var(--ifm-color-emphasis-300)',
                borderRadius: '4px',
                fontFamily: 'var(--ifm-font-family-monospace)',
                fontSize: '0.9rem',
                backgroundColor: 'var(--ifm-background-color)',
                color: 'var(--ifm-color-emphasis-900)'
              }}
            />
            {input && (
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '4px',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  backgroundColor: input,
                  flexShrink: 0
                }}
              />
            )}
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Or paste color data here..."
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
          <label style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'var(--ifm-color-emphasis-800)' }}>
            All Output Formats
          </label>
          <div style={{
            border: '1px solid var(--ifm-color-emphasis-300)',
            borderRadius: '4px',
            backgroundColor: 'var(--ifm-background-color)',
            minHeight: '300px',
            maxHeight: '600px',
            overflow: 'auto',
            padding: '0.75rem'
          }}>
            {Object.keys(outputs).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {FORMAT_OPTIONS.map(option => (
                  <div key={option.value} style={{
                    border: '1px solid var(--ifm-color-emphasis-200)',
                    borderRadius: '4px',
                    padding: '0.75rem',
                    backgroundColor: 'var(--ifm-color-emphasis-50)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '600', color: 'var(--ifm-color-emphasis-800)', fontSize: '0.9rem' }}>
                        {option.label}
                      </span>
                      <button
                        onClick={() => handleCopy(outputs[option.value])}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: 'var(--ifm-color-emphasis-200)',
                          color: 'var(--ifm-color-emphasis-800)',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.7rem'
                        }}
                      >
                        Copy
                      </button>
                    </div>
                    <div style={{
                      fontFamily: 'var(--ifm-font-family-monospace)',
                      fontSize: '0.85rem',
                      color: 'var(--ifm-color-emphasis-900)',
                      wordBreak: 'break-all',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {outputs[option.value]}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                color: 'var(--ifm-color-emphasis-500)',
                fontStyle: 'italic',
                fontSize: '0.9rem',
                textAlign: 'center',
                padding: '2rem'
              }}>
                Enter color to see conversion results...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}