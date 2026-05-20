// src/pages/admin/AdminSettings.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { 
  Save, 
  Globe, 
  Palette, 
  Layout, 
  Search, 
  Image, 
  Eye, 
  EyeOff, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Gauge, 
  Rocket, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Sun, 
  Moon, 
  Laptop, 
  CheckCircle, 
  AlertCircle, 
  Type, 
  Grid, 
  Menu, 
  Download, 
  Upload, 
  FileText, 
  Share2,
} from 'lucide-react';

// Custom icon components since lucide-react doesn't export Facebook directly
const FacebookIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="5" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);

const YoutubeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

type TabType = 'general' | 'appearance' | 'layout' | 'sections' | 'hero' | 'seo' | 'social' | 'currencies';

interface StoreSettings {
  id: string;
  company_name: string;
  company_email: string;
  company_phone: string;
  company_address: string;
  description: string;
  theme_preset: string;
  theme_default_mode: 'light' | 'dark' | 'system';
  theme_allow_toggle: boolean;
  ui_settings: {
    headerAutoHide: boolean;
    productsPerRow: { mobile: number; tablet: number; desktop: number };
    carouselAutoplaySpeed: number;
  };
  animations: {
    enableHoverEffects: boolean;
    enableScrollAnimations: boolean;
    animationDuration: number;
    hoverScale: number;
  };
  sections: {
    hero: boolean;
    videoCarousel: boolean;
    categories: boolean;
    bestSellers: boolean;
    bestSellers3D: boolean;
    newArrivals: boolean;
    footer: boolean;
  };
  seo: {
    title: string;
    description: string;
    favicon: string;
    ogImage: string;
    keywords: string[];
  };
  hero_content: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    secondaryCtaText: string;
    secondaryCtaLink: string;
    backgroundImage: string;
    enabled: boolean;
  };
  available_currencies: string[];
  default_currency: string;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  enabled: boolean;
  sort_order: number;
}

export const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  
  const [settings, setSettings] = useState<StoreSettings>({
    id: '',
    company_name: 'Bowdeluxe',
    company_email: 'hello@bowdeluxe.com',
    company_phone: '+1 (555) 123-4567',
    company_address: '123 Luxury Avenue, New York, NY 10001',
    description: 'Discover timeless elegance with our curated collection of premium goods',
    theme_preset: 'pearl',
    theme_default_mode: 'light',
    theme_allow_toggle: true,
    ui_settings: {
      headerAutoHide: true,
      productsPerRow: { mobile: 1, tablet: 2, desktop: 4 },
      carouselAutoplaySpeed: 5000,
    },
    animations: {
      enableHoverEffects: true,
      enableScrollAnimations: true,
      animationDuration: 300,
      hoverScale: 1.05,
    },
    sections: {
      hero: true,
      videoCarousel: true,
      categories: true,
      bestSellers: true,
      bestSellers3D: true,
      newArrivals: true,
      footer: true,
    },
    seo: {
      title: 'Bowdeluxe | Luxury E-commerce',
      description: 'Discover timeless elegance with our curated collection of premium goods',
      favicon: 'https://cdn-icons-png.flaticon.com/512/1040/1040257.png',
      ogImage: '',
      keywords: ['luxury', 'ecommerce', 'fashion', 'jewelry'],
    },
    hero_content: {
      title: 'Elegance Redefined',
      subtitle: 'Discover curated collections that blend timeless design with modern sophistication',
      ctaText: 'Explore Collection',
      ctaLink: '/products',
      secondaryCtaText: 'Learn More',
      secondaryCtaLink: '/about',
      backgroundImage: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&q=80',
      enabled: true,
    },
    available_currencies: ['PHP', 'USD', 'EUR', 'GBP'],
    default_currency: 'PHP',
  });
const { user, loading: authLoading } = useAuth();
  useEffect(() => {
    loadSettings();
    loadSocialLinks();
  }, []);

