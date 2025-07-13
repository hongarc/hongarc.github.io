import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import HomepageFeatures from '@site/src/components/homepage-features';
import SEOStructuredData from '@site/src/components/seo-structured-data';
import UsefulConverters from '@site/src/components/useful-converters';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import type { ReactNode } from 'react';

import styles from './index.module.css';
function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className='container'>
        <Heading as='h1' className='hero__title'>
          {siteConfig.title}
        </Heading>
        <p className='hero__subtitle'>{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className='button button--secondary button--lg'
            to='/docs/converter'
          >
            Explore Converters →
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title='HongArc - Free Online Developer Tools & Converters'
      description='Free online developer tools for string conversion, ID generation, timestamp conversion, color conversion, data format conversion, and byte size conversion. Real-time conversion with instant results.'
    >
      <SEOStructuredData
        type='WebSite'
        name='HongArc - Developer Tools & Converters'
        description='Free online developer tools for string conversion, ID generation, timestamp conversion, color conversion, data format conversion, and byte size conversion.'
        url='https://hongarc.github.io'
        tools={[
          'String Converter',
          'ID Generator',
          'Timestamp Converter',
          'Color Converter',
          'Data Format Converter',
          'Byte Size Converter',
        ]}
      />
      <HomepageHeader />
      <main>
        <UsefulConverters />
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
