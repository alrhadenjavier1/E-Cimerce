// src/components/home/HeroSection.tsx
import { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import type { Product, HeroContent } from '../../utils/storeConfig';
import { useCurrency } from '../../context/CurrencyContext';

interface HeroSectionProps {
  bestSellers: Product[];
  heroContent: HeroContent;
  companyName: string;
}

export const HeroSection = ({ bestSellers, heroContent, companyName }: HeroSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { formatPrice } = useCurrency();

  const enabledBestSellers = bestSellers.filter(p => p.enabled);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const nextProduct = () => {
    if (isAnimating || enabledBestSellers.length === 0) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % enabledBestSellers.length);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const prevProduct = () => {
    if (isAnimating || enabledBestSellers.length === 0) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + enabledBestSellers.length) % enabledBestSellers.length);
    setTimeout(() => setIsAnimating(false), 600);
  };

  useEffect(() => {
    if (!autoPlay || enabledBestSellers.length <= 1) return;
    const interval = setInterval(nextProduct, 5000);
    return () => clearInterval(interval);
  }, [autoPlay, currentIndex, enabledBestSellers.length]);

  if (!heroContent.enabled || enabledBestSellers.length === 0) return null;

  const visibleProducts = isMobile 
    ? enabledBestSellers.slice(0, 3) 
    : enabledBestSellers.slice(0, 5);
  
  const safeIndex = currentIndex % visibleProducts.length;

  return (
    <section 
      className="relative min-h-screen overflow-hidden"
      style={{
        backgroundImage: heroContent.backgroundImage ? `url(${heroContent.backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40 z-0" />
      
      {/* Decorative blur elements - only show if no background image or overlay */}
      {!heroContent.backgroundImage && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-theme via-theme-surface to-theme z-0" />
          <div className="absolute inset-0 opacity-30 hidden md:block z-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-theme-primary rounded-full mix-blend-multiply filter blur-3xl animate-float-slow" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-theme-secondary rounded-full mix-blend-multiply filter blur-3xl animate-float-slower" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-theme-primary/20 rounded-full filter blur-3xl animate-pulse-slow" />
          </div>
        </>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center py-12 md:py-0">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          
          <div className="space-y-4 md:space-y-6 z-10 text-center lg:text-left animate-fade-in-left">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 md:px-4 md:py-2 rounded-full mx-auto lg:mx-0 animate-slide-down">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-theme-secondary rounded-full animate-ping" />
              <span className="text-xs md:text-sm text-white font-medium tracking-wide">BESTSELLER COLLECTION</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif text-white leading-tight animate-fade-in-up">
              {heroContent.title}
              <span className="block text-theme-secondary text-2xl sm:text-3xl md:text-4xl mt-1 md:mt-2 animate-fade-in-up animation-delay-200">
                {companyName}
              </span>
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg text-white/90 leading-relaxed max-w-lg mx-auto lg:mx-0 animate-fade-in-up animation-delay-400">
              {heroContent.subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start animate-fade-in-up animation-delay-600">
              <a 
                href={heroContent.ctaLink}
                className="group bg-theme-secondary text-theme px-6 md:px-8 py-2.5 md:py-3 rounded-full font-semibold hover:bg-theme-primary hover:text-white transition-all shadow-lg flex items-center justify-center gap-2 text-sm md:text-base hover:scale-105 transform transition"
              >
                {heroContent.ctaText}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              {heroContent.secondaryCtaText && (
                <a 
                  href={heroContent.secondaryCtaLink}
                  className="border-2 border-white/50 bg-white/10 backdrop-blur-sm text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full font-semibold hover:bg-white/20 transition-all text-sm md:text-base hover:scale-105 transform transition"
                >
                  {heroContent.secondaryCtaText}
                </a>
              )}
            </div>

            <div className="flex gap-6 md:gap-8 pt-6 md:pt-8 justify-center lg:justify-start animate-fade-in-up animation-delay-800">
              <div className="hover:scale-110 transition-transform">
                <div className="text-xl md:text-2xl font-bold text-white">500+</div>
                <div className="text-xs md:text-sm text-white/70">Happy Customers</div>
              </div>
              <div className="hover:scale-110 transition-transform">
                <div className="text-xl md:text-2xl font-bold text-white">50+</div>
                <div className="text-xs md:text-sm text-white/70">Premium Products</div>
              </div>
              <div className="hidden sm:block hover:scale-110 transition-transform">
                <div className="text-xl md:text-2xl font-bold text-white">100%</div>
                <div className="text-xs md:text-sm text-white/70">Authentic Quality</div>
              </div>
            </div>
          </div>

          {/* Product Carousel - keep existing code */}
          <div className="relative mt-8 lg:mt-0">
            <div className="relative h-[400px] sm:h-[450px] md:h-[500px] flex items-center justify-center">
              <div className="relative flex items-center justify-center" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
                {visibleProducts.map((product, idx) => {
                  let position = idx - safeIndex;
                  const totalVisible = visibleProducts.length;
                  
                  if (position > totalVisible / 2) position -= totalVisible;
                  if (position < -totalVisible / 2) position += totalVisible;
                  
                  const isCenter = position === 0;
                  const offset = position * (isMobile ? 100 : 130);
                  const scale = isCenter ? 1 : 1 - Math.abs(position) * (isMobile ? 0.2 : 0.15);
                  const opacity = isCenter ? 1 : 1 - Math.abs(position) * (isMobile ? 0.4 : 0.3);
                  const zIndex = isCenter ? 20 : 10 - Math.abs(position);
                  const blur = isCenter ? 0 : 0.5 + Math.abs(position) * 0.5;
                  
                  if (Math.abs(position) > (isMobile ? 1 : 2)) return null;
                  
                  return (
                    <div
                      key={product.id}
                      className="absolute cursor-pointer transition-all duration-500 focus:outline-none"
                      style={{
                        transform: `translateX(${offset}px) scale(${scale})`,
                        opacity,
                        zIndex,
                        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                        left: '50%',
                        marginLeft: isMobile ? '-110px' : '-140px',
                        filter: !isCenter ? `blur(${blur}px)` : 'none',
                      }}
                      onClick={() => {
                        if (!isCenter && !isAnimating) {
                          position > 0 ? nextProduct() : prevProduct();
                        }
                      }}
                    >
                      <div className={`w-[220px] sm:w-[260px] md:w-[280px] bg-white rounded-xl md:rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 hover:scale-105 focus:outline-none ${
                        isCenter 
                          ? 'shadow-2xl shadow-theme-secondary/20 border-2 border-theme-secondary' 
                          : 'brightness-90'
                      }`}>
                        <div className="relative h-[180px] sm:h-[220px] md:h-[240px] overflow-hidden bg-gray-100">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                            loading="lazy"
                          />
                          {product.isBestSeller && (
                            <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                              <span className="bg-theme-secondary text-theme text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-semibold animate-pulse">
                                Best Seller
                              </span>
                            </div>
                          )}
                          {product.isNew && (
                            <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                              <span className="bg-theme-primary text-white text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-semibold">
                                New
                              </span>
                            </div>
                          )}
                          {!isCenter && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                          )}
                        </div>
                        <div className={`p-3 sm:p-4 md:p-5 ${!isCenter ? 'opacity-80' : ''}`}>
                          <h3 className="font-serif text-base sm:text-lg md:text-xl text-gray-800 mb-0.5 sm:mb-1 truncate">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-1 mb-2 sm:mb-3">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                    i < Math.floor(product.rating)
                                      ? 'fill-theme-secondary text-theme-secondary'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">({product.rating})</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
                                {formatPrice(product.price)}
                              </span>
                              {product.originalPrice && (
                                <span className="text-xs sm:text-sm text-gray-400 line-through ml-1 sm:ml-2">
                                  {formatPrice(product.originalPrice)}
                                </span>
                              )}
                            </div>
                            <button className="bg-theme-secondary/20 hover:bg-theme-secondary text-gray-800 p-1.5 sm:p-2 rounded-full transition-all hover:scale-110 transform focus:outline-none focus:ring-0">
                              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-center gap-3 sm:gap-4 mt-4 sm:mt-6 md:mt-8">
              <button
                onClick={prevProduct}
                disabled={isAnimating}
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm shadow-lg hover:bg-theme-secondary transition-all flex items-center justify-center hover:scale-110 transform disabled:opacity-50 focus:outline-none focus:ring-0"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
              
              <div className="flex gap-1.5 sm:gap-2 items-center">
                {visibleProducts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (!isAnimating) {
                        setIsAnimating(true);
                        setCurrentIndex(idx);
                        setTimeout(() => setIsAnimating(false), 600);
                      }
                    }}
                    className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-0 ${
                      idx === safeIndex
                        ? 'w-6 sm:w-8 h-1.5 sm:h-2 bg-theme-secondary'
                        : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/50 hover:bg-white'
                    }`}
                  />
                ))}
              </div>
              
              <button
                onClick={nextProduct}
                disabled={isAnimating}
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm shadow-lg hover:bg-theme-secondary transition-all flex items-center justify-center hover:scale-110 transform disabled:opacity-50 focus:outline-none focus:ring-0"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            </div>

            {visibleProducts.length > 1 && (
              <div className="hidden sm:flex justify-center mt-3 md:mt-4">
                <button
                  onClick={() => setAutoPlay(!autoPlay)}
                  className="text-xs text-white/70 hover:text-white transition-colors focus:outline-none focus:ring-0"
                >
                  {autoPlay ? '⏸ Pause Auto-rotate' : '▶ Auto-rotate'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden sm:block z-10">
        <div className="w-5 h-8 md:w-6 md:h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-1.5 md:h-2 bg-white/40 rounded-full mt-2 animate-scroll" />
        </div>
      </div>
    </section>
  );
};