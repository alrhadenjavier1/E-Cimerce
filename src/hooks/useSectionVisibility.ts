// src/hooks/useSectionVisibility.ts
import { useState, useEffect } from 'react';

type SectionVisibility = {
  hero: boolean;
  videoCarousel: boolean;
  categories: boolean;
  bestSellers: boolean;
  bestSellers3D: boolean;
  newArrivals: boolean;
  footer: boolean;
};

const defaultVisibility: SectionVisibility = {
  hero: true,
  videoCarousel: true,
  categories: true,
  bestSellers: true,
  bestSellers3D: true,
  newArrivals: true,
  footer: true,
};

export const useSectionVisibility = () => {
  const [visibility, setVisibility] = useState<SectionVisibility>(defaultVisibility);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('section-visibility');
    if (saved) {
      setVisibility(JSON.parse(saved));
    }

    // Listen for changes
    const handleChange = (event: CustomEvent<SectionVisibility>) => {
      setVisibility(event.detail);
    };

    window.addEventListener('sectionVisibilityChange', handleChange as EventListener);
    return () => window.removeEventListener('sectionVisibilityChange', handleChange as EventListener);
  }, []);

  return visibility;
};