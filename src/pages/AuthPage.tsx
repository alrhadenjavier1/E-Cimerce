// src/pages/AuthPage.tsx (updated for custom auth)
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { authService } from '../services/authService';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useStoreData } from '../hooks/useStoreData';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { categories, footerLinks, socialLinks, storeSettings } = useStoreData();
  
  useEffect(() => {
    // Check if already logged in
    const checkSession = async () => {
      const { isAuthenticated, account } = await authService.getCurrentSession();
      if (isAuthenticated && account) {
        navigate('/');
      }
    };
    checkSession();
  }, [navigate]);
  
  const validateForm = () => {
    setError(null);
    
    if (!email || !password) {
      setError('Please fill in all required fields');
      return false;
    }
    
    if (!isLogin) {
      if (!fullName) {
        setError('Please enter your full name');
        return false;
      }
      
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
      
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }
    
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (isLogin) {
        // Login
        const result = await authService.login(email, password);
        
        if (!result.success) {
          setError(result.error || 'Login failed');
          setLoading(false);
          return;
        }
        
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => navigate('/'), 1500);
      } else {
        // Register
        const result = await authService.register(email, password, fullName);
        
        if (!result.success) {
          setError(result.error || 'Registration failed');
          setLoading(false);
          return;
        }
        
        setSuccess(
          'Account created! Please check your email for the confirmation code.\n' +
          'You will need to verify your email before logging in.'
        );
        
        // Redirect to confirmation page after 3 seconds
        setTimeout(() => {
          navigate(`/confirm?email=${encodeURIComponent(email)}`);
        }, 3000);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-theme-surface">
      <Navbar categories={categories} companyName={storeSettings?.company_name} />
      
      <main className="max-w-md mx-auto px-4 py-16 mt-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-serif text-theme mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-theme-light">
            {isLogin 
              ? 'Sign in to access your account and wishlist' 
              : 'Join Bowdeluxe for exclusive offers and early access'}
          </p>
        </div>
        
        <div className="bg-theme-surface rounded-2xl shadow-xl border border-theme overflow-hidden">
          <div className="p-6 md:p-8">
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-700 whitespace-pre-line">{success}</p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-theme text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary text-gray-900"
                      placeholder="John Doe"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-theme text-sm font-medium mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary text-gray-900"
                    placeholder="hello@example.com"
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-theme text-sm font-medium mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary text-gray-900"
                    placeholder={isLogin ? 'Enter your password' : 'Create a password (min. 6 characters)'}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              {!isLogin && (
                <div>
                  <label className="block text-theme text-sm font-medium mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary text-gray-900"
                      placeholder="Confirm your password"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-theme-primary text-white py-3 rounded-lg font-medium hover:bg-opacity-90 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-theme"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-theme-surface text-theme-light">or</span>
              </div>
            </div>
            
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setSuccess(null);
                setEmail('');
                setPassword('');
                setFullName('');
                setConfirmPassword('');
              }}
              className="w-full text-center text-theme-primary hover:text-theme-primary/80 transition-colors"
            >
              {isLogin 
                ? "Don't have an account? Sign Up" 
                : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
      </main>
      
      <Footer footerLinks={footerLinks} socialLinks={socialLinks} companyName={storeSettings?.company_name} />
    </div>
  );
};