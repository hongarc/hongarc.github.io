import React from 'react';
import styled from 'styled-components';

import useThrottle from '../hooks/use-throttle';

// Styled components
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

const Title = styled.h3`
  margin: 0 0 0.5rem 0;
  color: var(--ifm-color-emphasis-900);
`;

const Description = styled.p`
  margin: 0;
  color: var(--ifm-color-emphasis-700);
  font-size: 0.9rem;
`;

const Content = styled.div`
  padding: 1rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  ${({ variant = 'primary' }) =>
    variant === 'primary'
      ? `
        background-color: var(--ifm-color-primary);
        color: white;
        &:hover {
          background-color: var(--ifm-color-primary-darker);
        }
      `
      : `
        background-color: var(--ifm-color-emphasis-200);
        color: var(--ifm-color-emphasis-800);
        &:hover {
          background-color: var(--ifm-color-emphasis-300);
        }
      `}
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: 4px;
  background-color: var(--ifm-background-color);
  color: var(--ifm-color-emphasis-900);
  width: 100%;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: var(--ifm-color-primary);
    box-shadow: 0 0 0 2px var(--ifm-color-primary-lightest);
  }
`;

const Output = styled.div`
  background-color: var(--ifm-color-emphasis-50);
  border: 1px solid var(--ifm-color-emphasis-200);
  border-radius: 4px;
  padding: 1rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  white-space: pre-wrap;
  word-break: break-all;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

interface StyledExampleProperties {
  title?: string;
  description?: string;
}

export default function StyledExample({
  title = 'Styled Components Example',
  description = 'This component demonstrates CSS-in-JS using styled-components.',
}: StyledExampleProperties) {
  const [input, setInput] = React.useState('');
  const [output, setOutput] = React.useState('');

  // Throttle the conversion function instead of the input
  const throttledConversion = useThrottle((inputValue: string) => {
    setOutput(inputValue.toUpperCase());
  }, 300);

  React.useEffect(() => {
    throttledConversion(input);
  }, [input, throttledConversion]);

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  return (
    <Container>
      <Header>
        <Title>{title}</Title>
        <Description>{description}</Description>
      </Header>

      <Content>
        <Input
          type='text'
          value={input}
          onChange={event => setInput(event.target.value)}
          placeholder='Enter text to convert...'
        />

        {output && <Output>{output}</Output>}

        <ButtonGroup>
          <Button
            onClick={() => setOutput(input.toUpperCase())}
            disabled={!input.trim()}
          >
            Convert
          </Button>
          <Button variant='secondary' onClick={handleClear}>
            Clear
          </Button>
        </ButtonGroup>
      </Content>
    </Container>
  );
}
