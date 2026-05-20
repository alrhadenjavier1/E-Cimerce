// src/components/layout/Navbar.tsx - Update to use custom auth
import { useState, useEffect } from 'react';
import { Search, ShoppingBag, Heart, ChevronDown, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserMenu } from '../ui/UserMenu';
import { ThemeToggle } from '../ui/ThemeToggle';
import { AnimatedLogo } from '../ui/AnimatedLogo';
import { Sidebar } from '../ui/Sidebar';
import { useCart } from '../../context/CartContext';
import { authService } from '../../services/authService';
import type { Category } from '../../utils/storeConfig';

interface NavbarProps {
  categories?: Category[];
  companyName?: string;
}

export const Navbar = ({ categories = [], companyName = "Bowdeluxe" }: NavbarProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'cart' | 'wishlist'>('cart');
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const navigate = useNavigate();
  const { getCartCount, getWishlistCount } = useCart();
  
  const cartCount = getCartCount();
  const wishlistCount = getWishlistCount();

  // Check auth status
  useEffect(() => {
    const checkAuth = async () => {
      const { isAuthenticated } = await authService.getCurrentSession();
      setIsLoggedIn(isAuthenticated);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 10);
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const openCart = () => {
    setSidebarTab('cart');
    setIsSidebarOpen(true);
  };

  const openWishlist = () => {
    setSidebarTab('wishlist');
    setIsSidebarOpen(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const enabledCategories = categories.filter(c => c.enabled);

  return (
    <>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        activeTab={sidebarTab}
      />
      
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-theme-surface/95 backdrop-blur-md shadow-lg' 
          : 'bg-theme-surface'
      } ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        {/* Rest of your navbar JSX remains the same... */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <AnimatedLogo onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate('/');
              }} />
            </div>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8">
              <form onSubmit={handleSearch} className="relative w-full group">
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 pr-4 bg-white border border-gray-300 rounded-full focus:outline-none focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 text-gray-900 placeholder-gray-400 transition-all duration-300"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-theme-primary transition-colors duration-300" />
              </form>
            </div>

            {/* Desktop Right Icons */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
              {/* Categories Dropdown */}
              {enabledCategories.length > 0 && (
                <div className="relative group">
                  <button className="flex items-center gap-1 text-theme hover:text-theme-primary transition-colors duration-300 text-sm font-medium px-3 py-2 rounded-lg hover:bg-theme-secondary/20">
                    <span>Categories</span>
                    <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
                  </button>
                  <div className="absolute right-0 mt-2 w-56 bg-theme-surface rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top group-hover:scale-100 scale-95 border border-theme z-50">
                    <div className="py-2">
                      {enabledCategories.map((category) => (
                        <a
                          key={category.id}
                          href={`/category/${category.slug}`}
                          className="block px-4 py-2.5 text-theme hover:bg-theme-secondary/20 hover:text-theme-primary transition-colors text-sm"
                        >
                          {category.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Heart Icon */}
              <button 
                onClick={openWishlist}
                className="relative text-theme hover:text-theme-primary transition-all duration-300 p-2 rounded-lg hover:bg-theme-secondary/20 group"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5 transition-transform group-hover:scale-110" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-theme-primary text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-bounce-slow">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </button>
              
              {/* Cart Icon */}
              <button 
                onClick={openCart}
                className="relative text-theme hover:text-theme-primary transition-all duration-300 p-2 rounded-lg hover:bg-theme-secondary/20 group"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-110" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-theme-secondary text-theme text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-bounce-slow font-semibold">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>
              
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* User Menu - Pass isLoggedIn state */}
              <UserMenu isLoggedIn={isLoggedIn} onNavigate={navigate} />
            </div>

            {/* Mobile Controls */}
            <div className="flex md:hidden items-center space-x-1">
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)} 
                className="text-theme p-2 rounded-lg hover:bg-theme-secondary/20 transition-all"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              <button 
                onClick={openWishlist}
                className="relative text-theme p-2 rounded-lg hover:bg-theme-secondary/20 transition-all"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-theme-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistCount > 9 ? '9' : wishlistCount}
                  </span>
                )}
              </button>
              <button 
                onClick={openCart}
                className="relative text-theme p-2 rounded-lg hover:bg-theme-secondary/20 transition-all"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-theme-secondary text-theme text-xs rounded-full w-4 h-4 flex items-center justify-center font-semibold">
                    {cartCount > 9 ? '9' : cartCount}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="text-theme p-2 rounded-lg hover:bg-theme-secondary/20 transition-all"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isSearchOpen && (
            <div className="md:hidden pb-3 animate-slide-down">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 bg-white border border-gray-300 rounded-full focus:outline-none focus:border-theme-primary text-gray-900 placeholder-gray-400 text-sm"
                  autoFocus
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </form>
            </div>
          )}
        </div>

        {/* Mobile Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-theme-surface border-t border-theme max-h-[calc(100vh-56px)] overflow-y-auto animate-slide-down shadow-xl">
            <div className="px-4 py-3 space-y-2">
              <div className="pb-3 border-b border-theme">
                <UserMenu isLoggedIn={isLoggedIn} onNavigate={navigate} />
              </div>
              
              <button
                onClick={() => {
                  openWishlist();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-between w-full py-3 px-3 text-theme hover:text-theme-primary hover:bg-theme-secondary/10 rounded-lg text-base transition-colors"
              >
                <span>Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="bg-theme-primary text-white text-xs rounded-full px-2 py-0.5">
                    {wishlistCount}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => {
                  openCart();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-between w-full py-3 px-3 text-theme hover:text-theme-primary hover:bg-theme-secondary/10 rounded-lg text-base transition-colors"
              >
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="bg-theme-secondary text-theme text-xs rounded-full px-2 py-0.5 font-semibold">
                    {cartCount}
                  </span>
                )}
              </button>
              
              {enabledCategories.map((category) => (
                <a
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="block py-3 px-3 text-theme hover:text-theme-primary hover:bg-theme-secondary/10 rounded-lg text-base transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {category.name}
                </a>
              ))}
              
              <div className="pt-3 mt-2 border-t border-theme">
                <div className="px-3 flex items-center justify-between">
                  <span className="text-theme text-sm">Theme</span>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
      
      <div className="h-14 sm:h-16" />
    </>
  );
};