import React from 'react';
import Link from '@docusaurus/Link';

interface ConverterItem {
  title: string;
  description: string;
  link: string;
  example: string;
}

const usefulConverters: ConverterItem[] = [
  {
    title: 'Uppercase',
    description: 'Convert text to uppercase letters',
    link: '/docs/converter/string-converter/uppercase',
    example: 'abc → ABC'
  },
  {
    title: 'CamelCase',
    description: 'Convert to camelCase format',
    link: '/docs/converter/string-converter/camelcase',
    example: 'hello world → helloWorld'
  },
  {
    title: 'KebabCase',
    description: 'Convert to kebab-case format',
    link: '/docs/converter/string-converter/kebabcase',
    example: 'hello world → hello-world'
  },
  {
    title: 'SnakeCase',
    description: 'Convert to snake_case format',
    link: '/docs/converter/string-converter/snakecase',
    example: 'hello world → hello_world'
  },
  {
    title: 'Capitalize',
    description: 'Capitalize first letter of string',
    link: '/docs/converter/string-converter/capitalize',
    example: 'hello world → Hello world'
  },
  {
    title: 'Trim',
    description: 'Remove whitespace from both ends',
    link: '/docs/converter/string-converter/trim',
    example: ' hello  → hello'
  },
  {
    title: 'Deburr',
    description: 'Remove accents and diacritics',
    link: '/docs/converter/string-converter/deburr',
    example: 'café → cafe'
  },
  {
    title: 'Class to Function',
    description: 'Convert static class methods to named functions',
    link: '/docs/converter/class-converter/class-to-named-function',
    example: 'static method → function'
  }
];

export default function UsefulConverters() {
  return (
    <div style={{
      margin: '3rem 0',
      padding: '2rem',
      backgroundColor: 'var(--ifm-color-emphasis-50)',
      borderRadius: '12px',
      border: '1px solid var(--ifm-color-emphasis-200)'
    }}>
      <h2 style={{
        margin: '0 0 1.5rem 0',
        fontSize: '1.5rem',
        fontWeight: '600',
        color: 'var(--ifm-color-emphasis-900)',
        textAlign: 'center'
      }}>
        🚀 Useful Converters
      </h2>
      <p style={{
        textAlign: 'center',
        margin: '0 0 2rem 0',
        color: 'var(--ifm-color-emphasis-700)',
        fontSize: '1rem'
      }}>
        Quick access to the most frequently used converters
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem',
        marginTop: '1.5rem'
      }}>
        {usefulConverters.map((converter, index) => (
          <Link
            key={index}
            to={converter.link}
            style={{
              display: 'block',
              padding: '1.5rem',
              backgroundColor: 'var(--ifm-background-color)',
              border: '1px solid var(--ifm-color-emphasis-200)',
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'all 0.2s ease',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <h3 style={{
              margin: '0 0 0.5rem 0',
              fontSize: '1.1rem',
              fontWeight: '600',
              color: 'var(--ifm-color-primary)'
            }}>
              {converter.title}
            </h3>
            <p style={{
              margin: '0 0 1rem 0',
              fontSize: '0.9rem',
              color: 'var(--ifm-color-emphasis-600)',
              lineHeight: '1.4'
            }}>
              {converter.description}
            </p>
            <div style={{
              padding: '0.5rem',
              backgroundColor: 'var(--ifm-color-emphasis-100)',
              borderRadius: '4px',
              fontFamily: 'var(--ifm-font-family-monospace)',
              fontSize: '0.8rem',
              color: 'var(--ifm-color-emphasis-800)'
            }}>
              {converter.example}
            </div>
          </Link>
        ))}
      </div>

      <div style={{
        textAlign: 'center',
        marginTop: '2rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid var(--ifm-color-emphasis-200)'
      }}>
        <Link
          to="/docs/converter"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--ifm-color-primary)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: '500',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--ifm-color-primary-dark)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--ifm-color-primary)';
          }}
        >
          View All Converters →
        </Link>
      </div>
    </div>
  );
}