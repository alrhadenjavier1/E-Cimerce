// src/components/SEO.tsx
import { useEffect } from 'react';
import { storeConfig } from '../utils/storeConfig';

export const SEO = () => {
  const { seo, companyName } = storeConfig;

  useEffect(() => {
    // Update document title
    document.title = seo.title;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', seo.description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = seo.description;
      document.head.appendChild(meta);
    }
    
    // Update keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', seo.keywords.join(', '));
    }
    
    // Update favicon
    const favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (favicon && seo.favicon) {
      favicon.href = seo.favicon;
    }
    
    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', seo.title);
    }
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', seo.description);
    }
    
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && seo.ogImage) {
      ogImage.setAttribute('content', seo.ogImage);
    }
    
    // Update Twitter Card
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', seo.title);
    }
    
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', seo.description);
    }
    
    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage && seo.ogImage) {
      twitterImage.setAttribute('content', seo.ogImage);
    }
  }, [seo, companyName]);

  return null;
};