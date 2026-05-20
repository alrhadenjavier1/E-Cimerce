// src/components/ui/UserMenu.tsx
import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, Heart, ShoppingBag, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../context/CartContext';
import { Shield } from 'lucide-react';

interface UserMenuProps {
  isLoggedIn?: boolean;
  onNavigate?: (path: string) => void;
}

export const UserMenu = ({ isLoggedIn: propIsLoggedIn, onNavigate }: UserMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { getWishlistCount, getCartCount } = useCart();
  
  const isLoggedIn = !!user || propIsLoggedIn;
  const userEmail = user?.email || '';
  const userName = user?.user_metadata?.full_name || userEmail.split('@')[0];
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleLogout = async () => {
    await signOut();
    setIsOpen(false);
    navigate('/auth');
  };
  
  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
    setIsOpen(false);
  };
  
  if (!isLoggedIn) {
    return (
      <button
        onClick={() => handleNavigate('/auth')}
        className="flex items-center gap-2 text-theme hover:text-theme-primary transition-colors px-3 py-2 rounded-lg hover:bg-theme-secondary/20"
      >
        <User className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:inline">Sign In</span>
      </button>
    );
  }
  
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-theme hover:text-theme-primary transition-colors px-3 py-2 rounded-lg hover:bg-theme-secondary/20"
      >
        <UserCircle className="w-5 h-5" />
        <span className="text-sm font-medium hidden sm:inline">{userName}</span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-theme-surface rounded-xl shadow-xl border border-theme overflow-hidden animate-slide-down z-50">
          <div className="px-4 py-3 border-b border-theme bg-theme-secondary/10">
            <p className="text-theme font-medium">{userName}</p>
            <p className="text-xs text-theme-light truncate">{userEmail}</p>
          </div>
          
          <div className="py-2">
            <button
              onClick={() => handleNavigate('/account')}
              className="w-full px-4 py-2.5 text-left text-theme hover:bg-theme-secondary/20 transition-colors flex items-center gap-3"
            >
              <User className="w-4 h-4" />
              <span>My Account</span>
            </button>
            
            <button
              onClick={() => handleNavigate('/orders')}
              className="w-full px-4 py-2.5 text-left text-theme hover:bg-theme-secondary/20 transition-colors flex items-center gap-3"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>My Orders</span>
              {getCartCount() > 0 && (
                <span className="ml-auto bg-theme-secondary text-theme text-xs rounded-full px-2 py-0.5">
                  {getCartCount()}
                </span>
              )}
            </button>
            
            <button
              onClick={() => handleNavigate('/wishlist')}
              className="w-full px-4 py-2.5 text-left text-theme hover:bg-theme-secondary/20 transition-colors flex items-center gap-3"
            >
              <Heart className="w-4 h-4" />
              <span>Wishlist</span>
              {getWishlistCount() > 0 && (
                <span className="ml-auto bg-theme-primary text-white text-xs rounded-full px-2 py-0.5">
                  {getWishlistCount()}
                </span>
              )}
            </button>
            
            <button
              onClick={() => handleNavigate('/settings')}
              className="w-full px-4 py-2.5 text-left text-theme hover:bg-theme-secondary/20 transition-colors flex items-center gap-3"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => {
                handleNavigate('/admin');
                setIsOpen(false);
              }}
              className="w-full px-4 py-2.5 text-left text-theme hover:bg-theme-secondary/20 transition-colors flex items-center gap-3"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </button>
          </div>
          
          <div className="border-t border-theme py-2">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 text-left text-red-500 hover:bg-red-50 transition-colors flex items-center gap-3"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};