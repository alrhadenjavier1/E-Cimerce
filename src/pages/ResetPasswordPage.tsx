// src/pages/ResetPasswordPage.tsx (FIXED)
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useStoreData } from '../hooks/useStoreData';

export const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { categories, footerLinks, socialLinks, storeSettings } = useStoreData();
  
  useEffect(() => {
    // Supabase puts the access token in the URL hash fragment
    const hashParams = new URLSearchParams(location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    
    console.log('Reset page loaded - hash:', location.hash);
    console.log('Access token present:', !!accessToken);
    console.log('Type:', type);
    
    if (!accessToken && type !== 'recovery') {
      setError('Invalid or expired reset link. Please request a new one.');
    }
  }, [location]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (updateError) throw updateError;
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    } catch (err: any) {
      console.error('Reset password error:', err);
      if (err.message.includes('session')) {
        setError('Your reset link may have expired. Please request a new password reset.');
      } else {
        setError(err.message || 'Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  if (success) {
    return (
      <div className="min-h-screen bg-theme-surface">
        <Navbar categories={categories} companyName={storeSettings?.company_name} />
        
        <main className="max-w-md mx-auto px-4 py-16 mt-16">
          <div className="bg-theme-surface rounded-2xl shadow-xl border border-theme p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-serif text-theme mb-2">Password Reset Successful</h2>
            <p className="text-theme-light mb-6">
              Your password has been updated. Redirecting to login...
            </p>
            <div className="w-8 h-8 border-2 border-theme-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </main>
        
        <Footer footerLinks={footerLinks} socialLinks={socialLinks} companyName={storeSettings?.company_name} />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-theme-surface">
      <Navbar categories={categories} companyName={storeSettings?.company_name} />
      
      <main className="max-w-md mx-auto px-4 py-16 mt-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-theme mb-2">Create New Password</h1>
          <p className="text-theme-light">
            Enter your new password below
          </p>
        </div>
        
        <div className="bg-theme-surface rounded-2xl shadow-xl border border-theme p-6 md:p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-theme text-sm font-medium mb-2">
                New Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 text-gray-900"
                  placeholder="Enter new password (min. 6 characters)"
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
            
            <div>
              <label className="block text-theme text-sm font-medium mb-2">
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 text-gray-900"
                  placeholder="Confirm your new password"
                  disabled={loading}
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-theme-primary text-white py-3 rounded-lg font-medium hover:bg-opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </div>
      </main>
      
      <Footer footerLinks={footerLinks} socialLinks={socialLinks} companyName={storeSettings?.company_name} />
    </div>
  );
};