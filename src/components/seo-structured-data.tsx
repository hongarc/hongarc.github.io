import React from 'react';

interface StructuredDataProperties {
  type: 'WebSite' | 'WebApplication' | 'Tool';
  name: string;
  description: string;
  url: string;
  tools?: string[];
}

export default function SEOStructuredData({
  type,
  name,
  description,
  url,
  tools,
}: StructuredDataProperties) {
  const getStructuredData = () => {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': type,
      name,
      description,
      url,
      author: {
        '@type': 'Person',
        name: 'HongArc',
      },
      publisher: {
        '@type': 'Organization',
        name: 'HongArc',
        url: 'https://hongarc.github.io',
      },
    };

    if (type === 'WebApplication' && tools) {
      return {
        ...baseData,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Web Browser',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: tools.join(', '),
      };
    }

    if (type === 'Tool' && tools) {
      return {
        ...baseData,
        category: 'Developer Tools',
        featureList: tools.join(', '),
      };
    }

    return baseData;
  };

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData()),
      }}
    />
  );
}
