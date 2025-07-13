import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import { convertTimestamp } from '../converters/timestamp-converters';
import useLocalStorage from '../hooks/use-local-storage';
import useThrottle from '../hooks/use-throttle';

const FORMAT_OPTIONS = [
  { value: 'unix', label: 'Unix Timestamp' },
  { value: 'iso', label: 'ISO 8601' },
  { value: 'rfc', label: 'RFC 2822' },
  { value: 'utc', label: 'UTC String' },
  { value: 'local', label: 'Local String' },
  { value: 'custom', label: 'Custom Format' },
];

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
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

const TimezoneContainer = styled.div`
  position: relative;
`;

const TimezoneInput = styled.input`
  padding: 0.5rem;
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: 4px;
  background-color: var(--ifm-background-color);
  color: var(--ifm-color-emphasis-900);
  width: 200px;
`;

const TimezoneDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--ifm-background-color);
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: 4px;
  max-height: 200px;
  overflow: auto;
  z-index: 1000;
`;

const TimezoneOption = styled.div`
  padding: 0.5rem;
  cursor: pointer;
  border-bottom: 1px solid var(--ifm-color-emphasis-200);
  font-size: 0.9rem;
  &:hover {
    background-color: var(--ifm-color-emphasis-100);
  }
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
  grid-template-columns: 1fr 2fr;
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

const OutputContainer = styled.div`
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: 4px;
  background-color: var(--ifm-background-color);
  min-height: 300px;
  max-height: 600px;
  overflow: auto;
  padding: 0.75rem;
`;

const OutputGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const OutputCard = styled.div`
  border: 1px solid var(--ifm-color-emphasis-200);
  border-radius: 4px;
  padding: 0.75rem;
  background-color: var(--ifm-color-emphasis-50);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const CardTitle = styled.span`
  font-weight: 600;
  color: var(--ifm-color-emphasis-800);
  font-size: 0.9rem;
`;

const CopyButton = styled.button`
  padding: 0.25rem 0.5rem;
  background-color: var(--ifm-color-emphasis-200);
  color: var(--ifm-color-emphasis-800);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.7rem;
`;

const CardContent = styled.div`
  font-family: var(--ifm-font-family-monospace);
  font-size: 0.9rem;
  color: var(--ifm-color-emphasis-900);
  word-break: break-all;
`;

const EmptyState = styled.div`
  color: var(--ifm-color-emphasis-500);
  font-style: italic;
  text-align: center;
  padding: 2rem;
`;

const handleCopy = async (text: string) => {
  if (text.startsWith('Error:')) return; // Disable copy for errors
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Silently handle copy errors
  }
};

export default function TimestampConverter() {
  const [input, setInput] = useState('');
  const [outputs, setOutputs] = useState<Record<string, string>>({});
  const [timezoneInput, setTimezoneInput] = useState('UTC');
  const [showTimezoneSuggestions, setShowTimezoneSuggestions] = useState(false);

  // Use useLocalStorage hook for type-safe localStorage management
  const [timezone, setTimezone] = useLocalStorage('timestampTimezone', 'UTC');

  // Throttle the conversion function instead of the input
  const throttledConversion = useThrottle((inputValue: string) => {
    if (inputValue.trim()) {
      const newOutputs: Record<string, string> = {};

      for (const option of FORMAT_OPTIONS) {
        try {
          newOutputs[option.value] = convertTimestamp(inputValue, option.value);
        } catch {
          newOutputs[option.value] = 'Error';
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

  // Sync timezone input with stored timezone
  useEffect(() => {
    setTimezoneInput(timezone);
  }, [timezone]);

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
    <Container>
      {/* Header */}
      <Header>
        <HeaderTitle>Timestamp Converter</HeaderTitle>
        <HeaderDescription>
          Convert between Unix timestamps and human-readable date formats.
        </HeaderDescription>
      </Header>

      {/* Controls */}
      <Controls>
        <ControlsRow>
          <Label>Timezone:</Label>
          <TimezoneContainer>
            <TimezoneInput
              type='text'
              value={timezoneInput}
              onChange={event => handleTimezoneInputChange(event.target.value)}
              onFocus={() => setShowTimezoneSuggestions(true)}
              onBlur={handleTimezoneBlur}
              placeholder='Enter timezone...'
            />
            {showTimezoneSuggestions && (
              <TimezoneDropdown>
                {filteredTimezones.slice(0, 20).map(tz => (
                  <TimezoneOption
                    key={tz}
                    onClick={() => handleTimezoneChange(tz)}
                    onMouseEnter={event => {
                      event.currentTarget.style.backgroundColor =
                        'var(--ifm-color-emphasis-100)';
                    }}
                    onMouseLeave={event => {
                      event.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {tz}
                  </TimezoneOption>
                ))}
              </TimezoneDropdown>
            )}
          </TimezoneContainer>
          <ExampleButton onClick={handleExample}>Load Example</ExampleButton>
        </ControlsRow>
      </Controls>

      {/* Content */}
      <Content>
        {/* Input Section */}
        <Section>
          <SectionLabel>Input Timestamp</SectionLabel>
          <TextArea
            value={input}
            onChange={event => setInput(event.target.value)}
            placeholder='Enter timestamp (Unix, ISO, etc.)...'
          />
        </Section>

        {/* Output Section */}
        <Section>
          <SectionLabel>All Output Formats</SectionLabel>
          <OutputContainer>
            {Object.keys(outputs).length > 0 ? (
              <OutputGrid>
                {FORMAT_OPTIONS.map(option => (
                  <OutputCard key={option.value}>
                    <CardHeader>
                      <CardTitle>{option.label}</CardTitle>
                      <CopyButton
                        onClick={() => handleCopy(outputs[option.value])}
                      >
                        Copy
                      </CopyButton>
                    </CardHeader>
                    <CardContent>{outputs[option.value]}</CardContent>
                  </OutputCard>
                ))}
              </OutputGrid>
            ) : (
              <EmptyState>Enter a timestamp to see conversions...</EmptyState>
            )}
          </OutputContainer>
        </Section>
      </Content>
    </Container>
  );
}
