import Link from '@docusaurus/Link';
import styled from 'styled-components';

export const Container = styled.div`
  margin: 2rem 0;
`;

export const Title = styled.h2`
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ifm-color-emphasis-900);
`;

export const Description = styled.p`
  margin: 0 0 2rem 0;
  color: var(--ifm-color-emphasis-700);
  font-size: 1rem;
  line-height: 1.6;
`;

export const CategorySection = styled.div`
  margin: 2rem 0;
`;

export const CategoryTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--ifm-color-emphasis-800);
  border-bottom: 2px solid var(--ifm-color-emphasis-200);
  padding-bottom: 0.5rem;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

export const BackButton = styled(Link)`
  display: inline-block;
  margin-top: 2rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--ifm-color-emphasis-200);
  color: var(--ifm-color-emphasis-800);
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: background-color 0.2s ease;
  &:hover {
    background-color: var(--ifm-color-emphasis-300);
  }
`;
