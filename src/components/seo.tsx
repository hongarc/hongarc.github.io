import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
}

const DEFAULT_TITLE = 'Friendly Toolbox - Developer Utility Hub';
const DEFAULT_DESCRIPTION =
  'A modular, high-performance utility hub for developers. JSON formatter, Base64 encoder, hash generators, UUID generator, and more.';
const DEFAULT_KEYWORDS = [
  'developer tools',
  'json formatter',
  'base64 encoder',
  'hash generator',
  'uuid generator',
  'text tools',
  'sql formatter',
  'qr code generator',
];

// Helper to set or create meta tag
function setMeta(selector: string, content: string) {
  let meta = document.querySelector<HTMLMetaElement>(selector);
  if (!meta) {
    meta = document.createElement('meta');
    const attrMatch = /\[(\w+)="([^"]+)"\]/.exec(selector);
    const attrName = attrMatch?.[1];
    const attrValue = attrMatch?.[2];
    if (attrName && attrValue) {
      meta.setAttribute(attrName, attrValue);
    }
    document.head.append(meta);
  }
  meta.content = content;
}

export function SEO({ title, description, keywords, canonical }: SEOProps) {
  useEffect(() => {
    // Build full title
    const fullTitle = title ? `${title} - Friendly Toolbox` : DEFAULT_TITLE;
    const finalDescription = description ?? DEFAULT_DESCRIPTION;
    const finalKeywords = keywords ?? DEFAULT_KEYWORDS;

    // Update document title
    document.title = fullTitle;

    // Update meta description
    setMeta('meta[name="description"]', finalDescription);

    // Update meta keywords
    setMeta('meta[name="keywords"]', finalKeywords.join(', '));

    // Update Open Graph tags
    setMeta('meta[property="og:title"]', fullTitle);
    setMeta('meta[property="og:description"]', finalDescription);
    if (canonical) {
      setMeta('meta[property="og:url"]', canonical);
    }

    // Update Twitter Card tags
    setMeta('meta[name="twitter:title"]', fullTitle);
    setMeta('meta[name="twitter:description"]', finalDescription);

    // Update canonical URL
    if (canonical) {
      let linkCanonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.rel = 'canonical';
        document.head.append(linkCanonical);
      }
      linkCanonical.href = canonical;
    }
  }, [title, description, keywords, canonical]);

  return null;
}
