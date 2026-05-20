// src/hooks/useStoreData.ts
import { useState, useEffect } from 'react';
import { databaseService } from '../services/databaseService';
import type { Product, Category, FeatureVideo, SocialLink, FooterLink, HeroContent } from '../utils/storeConfig';

export const useStoreData = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [featuredVideos, setFeaturedVideos] = useState<FeatureVideo[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>([]);
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [storeSettings, setStoreSettings] = useState<any>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        cats,
        bestProducts,
        newProducts,
        featured,
        videos,
        social,
        footer,
        hero,
        settings
      ] = await Promise.all([
        databaseService.getCategories(),
        databaseService.getProducts('bestSellers'),
        databaseService.getProducts('newArrivals'),
        databaseService.getFeaturedProducts(),
        databaseService.getFeatureVideos(),
        databaseService.getSocialLinks(),
        databaseService.getFooterLinks(),
        databaseService.getHeroContent(),
        databaseService.getStoreSettings(),
      ]);

      setCategories(cats);
      setBestSellers(bestProducts);
      setNewArrivals(newProducts);
      setFeaturedProducts(featured);
      setFeaturedVideos(videos);
      setSocialLinks(social);
      setFooterLinks(footer);
      setHeroContent(hero);
      setStoreSettings(settings);
    } catch (error) {
      console.error('Failed to load store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const reload = () => {
    loadAllData();
  };

  return {
    loading,
    categories,
    bestSellers,
    newArrivals,
    featuredProducts,
    featuredVideos,
    socialLinks,
    footerLinks,
    heroContent,
    storeSettings,
    reload,
  };
};