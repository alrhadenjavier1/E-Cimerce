// src/components/ui/Sidebar.tsx - Fix the quantity buttons
import { X, ShoppingBag, Heart, Trash2, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'cart' | 'wishlist';
}

export const Sidebar = ({ isOpen, onClose, activeTab }: SidebarProps) => {
  const { cart, wishlist, removeFromCart, updateQuantity, getCartTotal, removeFromWishlist, addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  const handleProductClick = (productId: string) => {
    onClose();
    navigate(`/product/${productId}`);
  };

  const handleMoveToCart = (product: any) => {
    addToCart(product);
    removeFromWishlist(product.id);
  };

  // FIXED: Handle quantity decrease
  const handleDecreaseQuantity = (item: any) => {
    const newQuantity = item.quantity - 1;
    if (newQuantity === 0) {
      removeFromCart(item.id, item.cart_item_id);
    } else {
      updateQuantity(item.id, newQuantity, item.cart_item_id);
    }
  };

  // FIXED: Handle quantity increase
  const handleIncreaseQuantity = (item: any) => {
    updateQuantity(item.id, item.quantity + 1, item.cart_item_id);
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-theme-surface shadow-2xl z-50 transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-theme">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-1 hover:bg-theme-secondary/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-theme" />
            </button>
            <div className="flex gap-3">
              <button
                className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all ${
                  activeTab === 'cart'
                    ? 'bg-theme-primary text-white'
                    : 'text-theme hover:bg-theme-secondary/20'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="text-sm">Cart ({cart.length})</span>
              </button>
              <button
                className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all ${
                  activeTab === 'wishlist'
                    ? 'bg-theme-primary text-white'
                    : 'text-theme hover:bg-theme-secondary/20'
                }`}
              >
                <Heart className="w-4 h-4" />
                <span className="text-sm">Wishlist ({wishlist.length})</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'cart' ? (
            cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-theme-light mx-auto mb-4" />
                <p className="text-theme-light">Your cart is empty</p>
                <button
                  onClick={onClose}
                  className="mt-4 text-theme-primary hover:underline"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 bg-theme-secondary/10 rounded-xl">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg cursor-pointer"
                      onClick={() => handleProductClick(item.id)}
                    />
                    <div className="flex-1">
                      <h4 
                        className="text-theme font-medium mb-1 cursor-pointer hover:text-theme-primary"
                        onClick={() => handleProductClick(item.id)}
                      >
                        {item.name}
                      </h4>
                      <p className="text-theme-primary font-semibold">{formatPrice(item.price)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {/* FIXED: Minus button */}
                        <button
                          onClick={() => handleDecreaseQuantity(item)}
                          className="w-7 h-7 rounded-full bg-theme-secondary/20 text-theme hover:bg-theme-secondary transition-colors flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-theme w-8 text-center">{item.quantity}</span>
                        {/* FIXED: Plus button */}
                        <button
                          onClick={() => handleIncreaseQuantity(item)}
                          className="w-7 h-7 rounded-full bg-theme-secondary/20 text-theme hover:bg-theme-secondary transition-colors flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id, item.cart_item_id)}
                          className="ml-auto p-1 text-red-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            wishlist.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-theme-light mx-auto mb-4" />
                <p className="text-theme-light">Your wishlist is empty</p>
                <button
                  onClick={onClose}
                  className="mt-4 text-theme-primary hover:underline"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {wishlist.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 bg-theme-secondary/10 rounded-xl">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg cursor-pointer"
                      onClick={() => handleProductClick(item.id)}
                    />
                    <div className="flex-1">
                      <h4
                        className="text-theme font-medium mb-1 cursor-pointer hover:text-theme-primary"
                        onClick={() => handleProductClick(item.id)}
                      >
                        {item.name}
                      </h4>
                      <p className="text-theme-primary font-semibold">{formatPrice(item.price)}</p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleMoveToCart(item)}
                          className="text-xs bg-theme-primary text-white px-3 py-1 rounded-full hover:bg-opacity-90"
                        >
                          Move to Cart
                        </button>
                        <button
                          onClick={() => removeFromWishlist(item.id)}
                          className="text-xs bg-red-500/20 text-red-500 px-3 py-1 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {activeTab === 'cart' && cart.length > 0 && (
          <div className="border-t border-theme p-4 space-y-3">
            <div className="flex justify-between text-theme">
              <span>Subtotal</span>
              <span className="font-semibold">{formatPrice(getCartTotal())}</span>
            </div>
            <p className="text-xs text-theme-light">Shipping calculated at checkout</p>
            <button
              onClick={handleCheckout}
              className="w-full bg-theme-primary text-white py-3 rounded-full hover:bg-opacity-90 transition-all transform hover:scale-[1.02]"
            >
              Checkout
            </button>
            <button
              onClick={onClose}
              className="w-full text-theme-primary hover:underline text-sm"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
};