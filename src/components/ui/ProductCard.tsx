// src/components/ui/ProductCard.tsx (updated with currency)
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../utils/storeConfig';
import { storeConfig } from '../../utils/storeConfig';
import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { name, price, originalPrice, rating, image, isNew, isBestSeller, isOnSale, id } = product;
  const { animations } = storeConfig;
  const [isHovered, setIsHovered] = useState(false);
  const [showAddedToast, setShowAddedToast] = useState(false);
  
  const navigate = useNavigate();
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();
  const { formatPrice } = useCurrency();
  
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    setIsWishlisted(isInWishlist(id));
  }, [id, isInWishlist]);

  const scale = animations.enableHoverEffects ? animations.hoverScale : 1;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(id);
      setIsWishlisted(false);
    } else {
      addToWishlist(product);
      setIsWishlisted(true);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setShowAddedToast(true);
    setTimeout(() => setShowAddedToast(false), 2000);
  };

  const handleCardClick = () => {
    navigate(`/product/${id}`);
  };

  return (
    <>
      {showAddedToast && (
        <div className="fixed bottom-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-down">
          Added {name} to cart!
        </div>
      )}

      <div 
        className="group relative bg-theme-surface rounded-xl md:rounded-2xl overflow-hidden shadow-md transition-all duration-300 focus:outline-none cursor-pointer"
        style={{
          transform: isHovered ? `translateY(-4px) scale(${scale})` : 'translateY(0) scale(1)',
          boxShadow: isHovered ? '0 20px 25px -12px rgba(0, 0, 0, 0.15), 0 0 0 2px var(--color-secondary)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        <div className={`absolute inset-0 rounded-xl md:rounded-2xl opacity-0 transition-opacity duration-300 pointer-events-none ${
          isHovered ? 'opacity-100' : ''
        }`}
        style={{
          background: 'linear-gradient(135deg, var(--color-secondary), var(--color-primary), var(--color-secondary))',
          padding: '2px',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }} />
        
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 flex gap-1.5 sm:gap-2">
          {isNew && (
            <span className="bg-theme-primary text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full animate-pulse">
              New
            </span>
          )}
          {isBestSeller && (
            <span className="bg-theme-secondary text-theme text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
              Bestseller
            </span>
          )}
          {isOnSale && originalPrice && (
            <span className="bg-red-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full animate-pulse">
              {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
            </span>
          )}
        </div>

        <button 
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 z-10 bg-theme-surface/80 backdrop-blur-sm p-1.5 sm:p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-0 ${
            isWishlisted ? 'bg-theme-secondary text-white' : 'hover:bg-theme-secondary hover:text-white'
          } ${isHovered ? 'opacity-100' : 'opacity-0 sm:group-hover:opacity-100'}`}
          onClick={handleWishlistToggle}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-300 ${isWishlisted ? 'fill-current scale-110' : ''}`} />
        </button>

        <div className="aspect-square overflow-hidden bg-theme/30 relative">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500"
            style={{
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            }}
            loading="lazy"
          />
          
          <div className={`absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : ''
          }`} />
        </div>

        <div className="p-2.5 sm:p-3 md:p-4">
          <h3 className="text-sm sm:text-base md:text-lg text-theme font-medium mb-0.5 sm:mb-1 line-clamp-1">
            {name}
          </h3>
          
          <div className="flex items-center gap-0.5 sm:gap-1 mb-1 sm:mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 transition-all duration-300 ${
                    i < Math.floor(rating)
                      ? 'fill-theme-secondary text-theme-secondary'
                      : 'text-theme-light'
                  } ${isHovered && i < Math.floor(rating) ? 'scale-110' : ''}`}
                />
              ))}
            </div>
            <span className="text-[10px] sm:text-xs text-theme-light">({rating})</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-base sm:text-lg md:text-xl font-semibold text-theme">
              {formatPrice(price)}
            </span>
            {originalPrice && (
              <span className="text-xs sm:text-sm text-theme-light line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          <button 
            className={`mt-2 sm:mt-3 w-full bg-theme-secondary/20 text-theme py-1.5 sm:py-2 rounded-full flex items-center justify-center gap-1 sm:gap-2 transition-all duration-300 overflow-hidden relative group/btn focus:outline-none focus:ring-0 ${
              isHovered ? 'bg-theme-secondary text-theme shadow-md' : ''
            }`}
            onClick={handleAddToCart}
            aria-label="Add to cart"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-theme-secondary to-theme-primary translate-x-[-100%] group-hover/btn:translate-x-0 transition-transform duration-500" />
            <ShoppingBag className={`w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 transition-all duration-300 group-hover/btn:translate-x-0.5 ${
              isHovered ? 'animate-bounce-slow' : ''
            }`} />
            <span className="text-xs sm:text-sm font-medium relative z-10 hidden xs:inline">Add to Cart</span>
          </button>
        </div>
      </div>
    </>
  );
};