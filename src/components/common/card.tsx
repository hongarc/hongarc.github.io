import Link from '@docusaurus/Link';
import React from 'react';
import styled from 'styled-components';

interface CardProperties {
  title: string;
  description: string;
  link: string;
  example: string;
}

const CardLink = styled(Link)`
  display: block;
  padding: 1.5rem;
  background-color: var(--ifm-background-color);
  border: 1px solid var(--ifm-color-emphasis-200);
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  text-align: center;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CardTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--ifm-color-primary);
`;

const CardDesc = styled.p`
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  color: var(--ifm-color-emphasis-600);
  line-height: 1.4;
`;

const CardExample = styled.div`
  padding: 0.5rem;
  background-color: var(--ifm-color-emphasis-100);
  border-radius: 4px;
  font-family: var(--ifm-font-family-monospace);
  font-size: 0.8rem;
  color: var(--ifm-color-emphasis-800);
`;

export default function ConverterCard({
  title,
  description,
  link,
  example,
}: CardProperties) {
  return (
    <CardLink to={link}>
      <CardTitle>{title}</CardTitle>
      <CardDesc>{description}</CardDesc>
      <CardExample>{example}</CardExample>
    </CardLink>
  );
}
