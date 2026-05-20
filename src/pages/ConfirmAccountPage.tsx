// src/pages/ConfirmAccountPage.tsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Key, Loader2, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import { authService } from '../services/authService';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useStoreData } from '../hooks/useStoreData';

export const ConfirmAccountPage = () => {
  const [confirmationCode, setConfirmationCode] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { categories, footerLinks, socialLinks, storeSettings } = useStoreData();
  
  // Get email from URL params if passed
  const queryEmail = new URLSearchParams(location.search).get('email');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !confirmationCode) {
      setError('Please enter both email and confirmation code');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.confirmAccount(email, confirmationCode);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/auth');
        }, 3000);
      } else {
        setError(result.error || 'Confirmation failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendCode = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }
    
    setResending(true);
    setError(null);
    
    try {
      const result = await authService.resendConfirmationCode(email);
      
      if (result.success) {
        setError(null);
        alert('New confirmation code sent to your email!');
      } else {
        setError(result.error || 'Failed to resend code');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };
  
  if (success) {
    return (
      <div className="min-h-screen bg-theme-surface">
        <Navbar categories={categories} companyName={storeSettings?.company_name} />
        
        <main className="max-w-md mx-auto px-4 py-16 mt-16">
          <div className="bg-theme-surface rounded-2xl shadow-xl border border-theme p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-serif text-theme mb-2">Email Confirmed!</h2>
            <p className="text-theme-light mb-6">
              Your account has been successfully verified. Redirecting to login...
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
          <h1 className="text-3xl font-serif text-theme mb-2">Confirm Your Account</h1>
          <p className="text-theme-light">
            Enter the 6-digit code sent to your email
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
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={queryEmail || "your@email.com"}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary text-gray-900"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-theme text-sm font-medium mb-2">
                Confirmation Code
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary text-gray-900 text-center text-2xl tracking-widest"
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
                'Verify Account'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-theme-light mb-2">
              Didn't receive a code?
            </p>
            <button
              onClick={handleResendCode}
              disabled={resending}
              className="text-theme-primary hover:underline text-sm disabled:opacity-50"
            >
              {resending ? 'Sending...' : 'Resend Confirmation Code'}
            </button>
          </div>
          
          <div className="mt-6 pt-4 border-t border-theme text-center">
            <button
              onClick={() => navigate('/auth')}
              className="text-theme-light hover:text-theme-primary text-sm"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </main>
      
      <Footer footerLinks={footerLinks} socialLinks={socialLinks} companyName={storeSettings?.company_name} />
    </div>
  );
};