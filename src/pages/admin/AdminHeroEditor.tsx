// src/pages/admin/AdminHeroEditor.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Image, Type, Link, Eye, EyeOff, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

export const AdminHeroEditor = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  
  const [heroContent, setHeroContent] = useState({
    title: 'Elegance Redefined',
    subtitle: 'Discover curated collections that blend timeless design with modern sophistication',
    ctaText: 'Explore Collection',
    ctaLink: '/products',
    secondaryCtaText: 'Learn More',
    secondaryCtaLink: '/about',
    backgroundImage: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&q=80',
    enabled: true,
  });

  useEffect(() => {
    loadHeroContent();
  }, []);

  const loadHeroContent = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('hero_content')
        .single();
      
      if (!error && data?.hero_content) {
        setHeroContent(data.hero_content);
      }
    } catch (error) {
      console.error('Failed to load hero content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      const { error } = await supabase
        .from('store_settings')
        .update({
          hero_content: heroContent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', (await supabase.from('store_settings').select('id').single()).data?.id);
      
      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Hero section updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save:', error);
      setMessage({ type: 'error', text: 'Failed to save hero content' });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // In a real app, upload to Supabase Storage or Cloudinary
    // For demo, create a local preview URL
    const imageUrl = URL.createObjectURL(file);
    setHeroContent({ ...heroContent, backgroundImage: imageUrl });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-theme-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hero Section Editor</h1>
          <p className="text-gray-500 mt-1">Customize your homepage hero banner</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {previewMode ? 'Edit Mode' : 'Preview'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-theme-primary text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Panel */}
        <div className="bg-white rounded-lg shadow p-6 space-y-5">
          {/* Enable Toggle */}
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <span className="font-medium text-gray-900">Enable Hero Section</span>
              <p className="text-sm text-gray-500">Show or hide the hero banner on homepage</p>
            </div>
            <button
              onClick={() => setHeroContent({ ...heroContent, enabled: !heroContent.enabled })}
              className={`relative w-10 h-5 rounded-full transition-all duration-300 ${
                heroContent.enabled ? 'bg-theme-primary' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                heroContent.enabled ? 'right-0.5' : 'left-0.5'
              }`} />
            </button>
          </label>

          {/* Background Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Background Image
            </label>
            <div className="flex gap-3">
              <input
                type="url"
                value={heroContent.backgroundImage}
                onChange={(e) => setHeroContent({ ...heroContent, backgroundImage: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary"
                placeholder="https://example.com/image.jpg"
              />
              <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">Recommended size: 1920x1080px</p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Type className="w-4 h-4" />
              Title
            </label>
            <input
              type="text"
              value={heroContent.title}
              onChange={(e) => setHeroContent({ ...heroContent, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary"
              placeholder="Main headline"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
            <textarea
              value={heroContent.subtitle}
              onChange={(e) => setHeroContent({ ...heroContent, subtitle: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary"
              placeholder="Supporting text"
            />
          </div>

          {/* Primary CTA */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Link className="w-3 h-3" />
                Primary Button Text
              </label>
              <input
                type="text"
                value={heroContent.ctaText}
                onChange={(e) => setHeroContent({ ...heroContent, ctaText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
              <input
                type="text"
                value={heroContent.ctaLink}
                onChange={(e) => setHeroContent({ ...heroContent, ctaLink: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary"
                placeholder="/products"
              />
            </div>
          </div>

          {/* Secondary CTA */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Button Text</label>
              <input
                type="text"
                value={heroContent.secondaryCtaText}
                onChange={(e) => setHeroContent({ ...heroContent, secondaryCtaText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
              <input
                type="text"
                value={heroContent.secondaryCtaLink}
                onChange={(e) => setHeroContent({ ...heroContent, secondaryCtaLink: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary"
                placeholder="/about"
              />
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-medium text-gray-900">Live Preview</h3>
            <p className="text-sm text-gray-500">See how your hero section will look</p>
          </div>
          <div className="p-4">
            <div 
              className="relative rounded-lg overflow-hidden min-h-[400px] flex items-center justify-center bg-cover bg-center"
              style={{ backgroundImage: `url(${heroContent.backgroundImage})` }}
            >
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10 text-center text-white p-8 max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{heroContent.title || 'Your Title Here'}</h1>
                <p className="text-lg md:text-xl mb-6 opacity-90">{heroContent.subtitle || 'Your subtitle here'}</p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <button className="px-6 py-3 bg-theme-primary text-white rounded-lg font-medium hover:opacity-90 transition-all">
                    {heroContent.ctaText || 'Shop Now'}
                  </button>
                  {heroContent.secondaryCtaText && (
                    <button className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg font-medium hover:bg-white/30 transition-all">
                      {heroContent.secondaryCtaText}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">💡 Tips for an Effective Hero Section</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use high-quality images that represent your brand</li>
          <li>• Keep your headline concise and impactful (5-8 words)</li>
          <li>• Make your CTA button text action-oriented (e.g., "Shop Now", "Discover More")</li>
          <li>• Ensure text has good contrast with the background image</li>
          <li>• Test your hero section on both desktop and mobile devices</li>
        </ul>
      </div>
    </div>
  );
};