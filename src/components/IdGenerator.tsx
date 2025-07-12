import React, { useState, useEffect } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { generateUuidV4, generateNanoId, generateCuid, generateCuid2, generateUlid, generateHexId } from '../converters/id-generators';

const GENERATOR_TYPES = [
  { value: 'uuid', label: 'UUID v4' },
  { value: 'nanoid', label: 'NanoID' },
  { value: 'cuid', label: 'CUID' },
  { value: 'cuid2', label: 'CUID2' },
  { value: 'ulid', label: 'ULID' },
  { value: 'hex', label: 'HEX' }
];

export default function IdGenerator() {
  const [output, setOutput] = useState('');
  const [generatorType, setGeneratorType] = useState('uuid');
  const [generatorCount, setGeneratorCount] = useState(1);
  const [hasError, setHasError] = useState(false);

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedType = localStorage.getItem('idGeneratorType');
    const savedCount = localStorage.getItem('idGeneratorCount');

    if (savedType && GENERATOR_TYPES.some(t => t.value === savedType)) {
      setGeneratorType(savedType);
    }
    if (savedCount) {
      const count = parseInt(savedCount);
      if (count >= 1 && count <= 100) {
        setGeneratorCount(count);
      }
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('idGeneratorType', generatorType);
    localStorage.setItem('idGeneratorCount', generatorCount.toString());
  }, [generatorType, generatorCount]);

  // Auto-generate when count <= 5 or when type/count changes
  useEffect(() => {
    if (generatorCount <= 5) {
      handleGenerate();
    }
  }, [generatorType, generatorCount]);

  const handleGenerate = () => {
    try {
      const results = [];
      for (let i = 0; i < generatorCount; i++) {
        switch (generatorType) {
          case 'uuid':
            results.push(generateUuidV4());
            break;
          case 'nanoid':
            results.push(generateNanoId(21));
            break;
          case 'cuid':
            results.push(generateCuid());
            break;
          case 'cuid2':
            results.push(generateCuid2());
            break;
          case 'ulid':
            results.push(generateUlid());
            break;
          case 'hex':
            results.push(generateHexId(32));
            break;
          default:
            results.push(generateUuidV4());
        }
      }
      setOutput(results.join('\n'));
      setHasError(false);
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setHasError(true);
    }
  };

  const handleCopy = async () => {
    if (hasError) return; // Disable copy for errors
    try {
      await navigator.clipboard.writeText(output);
    } catch (err) {
      console.error('Failed to copy: ', err);
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
          ID Generator
        </h3>
        <p style={{ margin: '0', color: 'var(--ifm-color-emphasis-700)', fontSize: '0.9rem' }}>
          Generate various types of unique identifiers for your applications.
        </p>
      </div>

      {/* Controls */}
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--ifm-color-emphasis-300)' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontWeight: '600', color: 'var(--ifm-color-emphasis-800)' }}>
            Generator Type:
          </label>
          <select
            value={generatorType}
            onChange={(e) => setGeneratorType(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: '4px',
              backgroundColor: 'var(--ifm-background-color)',
              color: 'var(--ifm-color-emphasis-900)'
            }}
          >
            {GENERATOR_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          <label style={{ fontWeight: '600', color: 'var(--ifm-color-emphasis-800)' }}>
            Count:
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={generatorCount}
            onChange={(e) => setGeneratorCount(parseInt(e.target.value) || 1)}
            style={{
              padding: '0.5rem',
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: '4px',
              backgroundColor: 'var(--ifm-background-color)',
              color: 'var(--ifm-color-emphasis-900)',
              width: '80px'
            }}
          />
          <button
            onClick={handleGenerate}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--ifm-color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Generate
          </button>
        </div>
        {generatorCount <= 5 && (
          <div style={{
            padding: '0.5rem',
            backgroundColor: 'var(--ifm-color-emphasis-50)',
            borderRadius: '4px',
            fontSize: '0.8rem',
            color: 'var(--ifm-color-emphasis-700)'
          }}>
            Auto-generating {generatorCount} identifier{generatorCount > 1 ? 's' : ''}...
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem' }}>
        {/* Settings Section */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'var(--ifm-color-emphasis-800)' }}>
            Settings
          </label>
          <div style={{
            padding: '1rem',
            backgroundColor: 'var(--ifm-color-emphasis-50)',
            borderRadius: '4px',
            border: '1px solid var(--ifm-color-emphasis-200)'
          }}>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--ifm-color-emphasis-700)', fontSize: '0.9rem' }}>
              <strong>Type:</strong> {GENERATOR_TYPES.find(t => t.value === generatorType)?.label}
            </p>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--ifm-color-emphasis-700)', fontSize: '0.9rem' }}>
              <strong>Count:</strong> {generatorCount} identifier{generatorCount > 1 ? 's' : ''}
            </p>
            <p style={{ margin: '0', color: 'var(--ifm-color-emphasis-600)', fontSize: '0.8rem' }}>
              {generatorCount <= 5 ? 'Auto-generating on change' : 'Click "Generate" to create identifiers'}
            </p>
          </div>
        </div>

        {/* Output Section */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: '600', color: 'var(--ifm-color-emphasis-800)' }}>
              Generated IDs
            </label>
            <button
              onClick={handleCopy}
              disabled={hasError}
              style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: hasError ? 'var(--ifm-color-emphasis-300)' : 'var(--ifm-color-emphasis-200)',
                color: hasError ? 'var(--ifm-color-emphasis-500)' : 'var(--ifm-color-emphasis-800)',
                border: 'none',
                borderRadius: '4px',
                cursor: hasError ? 'not-allowed' : 'pointer',
                fontSize: '0.8rem',
                opacity: hasError ? 0.5 : 1
              }}
            >
              Copy
            </button>
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
                language="text"
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
                Click Generate to create identifiers...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}