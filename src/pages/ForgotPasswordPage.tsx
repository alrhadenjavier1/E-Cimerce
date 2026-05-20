// src/pages/ForgotPasswordPage.tsx (FIXED - No EmailJS)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useStoreData } from '../hooks/useStoreData';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { categories, footerLinks, socialLinks, storeSettings } = useStoreData();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Supabase handles sending the email automatically
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (resetError) throw resetError;
      
      // Just show success - Supabase sent the email
      setSubmitted(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (submitted) {
    return (
      <div className="min-h-screen bg-theme-surface">
        <Navbar categories={categories} companyName={storeSettings?.company_name} />
        
        <main className="max-w-md mx-auto px-4 py-16 mt-16">
          <div className="bg-theme-surface rounded-2xl shadow-xl border border-theme p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-serif text-theme mb-2">Check Your Email</h2>
            <p className="text-theme-light mb-6">
              We've sent password reset instructions to:<br />
              <strong className="text-theme">{email}</strong>
            </p>
            <p className="text-sm text-theme-light mb-4">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="text-theme-primary hover:underline"
            >
              Return to Sign In
            </button>
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
          <h1 className="text-3xl font-serif text-theme mb-2">Reset Password</h1>
          <p className="text-theme-light">
            Enter your email address and we'll send you a link to reset your password
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
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 text-gray-900"
                  placeholder="hello@example.com"
                  disabled={loading}
                  required
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
                'Send Reset Instructions'
              )}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="w-full flex items-center justify-center gap-2 text-theme-light hover:text-theme-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </button>
          </form>
        </div>
      </main>
      
      <Footer footerLinks={footerLinks} socialLinks={socialLinks} companyName={storeSettings?.company_name} />
    </div>
  );
};