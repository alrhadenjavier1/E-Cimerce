// src/components/home/FeaturedProductsSection.tsx
import { useState, useEffect, useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Star, Volume2, VolumeX, Heart, ShoppingBag } from 'lucide-react';
import type { Product } from '../../utils/storeConfig';
import { useCurrency } from '../../context/CurrencyContext';

export interface FeaturedProduct extends Product {
  videoUrl: string;
  videoThumbnail: string;
  videoTitle: string;
  videoDescription: string;
}

interface FeaturedProductsSectionProps {
  featuredProducts: FeaturedProduct[];
  title?: string;
  subtitle?: string;
}

const getVideoType = (url: string): 'youtube' | 'vimeo' | 'direct' | 'unknown' => {
  if (!url) return 'unknown';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('vimeo.com')) return 'vimeo';
  if (url.match(/\.(mp4|webm|ogg)$/i)) return 'direct';
  return 'unknown';
};

const getEmbedUrl = (url: string, isMuted: boolean): string => {
  if (url.includes('youtube.com/watch')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&showinfo=0&disablekb=1`;
  }
  if (url.includes('youtu.be')) {
    const videoId = url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&showinfo=0&disablekb=1`;
  }
  if (url.includes('vimeo.com')) {
    const videoId = url.split('/').pop();
    return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=${isMuted ? 1 : 0}&loop=1&controls=0&byline=0&portrait=0&title=0`;
  }
  return url;
};

export const FeaturedProductsSection = ({ 
  featuredProducts, 
  title = "Featured Products",
  subtitle = "Discover our cinematic collection stories"
}: FeaturedProductsSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHoveringButton, setIsHoveringButton] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const currentFeatured = featuredProducts[currentIndex];
    if (!currentFeatured) return;

    const videoType = getVideoType(currentFeatured.videoUrl);
    
    if (videoType === 'direct' && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(e => console.log('Auto-play prevented:', e));
    }
  }, [currentIndex]);

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % featuredProducts.length);
    setIsWishlisted(false);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
    setIsWishlisted(false);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    const currentFeatured = featuredProducts[currentIndex];
    const videoType = getVideoType(currentFeatured.videoUrl);
    
    if (videoType === 'direct' && videoRef.current) {
      videoRef.current.muted = newMutedState;
    }
    
    if ((videoType === 'youtube' || videoType === 'vimeo') && iframeRef.current) {
      const newEmbedUrl = getEmbedUrl(currentFeatured.videoUrl, newMutedState);
      iframeRef.current.src = newEmbedUrl;
    }
  };

  if (featuredProducts.length === 0) return null;

  const currentFeatured = featuredProducts[currentIndex];
  const videoType = getVideoType(currentFeatured.videoUrl);
  const isEmbedVideo = videoType === 'youtube' || videoType === 'vimeo';
  const embedUrl = isEmbedVideo ? getEmbedUrl(currentFeatured.videoUrl, isMuted) : '';

  return (
    <section className="w-full py-8 sm:py-12 md:py-16 bg-gradient-to-b from-theme-surface to-theme">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 md:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-theme mb-2 animate-fade-in-up">
            {title}
          </h2>
          <p className="text-sm text-theme-light max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
            {subtitle}
          </p>
        </div>

        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-black shadow-2xl">
          <div className="relative aspect-video bg-black">
            {videoType === 'direct' && (
              <video
                ref={videoRef}
                src={currentFeatured.videoUrl}
                poster={currentFeatured.videoThumbnail}
                className="w-full h-full object-cover pointer-events-none"
                muted={isMuted}
                loop
                autoPlay
                playsInline
                disablePictureInPicture
                controlsList="nodownload noplaybackrate"
              />
            )}

            {(videoType === 'youtube' || videoType === 'vimeo') && (
              <iframe
                key={embedUrl}
                ref={iframeRef}
                src={embedUrl}
                className="w-full h-full pointer-events-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={currentFeatured.videoTitle}
              />
            )}

            {videoType === 'unknown' && (
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <img
                  src={currentFeatured.videoThumbnail || currentFeatured.image}
                  alt={currentFeatured.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-white text-center p-4">
                    <p className="text-sm mb-2">Video preview not available</p>
                    <a 
                      href={currentFeatured.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-theme-secondary underline hover:text-theme-primary transition-colors"
                    >
                      Watch on external site →
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div className="absolute inset-0 z-10 cursor-default" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none z-10" />

            <div className="absolute bottom-20 left-3 right-3 sm:bottom-24 sm:left-4 sm:right-4 z-20 pointer-events-none">
              <h3 className="text-white text-sm sm:text-base md:text-lg font-semibold line-clamp-2">
                {currentFeatured.videoTitle}
              </h3>
              <p className="text-white/70 text-xs sm:text-sm line-clamp-2 mt-1">
                {currentFeatured.videoDescription}
              </p>
            </div>

            <button
              onClick={toggleMute}
              className="absolute top-3 right-3 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 backdrop-blur-md hover:bg-theme-secondary text-white hover:text-theme transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            <button
              onClick={handlePrev}
              disabled={isAnimating}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 backdrop-blur-sm hover:bg-theme-secondary text-white hover:text-theme transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95 disabled:opacity-50 z-30"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            <button
              onClick={handleNext}
              disabled={isAnimating}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 backdrop-blur-sm hover:bg-theme-secondary text-white hover:text-theme transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95 disabled:opacity-50 z-30"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5 z-20">
              <span className="text-white text-xs">
                {currentIndex + 1} / {featuredProducts.length}
              </span>
            </div>
          </div>

          <div className="bg-theme-surface p-4 sm:p-5 md:p-6">
            <div className="hidden md:grid md:grid-cols-2 md:gap-6 items-start">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-serif text-xl lg:text-2xl text-theme mb-2">
                      {currentFeatured.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 transition-all duration-300 ${
                              i < Math.floor(currentFeatured.rating)
                                ? 'fill-theme-secondary text-theme-secondary'
                                : 'text-theme-light'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-theme-light">({currentFeatured.rating})</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="p-2 rounded-full bg-theme-secondary/20 hover:bg-theme-secondary transition-all duration-300 hover:scale-110 active:scale-95"
                  >
                    <Heart className={`w-5 h-5 transition-all duration-300 ${isWishlisted ? 'fill-theme-secondary text-theme-secondary scale-110' : 'text-theme'}`} />
                  </button>
                </div>
                
                <p className="text-sm text-theme-light mb-4">
                  {currentFeatured.description || "Experience luxury redefined with this exquisite piece from our latest collection."}
                </p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-theme">{formatPrice(currentFeatured.price)}</span>
                    {currentFeatured.originalPrice && (
                      <span className="text-sm text-theme-light line-through ml-2">
                        {formatPrice(currentFeatured.originalPrice)}
                      </span>
                    )}
                  </div>
                  <button 
                    onMouseEnter={() => setIsHoveringButton(true)}
                    onMouseLeave={() => setIsHoveringButton(false)}
                    className="group bg-theme-secondary hover:bg-theme-primary text-theme px-6 py-2 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className={`w-4 h-4 transition-all duration-300 ${isHoveringButton ? 'translate-x-1' : ''}`} />
                  </button>
                </div>
              </div>
              
              <div className="flex gap-2 justify-end">
                {currentFeatured.isBestSeller && (
                  <span className="bg-theme-secondary text-theme text-xs px-3 py-1 rounded-full font-semibold animate-pulse">Best Seller</span>
                )}
                {currentFeatured.isNew && (
                  <span className="bg-theme-primary text-white text-xs px-3 py-1 rounded-full font-semibold">New</span>
                )}
                {currentFeatured.isOnSale && (
                  <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold animate-pulse">Sale</span>
                )}
              </div>
            </div>

            <div className="md:hidden">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-serif text-lg text-theme flex-1 mr-2">
                  {currentFeatured.name}
                </h3>
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="p-1.5 rounded-full bg-theme-secondary/20 active:bg-theme-secondary transition-all duration-300 active:scale-95"
                >
                  <Heart className={`w-4 h-4 transition-all duration-300 ${isWishlisted ? 'fill-theme-secondary text-theme-secondary' : 'text-theme'}`} />
                </button>
              </div>
              
              <div className="flex items-center gap-1 mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(currentFeatured.rating)
                          ? 'fill-theme-secondary text-theme-secondary'
                          : 'text-theme-light'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-theme-light">({currentFeatured.rating})</span>
              </div>
              
              <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
                {currentFeatured.isBestSeller && (
                  <span className="bg-theme-secondary text-theme text-[10px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap animate-pulse">Best Seller</span>
                )}
                {currentFeatured.isNew && (
                  <span className="bg-theme-primary text-white text-[10px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">New</span>
                )}
                {currentFeatured.isOnSale && (
                  <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap animate-pulse">
                    {currentFeatured.originalPrice ? Math.round(((currentFeatured.originalPrice - currentFeatured.price) / currentFeatured.originalPrice) * 100) : 0}% OFF
                  </span>
                )}
              </div>
              
              <p className="text-xs text-theme-light mb-3 line-clamp-2">
                {currentFeatured.description || "Experience luxury redefined with this exquisite piece from our latest collection."}
              </p>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-theme">{formatPrice(currentFeatured.price)}</span>
                  {currentFeatured.originalPrice && (
                    <span className="text-xs text-theme-light line-through ml-1.5">
                      {formatPrice(currentFeatured.originalPrice)}
                    </span>
                  )}
                </div>
                <button className="bg-theme-secondary hover:bg-theme-primary text-theme px-4 py-1.5 rounded-full font-semibold transition-all duration-300 flex items-center gap-1.5 text-sm active:scale-95 shadow-md">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Buy Now
                </button>
              </div>
            </div>

            <div className="flex justify-center gap-1.5 mt-4 pt-2 border-t border-theme md:hidden">
              {featuredProducts.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (!isAnimating) {
                      setIsAnimating(true);
                      setCurrentIndex(idx);
                      setIsWishlisted(false);
                      setTimeout(() => setIsAnimating(false), 600);
                    }
                  }}
                  className={`transition-all duration-300 rounded-full ${
                    idx === currentIndex
                      ? 'w-6 h-1.5 bg-theme-secondary'
                      : 'w-1.5 h-1.5 bg-theme-primary/40 hover:bg-theme-primary'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};