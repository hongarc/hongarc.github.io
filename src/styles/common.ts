import styled from 'styled-components';

// Layout Components
export const Container = styled.div`
  margin: 2rem 0;
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: 8px;
  overflow: hidden;
`;

export const Header = styled.div`
  background-color: var(--ifm-color-emphasis-100);
  padding: 1rem;
  border-bottom: 1px solid var(--ifm-color-emphasis-300);
`;

export const HeaderTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: var(--ifm-color-emphasis-900);
`;

export const HeaderDescription = styled.p`
  margin: 0;
  color: var(--ifm-color-emphasis-700);
  font-size: 0.9rem;
`;

export const Controls = styled.div`
  padding: 1rem;
  border-bottom: 1px solid var(--ifm-color-emphasis-300);
`;

export const ControlsRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

export const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
  padding: 1rem;
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
`;

export const SectionLabel = styled.label`
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--ifm-color-emphasis-800);
`;

// Form Components
export const TextArea = styled.textarea`
  width: 100%;
  min-height: 300px;
  padding: 0.75rem;
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: 4px;
  font-family: var(--ifm-font-family-monospace);
  font-size: 0.9rem;
  resize: vertical;
  background-color: var(--ifm-background-color);
  color: var(--ifm-color-emphasis-900);
`;

export const Input = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: 4px;
  font-family: var(--ifm-font-family-monospace);
  font-size: 0.9rem;
  background-color: var(--ifm-background-color);
  color: var(--ifm-color-emphasis-900);
`;

export const InputRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
`;

// Button Components
export const ExampleButton = styled.button`
  padding: 0.25rem 0.5rem;
  background-color: var(--ifm-color-emphasis-200);
  color: var(--ifm-color-emphasis-800);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--ifm-color-emphasis-300);
  }
`;

export const CopyButton = styled.button`
  padding: 0.25rem 0.5rem;
  background-color: var(--ifm-color-emphasis-200);
  color: var(--ifm-color-emphasis-800);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.7rem;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--ifm-color-emphasis-300);
  }
`;

// Output Components
export const OutputContainer = styled.div`
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: 4px;
  background-color: var(--ifm-background-color);
  min-height: 300px;
  max-height: 600px;
  overflow: auto;
  padding: 0.75rem;
`;

export const OutputGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const OutputCard = styled.div`
  border: 1px solid var(--ifm-color-emphasis-200);
  border-radius: 4px;
  padding: 0.75rem;
  background-color: var(--ifm-color-emphasis-50);
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

export const CardTitle = styled.span`
  font-weight: 600;
  color: var(--ifm-color-emphasis-800);
  font-size: 0.9rem;
`;

export const CardContent = styled.div`
  font-family: var(--ifm-font-family-monospace);
  font-size: 0.9rem;
  color: var(--ifm-color-emphasis-900);
  word-break: break-all;
`;

export const EmptyState = styled.div`
  color: var(--ifm-color-emphasis-500);
  font-style: italic;
  text-align: center;
  padding: 2rem;
`;

// Special Components
export const ColorPreview = styled.div<{ color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  border: 1px solid var(--ifm-color-emphasis-300);
  background-color: ${properties => properties.color};
  flex-shrink: 0;
`;

// Utility Components
export const FlexRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

export const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Spacer = styled.div<{ size?: number }>`
  height: ${properties => properties.size || 1}rem;
`;

// Responsive Design
export const ResponsiveGrid = styled.div<{ columns?: number }>`
  display: grid;
  grid-template-columns: repeat(${properties => properties.columns || 2}, 1fr);
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const ResponsiveContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
  padding: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;
