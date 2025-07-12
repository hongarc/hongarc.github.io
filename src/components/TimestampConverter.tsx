import React, { useState, useEffect } from 'react';
import { convertTimestamp } from '../converters/timestamp-converters';

const FORMAT_OPTIONS = [
  { value: 'timestamp', label: 'Unix Timestamp' },
  { value: 'iso', label: 'ISO 8601' },
  { value: 'local', label: 'Local Date' },
  { value: 'utc', label: 'UTC Date' },
  { value: 'relative', label: 'Relative Time' }
];

// Load all timezones from Intl.supportedValuesOf
const TIMEZONES = (() => {
  try {
    return Intl.supportedValuesOf('timeZone');
  } catch {
    // Fallback to common timezones if supportedValuesOf is not available
    return [
      'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London',
      'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney',
      'America/Chicago', 'America/Denver', 'Europe/Berlin', 'Asia/Seoul',
      'America/Toronto', 'Europe/Moscow', 'Asia/Dubai', 'Asia/Singapore',
      'Europe/Amsterdam', 'Europe/Rome', 'Asia/Hong_Kong', 'America/Mexico_City'
    ];
  }
})();

export default function TimestampConverter() {
  const [input, setInput] = useState('');
  const [outputs, setOutputs] = useState<Record<string, string>>({});
  const [timezone, setTimezone] = useState('UTC');
  const [timezoneInput, setTimezoneInput] = useState('UTC');
  const [showTimezoneSuggestions, setShowTimezoneSuggestions] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedTimezone = localStorage.getItem('timestampTimezone');
    if (savedTimezone) {
      setTimezone(savedTimezone);
      setTimezoneInput(savedTimezone);
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('timestampTimezone', timezone);
  }, [timezone]);

  // Convert input when it changes
  useEffect(() => {
    if (input.trim()) {
      const newOutputs: Record<string, string> = {};
      let hasAnyError = false;

      FORMAT_OPTIONS.forEach(option => {
        try {
          newOutputs[option.value] = convertTimestamp(input, option.value);
        } catch (error) {
          newOutputs[option.value] = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
          hasAnyError = true;
        }
      });

      setOutputs(newOutputs);
      setHasError(hasAnyError);
    } else {
      setOutputs({});
      setHasError(false);
    }
  }, [input]);

  const handleCopy = async (text: string) => {
    if (text.startsWith('Error:')) return; // Disable copy for errors
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleExample = () => {
    const example = '1640995200';
    setInput(example);
  };

  const handleTimezoneChange = (newTimezone: string) => {
    setTimezone(newTimezone);
    setTimezoneInput(newTimezone);
    setShowTimezoneSuggestions(false);
  };

  const handleTimezoneBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowTimezoneSuggestions(false);
    }, 200);
  };

  const handleTimezoneInputChange = (value: string) => {
    setTimezoneInput(value);
    setShowTimezoneSuggestions(true);

    // Validate timezone
    if (TIMEZONES.includes(value)) {
      setTimezone(value);
    }
  };

  const filteredTimezones = TIMEZONES.filter(tz =>
    tz.toLowerCase().includes(timezoneInput.toLowerCase())
  );

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
          Timestamp Converter
        </h3>
        <p style={{ margin: '0', color: 'var(--ifm-color-emphasis-700)', fontSize: '0.9rem' }}>
          Convert between Unix timestamps and human-readable date formats.
        </p>
      </div>

      {/* Controls */}
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--ifm-color-emphasis-300)' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontWeight: '600', color: 'var(--ifm-color-emphasis-800)' }}>
            Timezone:
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={timezoneInput}
              onChange={(e) => handleTimezoneInputChange(e.target.value)}
              onFocus={() => setShowTimezoneSuggestions(true)}
              onBlur={handleTimezoneBlur}
              placeholder="Enter timezone..."
              style={{
                padding: '0.5rem',
                border: '1px solid var(--ifm-color-emphasis-300)',
                borderRadius: '4px',
                backgroundColor: 'var(--ifm-background-color)',
                color: 'var(--ifm-color-emphasis-900)',
                width: '200px'
              }}
            />
            {showTimezoneSuggestions && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'var(--ifm-background-color)',
                border: '1px solid var(--ifm-color-emphasis-300)',
                borderRadius: '4px',
                maxHeight: '200px',
                overflow: 'auto',
                zIndex: 1000
              }}>
                {filteredTimezones.slice(0, 20).map(tz => (
                  <div
                    key={tz}
                    onClick={() => handleTimezoneChange(tz)}
                    style={{
                      padding: '0.5rem',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--ifm-color-emphasis-200)',
                      fontSize: '0.9rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--ifm-color-emphasis-100)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {tz}
                  </div>
                ))}
              </div>
            )}
          </div>
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
            Input (Auto-detected)
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter timestamp or date to convert..."
            style={{
              width: '100%',
              minHeight: '300px',
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {FORMAT_OPTIONS.map(option => {
                  const output = outputs[option.value];
                  const isError = output.startsWith('Error:');
                  return (
                    <div key={option.value} style={{
                      border: '1px solid var(--ifm-color-emphasis-200)',
                      borderRadius: '4px',
                      padding: '0.5rem',
                      backgroundColor: 'var(--ifm-color-emphasis-50)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <span style={{ fontWeight: '600', color: 'var(--ifm-color-emphasis-800)', fontSize: '0.9rem' }}>
                          {option.label}
                        </span>
                        <span style={{
                          fontFamily: 'var(--ifm-font-family-monospace)',
                          fontSize: '0.85rem',
                          color: isError ? 'var(--ifm-color-danger)' : 'var(--ifm-color-emphasis-900)',
                          wordBreak: 'break-all',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {output}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(output)}
                        disabled={isError}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: isError ? 'var(--ifm-color-emphasis-300)' : 'var(--ifm-color-emphasis-200)',
                          color: isError ? 'var(--ifm-color-emphasis-500)' : 'var(--ifm-color-emphasis-800)',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: isError ? 'not-allowed' : 'pointer',
                          fontSize: '0.7rem',
                          opacity: isError ? 0.5 : 1,
                          marginLeft: '0.5rem'
                        }}
                      >
                        Copy
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{
                color: 'var(--ifm-color-emphasis-500)',
                fontStyle: 'italic',
                fontSize: '0.9rem',
                textAlign: 'center',
                padding: '2rem'
              }}>
                Enter input to see conversion results...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}