const loadSettings = async () => {
  if (!user) {
    console.log('No user authenticated');
    setLoading(false);
    return;
  }
  
  setLoading(true);
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
      console.error('Error loading settings:', error);
      if (error.code === '42P01') {
        console.error('Table does not exist. Please run the SQL schema first.');
      }
      return;
    }
    
    if (data) {
      setSettings({
        ...settings,
        id: data.id,
        company_name: data.company_name || settings.company_name,
        company_email: data.company_email || settings.company_email,
        company_phone: data.company_phone || settings.company_phone,
        company_address: data.company_address || settings.company_address,
        description: data.description || settings.description,
        theme_preset: data.theme_preset || settings.theme_preset,
        theme_default_mode: data.theme_default_mode || settings.theme_default_mode,
        theme_allow_toggle: data.theme_allow_toggle ?? settings.theme_allow_toggle,
        ui_settings: data.ui_settings || settings.ui_settings,
        animations: data.animations || settings.animations,
        sections: data.sections || settings.sections,
        seo: data.seo || settings.seo,
        hero_content: data.hero_content || settings.hero_content,
        available_currencies: data.available_currencies || settings.available_currencies,
        default_currency: data.default_currency || settings.default_currency,
      });
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  } finally {
    setLoading(false);
  }
};

  const loadSocialLinks = async () => {
  if (!user) return;
  
  try {
    const { data, error } = await supabase
      .from('social_links')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (!error && data) {
      setSocialLinks(data);
    } else if (error && error.code === '42P01') {
      console.warn('Social links table not found yet');
    }
  } catch (error) {
    console.error('Failed to load social links:', error);
  }
};

  const handleSave = async () => {
  if (!user) {
    setMessage({ type: 'error', text: 'You must be logged in to save settings' });
    return;
  }
  
  setSaving(true);
  setMessage(null);
  
  try {
    // First, check if a record exists
    let settingsId = settings.id;
    
    if (!settingsId) {
      const { data: existing } = await supabase
        .from('store_settings')
        .select('id')
        .maybeSingle(); // Use maybeSingle instead of single to avoid 406 error
      
      if (existing) {
        settingsId = existing.id;
      }
    }
    
    const updateData = {
      company_name: settings.company_name,
      company_email: settings.company_email,
      company_phone: settings.company_phone,
      company_address: settings.company_address,
      description: settings.description,
      theme_preset: settings.theme_preset,
      theme_default_mode: settings.theme_default_mode,
      theme_allow_toggle: settings.theme_allow_toggle,
      ui_settings: settings.ui_settings,
      animations: settings.animations,
      sections: settings.sections,
      seo: settings.seo,
      hero_content: settings.hero_content,
      available_currencies: settings.available_currencies,
      default_currency: settings.default_currency,
      updated_at: new Date().toISOString(),
    };
    
    let error;
    
    if (settingsId) {
      // Update existing
      const result = await supabase
        .from('store_settings')
        .update(updateData)
        .eq('id', settingsId);
      error = result.error;
    } else {
      // Insert new
      const result = await supabase
        .from('store_settings')
        .insert([updateData]);
      error = result.error;
    }
    
    if (error) throw error;
    
    // Save social links
    for (const link of socialLinks) {
      const { error: socialError } = await supabase
        .from('social_links')
        .upsert({
          id: link.id,
          platform: link.platform,
          url: link.url,
          icon: link.icon,
          enabled: link.enabled,
          sort_order: link.sort_order,
        });
      
      if (socialError) throw socialError;
    }
    
    setMessage({ type: 'success', text: 'All settings saved successfully!' });
    setTimeout(() => setMessage(null), 3000);
    
    await loadSettings();
  } catch (error: any) {
    console.error('Failed to save:', error);
    if (error.code === '42P01') {
      setMessage({ type: 'error', text: 'Database table not found. Please run the SQL schema first.' });
    } else if (error.message?.includes('JWT')) {
      setMessage({ type: 'error', text: 'Session expired. Please log in again.' });
    } else {
      setMessage({ type: 'error', text: 'Failed to save settings: ' + (error.message || 'Unknown error') });
    }
  } finally {
    setSaving(false);
  }
};

  const exportSettings = () => {
    const exportData = {
      settings: {
        company_name: settings.company_name,
        company_email: settings.company_email,
        company_phone: settings.company_phone,
        company_address: settings.company_address,
        description: settings.description,
        theme_preset: settings.theme_preset,
        theme_default_mode: settings.theme_default_mode,
        theme_allow_toggle: settings.theme_allow_toggle,
        ui_settings: settings.ui_settings,
        animations: settings.animations,
        sections: settings.sections,
        seo: settings.seo,
        hero_content: settings.hero_content,
        available_currencies: settings.available_currencies,
        default_currency: settings.default_currency,
      },
      social_links: socialLinks,
      exported_at: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `store-settings-backup-${Date.now()}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    setMessage({ type: 'success', text: 'Settings exported!' });
    setTimeout(() => setMessage(null), 2000);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (imported.settings) {
          setSettings({ ...settings, ...imported.settings });
        }
        if (imported.social_links) {
          setSocialLinks(imported.social_links);
        }
        setMessage({ type: 'success', text: 'Settings imported! Click Save to apply.' });
        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Invalid JSON file' });
      }
    };
    reader.readAsText(file);
  };

  const updateSocialLink = (id: string, updates: Partial<SocialLink>) => {
    setSocialLinks(prev => prev.map(link => 
      link.id === id ? { ...link, ...updates } : link
    ));
  };

  const getPlatformIcon = (platform: string) => {
    switch(platform.toLowerCase()) {
      case 'instagram': return <InstagramIcon />;
      case 'facebook': return <FacebookIcon />;
      case 'twitter': return <TwitterIcon />;
      case 'youtube': return <YoutubeIcon />;
      default: return <Globe className="w-5 h-5" />;
    }
  };

  const themePresets = [
    { id: 'pearl', name: 'Pearl Elegance', description: 'Warm, sophisticated neutrals with lavender accents', colors: ['#AF9AC9', '#E3C49B', '#F5F1ED'] },
    { id: 'midnight', name: 'Midnight Luxury', description: 'Deep navy, gold accents, sophisticated dark theme', colors: ['#E94560', '#FFD700', '#1A1A2E'] },
    { id: 'sunset', name: 'Sunset Glow', description: 'Warm oranges, terracotta, and cream tones', colors: ['#E86A5F', '#F4A261', '#FFF5F0'] },
    { id: 'forest', name: 'Forest Calm', description: 'Earthy greens, natural, peaceful ambiance', colors: ['#5E8B7E', '#D4A373', '#F0F4ED'] },
    { id: 'ocean', name: 'Ocean Breeze', description: 'Cool blues, serene, fresh and clean', colors: ['#4A90E2', '#7BDFF2', '#E8F4F8'] },
    { id: 'royal', name: 'Royal Purple', description: 'Rich purples, gold, majestic and bold', colors: ['#7B2D8E', '#FFD700', '#F8F4FC'] },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-theme-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
          <p className="text-gray-500 mt-1">Configure your store appearance and functionality</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {previewMode ? 'Exit Preview' : 'Preview Changes'}
          </button>
          <button
            onClick={exportSettings}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            Import
            <input type="file" accept=".json" onChange={importSettings} className="hidden" />
          </label>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-theme-primary text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save All'}
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

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex gap-1 px-4 min-w-max">
            {[
              { id: 'general', icon: Building, label: 'General' },
              { id: 'appearance', icon: Palette, label: 'Appearance' },
              { id: 'layout', icon: Layout, label: 'Layout' },
              { id: 'sections', icon: Grid, label: 'Sections' },
              { id: 'hero', icon: Image, label: 'Hero' },
              { id: 'seo', icon: Search, label: 'SEO' },
              { id: 'social', icon: Share2, label: 'Social' },
              { id: 'currencies', icon: Globe, label: 'Currencies' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-theme-primary text-theme-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={settings.company_name}
                    onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Company Email
                  </label>
                  <input
                    type="email"
                    value={settings.company_email}
                    onChange={(e) => setSettings({ ...settings, company_email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Company Phone
                  </label>
                  <input
                    type="text"
                    value={settings.company_phone}
                    onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Company Address
                  </label>
                  <textarea
                    value={settings.company_address}
                    onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Store Description
                  </label>
                  <textarea
                    value={settings.description}
                    onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary"
                    placeholder="Describe your store..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Theme Preset</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {themePresets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setSettings({ ...settings, theme_preset: preset.id })}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        settings.theme_preset === preset.id
                          ? 'border-theme-primary bg-theme-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex gap-2 mb-3">
                        {preset.colors.map((color, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full shadow-md"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <div className="font-medium text-gray-900">{preset.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{preset.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Theme Mode</label>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { value: 'light', icon: Sun, label: 'Light Mode', description: 'Light background, dark text' },
                    { value: 'dark', icon: Moon, label: 'Dark Mode', description: 'Dark background, light text' },
                    { value: 'system', icon: Laptop, label: 'System Default', description: 'Follows device settings' },
                  ].map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => setSettings({ ...settings, theme_default_mode: mode.value as any })}
                      className={`flex-1 min-w-[150px] p-4 rounded-lg border-2 transition-all text-left ${
                        settings.theme_default_mode === mode.value
                          ? 'border-theme-primary bg-theme-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <mode.icon className="w-5 h-5 mb-2" />
                      <div className="font-medium text-gray-900">{mode.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{mode.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.theme_allow_toggle}
                  onChange={(e) => setSettings({ ...settings, theme_allow_toggle: e.target.checked })}
                  className="w-4 h-4 text-theme-primary rounded focus:ring-theme-primary"
                />
                <span className="text-sm text-gray-700">Allow users to toggle between light/dark mode</span>
              </label>

              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900">Live Preview</h3>
                  <span className="text-xs text-gray-500">How your theme appears</span>
                </div>
                <div 
                  className="rounded-lg p-6 transition-all"
                  style={{ 
                    backgroundColor: settings.theme_default_mode === 'dark' ? '#1a1a1a' : '#f9fafb',
                  }}
                >
                  <div className="flex gap-3 mb-4 flex-wrap">
                    <button className="px-4 py-2 rounded-lg text-white transition-all" style={{ backgroundColor: themePresets.find(p => p.id === settings.theme_preset)?.colors[0] || '#AF9AC9' }}>
                      Primary Button
                    </button>
                    <button className="px-4 py-2 rounded-lg text-white transition-all" style={{ backgroundColor: themePresets.find(p => p.id === settings.theme_preset)?.colors[1] || '#E3C49B' }}>
                      Secondary Button
                    </button>
                  </div>
                  <div className="space-y-2">
                    <p style={{ color: settings.theme_default_mode === 'dark' ? '#ffffff' : '#374151' }}>
                      Sample text in your theme
                    </p>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 rounded-full text-white" style={{ backgroundColor: themePresets.find(p => p.id === settings.theme_preset)?.colors[0] || '#AF9AC9' }}>
                        New
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: themePresets.find(p => p.id === settings.theme_preset)?.colors[2] || '#F5F1ED', color: '#374151' }}>
                        Sale
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Layout Tab */}
          {activeTab === 'layout' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Grid className="w-4 h-4" />
                  Products Per Row
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Smartphone className="w-3 h-3" />
                      Mobile
                    </label>
                    <select
                      value={settings.ui_settings.productsPerRow.mobile}
                      onChange={(e) => setSettings({
                        ...settings,
                        ui_settings: {
                          ...settings.ui_settings,
                          productsPerRow: { ...settings.ui_settings.productsPerRow, mobile: parseInt(e.target.value) }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {[1, 2].map(n => <option key={n}>{n} column{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Tablet className="w-3 h-3" />
                      Tablet
                    </label>
                    <select
                      value={settings.ui_settings.productsPerRow.tablet}
                      onChange={(e) => setSettings({
                        ...settings,
                        ui_settings: {
                          ...settings.ui_settings,
                          productsPerRow: { ...settings.ui_settings.productsPerRow, tablet: parseInt(e.target.value) }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {[2, 3].map(n => <option key={n}>{n} column{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Monitor className="w-3 h-3" />
                      Desktop
                    </label>
                    <select
                      value={settings.ui_settings.productsPerRow.desktop}
                      onChange={(e) => setSettings({
                        ...settings,
                        ui_settings: {
                          ...settings.ui_settings,
                          productsPerRow: { ...settings.ui_settings.productsPerRow, desktop: parseInt(e.target.value) }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {[3, 4, 5].map(n => <option key={n}>{n} column{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Gauge className="w-4 h-4" />
                  Carousel Autoplay Speed (ms)
                </label>
                <input
                  type="number"
                  value={settings.ui_settings.carouselAutoplaySpeed}
                  onChange={(e) => setSettings({
                    ...settings,
                    ui_settings: { ...settings.ui_settings, carouselAutoplaySpeed: parseInt(e.target.value) }
                  })}
                  className="w-48 px-3 py-2 border border-gray-300 rounded-lg"
                  step={500}
                />
                <p className="text-xs text-gray-500 mt-1">0 to disable autoplay</p>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.ui_settings.headerAutoHide}
                  onChange={(e) => setSettings({
                    ...settings,
                    ui_settings: { ...settings.ui_settings, headerAutoHide: e.target.checked }
                  })}
                  className="w-4 h-4 text-theme-primary rounded focus:ring-theme-primary"
                />
                <span className="text-sm text-gray-700">Auto-hide header on scroll</span>
              </label>

              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Rocket className="w-4 h-4" />
                  Animation Effects
                </h3>
                
                <label className="flex items-center gap-3 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    checked={settings.animations.enableHoverEffects}
                    onChange={(e) => setSettings({
                      ...settings,
                      animations: { ...settings.animations, enableHoverEffects: e.target.checked }
                    })}
                    className="w-4 h-4 text-theme-primary rounded focus:ring-theme-primary"
                  />
                  <span className="text-sm text-gray-700">Enable hover effects on buttons and cards</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    checked={settings.animations.enableScrollAnimations}
                    onChange={(e) => setSettings({
                      ...settings,
                      animations: { ...settings.animations, enableScrollAnimations: e.target.checked }
                    })}
                    className="w-4 h-4 text-theme-primary rounded focus:ring-theme-primary"
                  />
                  <span className="text-sm text-gray-700">Enable scroll animations (fade-in effects)</span>
                </label>

                {settings.animations.enableHoverEffects && (
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg inline-block">
                    <button 
                      className="px-4 py-2 bg-theme-primary text-white rounded-lg transition-all"
                      style={{ 
                        transition: `all ${settings.animations.animationDuration}ms`,
                        transform: settings.animations.enableHoverEffects ? `scale(${settings.animations.hoverScale})` : 'scale(1)'
                      }}
                      onMouseLeave={(e) => {
                        if (settings.animations.enableHoverEffects) {
                          e.currentTarget.style.transform = 'scale(1)';
                        }
                      }}
                      onMouseEnter={(e) => {
                        if (settings.animations.enableHoverEffects) {
                          e.currentTarget.style.transform = `scale(${settings.animations.hoverScale})`;
                        }
                      }}
                    >
                      Preview Hover Effect
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      Scale: {settings.animations.hoverScale}x | Duration: {settings.animations.animationDuration}ms
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sections Tab */}
          {activeTab === 'sections' && (
            <div className="space-y-6">
              <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                <Menu className="w-4 h-4" />
                Toggle which sections appear on your homepage
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(settings.sections).map(([key, value]) => (
                  <label key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <div>
                      <span className="font-medium text-gray-900 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {key === 'hero' && 'Main banner with call-to-action'}
                        {key === 'videoCarousel' && 'Featured videos carousel'}
                        {key === 'categories' && 'Category grid display'}
                        {key === 'bestSellers' && 'Best selling products grid'}
                        {key === 'bestSellers3D' && '3D carousel in hero section'}
                        {key === 'newArrivals' && 'New arrivals products grid'}
                        {key === 'footer' && 'Footer with links and social media'}
                      </p>
                    </div>
                    <button
                      onClick={() => setSettings({
                        ...settings,
                        sections: { ...settings.sections, [key]: !value }
                      })}
                      className={`relative w-10 h-5 rounded-full transition-all duration-300 ${
                        value ? 'bg-theme-primary' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                        value ? 'right-0.5' : 'left-0.5'
                      }`} />
                    </button>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    const allTrue = Object.fromEntries(
                      Object.keys(settings.sections).map(key => [key, true])
                    ) as typeof settings.sections;
                    setSettings({ ...settings, sections: allTrue });
                  }}
                  className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Show All Sections
                </button>
                <button
                  onClick={() => {
                    const allFalse = Object.fromEntries(
                      Object.keys(settings.sections).map(key => [key, false])
                    ) as typeof settings.sections;
                    setSettings({ ...settings, sections: allFalse });
                  }}
                  className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Hide All Sections
                </button>
              </div>
            </div>
          )}

          {/* Hero Tab */}
          {activeTab === 'hero' && (
            <div className="space-y-6">
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <span className="font-medium text-gray-900">Enable Hero Section</span>
                  <p className="text-sm text-gray-500">Show or hide the hero banner on homepage</p>
                </div>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    hero_content: { ...settings.hero_content, enabled: !settings.hero_content.enabled }
                  })}
                  className={`relative w-10 h-5 rounded-full transition-all duration-300 ${
                    settings.hero_content.enabled ? 'bg-theme-primary' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                    settings.hero_content.enabled ? 'right-0.5' : 'left-0.5'
                  }`} />
                </button>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Background Image URL
                </label>
                <input
                  type="url"
                  value={settings.hero_content.backgroundImage}
                  onChange={(e) => setSettings({
                    ...settings,
                    hero_content: { ...settings.hero_content, backgroundImage: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary"
                  placeholder="https://example.com/hero-image.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">Recommended size: 1920x1080px</p>
                {settings.hero_content.backgroundImage && (
                  <div className="mt-2 rounded-lg overflow-hidden h-32 w-full">
                    <img src={settings.hero_content.backgroundImage} alt="Hero preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={settings.hero_content.title}
                  onChange={(e) => setSettings({
                    ...settings,
                    hero_content: { ...settings.hero_content, title: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <textarea
                  value={settings.hero_content.subtitle}
                  onChange={(e) => setSettings({
                    ...settings,
                    hero_content: { ...settings.hero_content, subtitle: e.target.value }
                  })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Button Text</label>
                  <input
                    type="text"
                    value={settings.hero_content.ctaText}
                    onChange={(e) => setSettings({
                      ...settings,
                      hero_content: { ...settings.hero_content, ctaText: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Button Link</label>
                  <input
                    type="text"
                    value={settings.hero_content.ctaLink}
                    onChange={(e) => setSettings({
                      ...settings,
                      hero_content: { ...settings.hero_content, ctaLink: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Button Text</label>
                  <input
                    type="text"
                    value={settings.hero_content.secondaryCtaText}
                    onChange={(e) => setSettings({
                      ...settings,
                      hero_content: { ...settings.hero_content, secondaryCtaText: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Button Link</label>
                  <input
                    type="text"
                    value={settings.hero_content.secondaryCtaLink}
                    onChange={(e) => setSettings({
                      ...settings,
                      hero_content: { ...settings.hero_content, secondaryCtaLink: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="mt-4 rounded-lg overflow-hidden border border-gray-200">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">Live Preview</h3>
                </div>
                <div 
                  className="relative min-h-[300px] flex items-center justify-center bg-cover bg-center p-8"
                  style={{ backgroundImage: `url(${settings.hero_content.backgroundImage})` }}
                >
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="relative z-10 text-center text-white">
                    <h1 className="text-3xl font-bold mb-3">{settings.hero_content.title || 'Title Here'}</h1>
                    <p className="mb-5 opacity-90">{settings.hero_content.subtitle || 'Subtitle here'}</p>
                    <div className="flex gap-3 justify-center flex-wrap">
                      <button className="px-5 py-2 bg-theme-primary text-white rounded-lg">{settings.hero_content.ctaText || 'Shop Now'}</button>
                      {settings.hero_content.secondaryCtaText && (
                        <button className="px-5 py-2 bg-white/20 backdrop-blur-sm rounded-lg">{settings.hero_content.secondaryCtaText}</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">SEO Preview</h3>
                <div className="space-y-1">
                  <div className="text-lg text-blue-600">{settings.seo.title || 'No title set'}</div>
                  <div className="text-sm text-green-700">{window.location.origin}</div>
                  <div className="text-sm text-gray-600">{settings.seo.description || 'No description set'}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Browser Tab Title</label>
                <input
                  type="text"
                  value={settings.seo.title}
                  onChange={(e) => setSettings({
                    ...settings,
                    seo: { ...settings.seo, title: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                <textarea
                  value={settings.seo.description}
                  onChange={(e) => setSettings({
                    ...settings,
                    seo: { ...settings.seo, description: e.target.value }
                  })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Favicon URL
                </label>
                <input
                  type="url"
                  value={settings.seo.favicon}
                  onChange={(e) => setSettings({
                    ...settings,
                    seo: { ...settings.seo, favicon: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary"
                />
                {settings.seo.favicon && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={settings.seo.favicon} alt="Favicon" className="w-6 h-6" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Open Graph Image</label>
                <input
                  type="url"
                  value={settings.seo.ogImage}
                  onChange={(e) => setSettings({
                    ...settings,
                    seo: { ...settings.seo, ogImage: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SEO Keywords</label>
                <input
                  type="text"
                  value={settings.seo.keywords.join(', ')}
                  onChange={(e) => setSettings({
                    ...settings,
                    seo: { ...settings.seo, keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary"
                  placeholder="luxury, fashion, jewelry"
                />
              </div>
            </div>
          )}

          {/* Social Tab */}
          {activeTab === 'social' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Manage your social media links displayed in the footer</p>
              
              {socialLinks.map((link) => (
                <div key={link.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    {getPlatformIcon(link.platform)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium capitalize">{link.platform}</div>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateSocialLink(link.id, { url: e.target.value })}
                      className="w-full mt-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary"
                      placeholder="https://..."
                    />
                  </div>
                  <button
                    onClick={() => updateSocialLink(link.id, { enabled: !link.enabled })}
                    className={`relative w-10 h-5 rounded-full transition-all duration-300 ${
                      link.enabled ? 'bg-theme-primary' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                      link.enabled ? 'right-0.5' : 'left-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Currencies Tab */}
          {activeTab === 'currencies' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                <select
                  value={settings.default_currency}
                  onChange={(e) => setSettings({ ...settings, default_currency: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary"
                >
                  {settings.available_currencies.map(code => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Currencies</label>
                <div className="flex flex-wrap gap-3">
                  {['PHP', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'SGD', 'CHF', 'CNY'].map(code => (
                    <label key={code} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={settings.available_currencies.includes(code)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSettings({
                              ...settings,
                              available_currencies: [...settings.available_currencies, code].sort()
                            });
                          } else {
                            setSettings({
                              ...settings,
                              available_currencies: settings.available_currencies.filter(c => c !== code)
                            });
                          }
                        }}
                        className="w-4 h-4 text-theme-primary rounded focus:ring-theme-primary"
                      />
                      <span className="text-sm">{code}</span>
                    </label>
                  ))}
                </div>
              </div>

              {!settings.available_currencies.includes(settings.default_currency) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                  ⚠️ Default currency is not in the available currencies list. Please add it or change the default.
                </div>
              )}

              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  About Currencies
                </h3>
                <p className="text-sm text-blue-700">
                  • All product prices are stored in PHP (Philippine Peso)<br />
                  • Prices are automatically converted based on real-time exchange rates<br />
                  • Customers can switch between enabled currencies using the currency selector<br />
                  • Exchange rates are fetched daily from the Frankfurter API
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};