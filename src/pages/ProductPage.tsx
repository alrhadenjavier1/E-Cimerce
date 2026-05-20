// src/pages/ProductPage.tsx - Remove all size-related code
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Heart, ShoppingBag, Minus, Plus, Truck, Shield, RotateCcw, Share2, ChevronRight } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useStoreData } from '../hooks/useStoreData';
import { databaseService } from '../services/databaseService';
import type { Product } from '../utils/storeConfig';

export const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, addToWishlist, isInWishlist, removeFromWishlist } = useCart();
  const { formatPrice } = useCurrency();
  const { categories, footerLinks, socialLinks, storeSettings } = useStoreData();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAddedToCart, setShowAddedToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const productData = await databaseService.getProductById(id!);
      if (productData) {
        setProduct(productData);
        
        if (productData.category_id) {
          const related = await databaseService.getProductsByCategory(productData.category_id, 4);
          setRelatedProducts(related.filter(p => p.id !== id));
        }
      }
    } catch (error) {
      console.error('Failed to load product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setShowAddedToCart(true);
      setTimeout(() => setShowAddedToCart(false), 2000);
    }
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-surface">
        <Navbar categories={categories} companyName={storeSettings?.company_name} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 border-4 border-theme-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-theme-surface">
        <Navbar categories={categories} companyName={storeSettings?.company_name} />
        <div className="text-center py-32">
          <h2 className="text-2xl text-theme mb-4">Product Not Found</h2>
          <button onClick={() => navigate('/products')} className="text-theme-primary hover:underline">
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-surface">
      <Navbar categories={categories} companyName={storeSettings?.company_name} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-theme-light mb-6">
          <button onClick={() => navigate('/')} className="hover:text-theme-primary">Home</button>
          <ChevronRight className="w-4 h-4" />
          <button onClick={() => navigate('/products')} className="hover:text-theme-primary">Products</button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-theme">{product.name}</span>
        </div>

        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-theme-secondary/10">
              <img
                src={product.images?.[selectedImage] || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? 'border-theme-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex gap-2 mb-4">
              {product.isNew && (
                <span className="bg-theme-primary text-white text-xs px-3 py-1 rounded-full">New</span>
              )}
              {product.isBestSeller && (
                <span className="bg-theme-secondary text-theme text-xs px-3 py-1 rounded-full">Bestseller</span>
              )}
              {product.isOnSale && product.originalPrice && (
                <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-serif text-theme mb-4">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? 'fill-theme-secondary text-theme-secondary'
                        : 'text-theme-light'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-theme-light">({product.rating} / 5)</span>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold text-theme">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="ml-2 text-lg text-theme-light line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </div>

            <p className="text-theme-light mb-6 leading-relaxed">{product.description}</p>

            {/* Quantity - Only show if in stock */}
            <div className="mb-6">
              <label className="block text-theme font-medium mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full bg-theme-secondary/20 text-theme hover:bg-theme-secondary transition-all flex items-center justify-center"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-theme font-medium w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full bg-theme-secondary/20 text-theme hover:bg-theme-secondary transition-all flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-theme-primary text-white py-3 rounded-full flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all transform hover:scale-[1.02]"
              >
                <ShoppingBag className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                onClick={handleWishlistToggle}
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                  isInWishlist(product.id)
                    ? 'bg-theme-secondary border-theme-secondary text-white'
                    : 'border-theme text-theme hover:border-theme-primary hover:text-theme-primary'
                }`}
              >
                <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
              </button>
              <button className="w-12 h-12 rounded-full border-2 border-theme text-theme hover:border-theme-primary hover:text-theme-primary transition-all flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {showAddedToCart && (
              <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-down z-50">
                Added to cart!
              </div>
            )}

            {/* Shipping Info */}
            <div className="border-t border-theme pt-6 space-y-3">
              <div className="flex items-center gap-3 text-theme-light">
                <Truck className="w-5 h-5" />
                <span className="text-sm">Free shipping on orders over $50</span>
              </div>
              <div className="flex items-center gap-3 text-theme-light">
                <RotateCcw className="w-5 h-5" />
                <span className="text-sm">30-day easy returns</span>
              </div>
              <div className="flex items-center gap-3 text-theme-light">
                <Shield className="w-5 h-5" />
                <span className="text-sm">Secure checkout</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-8 border-t border-theme">
            <h2 className="text-2xl font-serif text-theme mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map(related => (
                <button
                  key={related.id}
                  onClick={() => navigate(`/product/${related.id}`)}
                  className="group text-left"
                >
                  <div className="aspect-square rounded-xl overflow-hidden mb-3">
                    <img
                      src={related.image}
                      alt={related.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="text-theme font-medium group-hover:text-theme-primary">{related.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-theme">{formatPrice(related.price)}</span>
                    {related.originalPrice && (
                      <span className="text-sm text-theme-light line-through">{formatPrice(related.originalPrice)}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} companyName={storeSettings?.company_name} />
    </div>
  );
};