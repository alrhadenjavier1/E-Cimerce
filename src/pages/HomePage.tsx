// src/pages/HomePage.tsx
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { HeroSection } from '../components/home/HeroSection';
import { FeaturedProductsSection } from '../components/home/FeaturedProductsSection';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { ProductSection } from '../components/home/ProductSection';
import { useStoreData } from '../hooks/useStoreData';
import { useSectionVisibility } from '../hooks/useSectionVisibility';

export const HomePage = () => {
  const { 
    loading, 
    bestSellers, 
    newArrivals, 
    categories, 
    featuredProducts,
    heroContent,
    footerLinks,
    socialLinks,
    storeSettings 
  } = useStoreData();
  
  const visibility = useSectionVisibility();

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-theme-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-theme">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-surface">
      <Navbar 
        categories={categories}
        companyName={storeSettings?.company_name}
      />
      <main>
        {visibility.hero && heroContent?.enabled && (
          <HeroSection 
            bestSellers={bestSellers}
            heroContent={heroContent}
            companyName={storeSettings?.company_name}
          />
        )}
        
        {visibility.videoCarousel && featuredProducts.length > 0 && (
          <FeaturedProductsSection 
            featuredProducts={featuredProducts}
            title="Cinematic Collection"
            subtitle="Experience each piece through our immersive storytelling"
          />
        )}
        
        {visibility.categories && <CategoryGrid categories={categories} />}
        
        {visibility.newArrivals && newArrivals.length > 0 && (
          <ProductSection
            title="New Arrivals"
            subtitle="Fresh from the atelier, ready to inspire"
            products={newArrivals}
            viewAllLink="/new-arrivals"
          />
        )}
      </main>
      
      {visibility.footer && (
        <Footer 
          footerLinks={footerLinks}
          socialLinks={socialLinks}
          companyName={storeSettings?.company_name}
        />
      )}
    </div>
  );
};