// src/hooks/useStoreData.ts
import { useState, useEffect } from 'react';
import { databaseService } from '../services/databaseService';
import type { Product, Category, FeaturedProduct, FeatureVideo, SocialLink, FooterLink, HeroContent } from '../utils/storeConfig';

export const useStoreData = () => {
  const [loading, setLoading] = useState(true);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [featureVideos, setFeatureVideos] = useState<FeatureVideo[]>([]);
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [storeSettings, setStoreSettings] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load all data in parallel
        const [
          bestSellersData,
          newArrivalsData,
          categoriesData,
          featuredProductsData,
          featureVideosData,
          heroContentData,
          footerLinksData,
          socialLinksData,
          storeSettingsData
        ] = await Promise.all([
          databaseService.getProducts('bestSellers'),
          databaseService.getProducts('newArrivals'),
          databaseService.getCategories(),
          databaseService.getFeaturedProducts(),
          databaseService.getFeatureVideos(),
          databaseService.getHeroContent(),
          databaseService.getFooterLinks(),
          databaseService.getSocialLinks(),
          databaseService.getStoreSettings()
        ]);

        setBestSellers(bestSellersData);
        setNewArrivals(newArrivalsData);
        setCategories(categoriesData);
        setFeaturedProducts(featuredProductsData);
        setFeatureVideos(featureVideosData);
        setHeroContent(heroContentData);
        setFooterLinks(footerLinksData);
        setSocialLinks(socialLinksData);
        setStoreSettings(storeSettingsData);
      } catch (error) {
        console.error('Failed to load store data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    loading,
    bestSellers,
    newArrivals,
    categories,
    featuredProducts,
    featureVideos,
    heroContent,
    footerLinks,
    socialLinks,
    storeSettings
  };
};