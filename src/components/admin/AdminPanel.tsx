// src/components/admin/AdminPanel.tsx
import { useState, useEffect } from 'react';
import { 
  Settings, X, Palette, Sun, Moon, Eye, EyeOff, 
  Save, RefreshCw, Zap, ShoppingBag, Video, Grid, 
  Heart, Users, TrendingUp, Menu, Edit, Copy, Trash2,
  Plus, Check
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { storeConfig } from '../../utils/storeConfig';

// Import the actual config (in a real app, this would be editable)
import type { StoreConfig } from '../../utils/storeConfig';

interface AdminPanelProps {
  isEnabled?: boolean;
}

// Section visibility state
type SectionVisibility = {
  hero: boolean;
  videoCarousel: boolean;
  categories: boolean;
  bestSellers: boolean;
  bestSellers3D: boolean;
  newArrivals: boolean;
  footer: boolean;
};

export const AdminPanel = ({ isEnabled = false }: AdminPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('theme');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const { isDarkMode, toggleTheme, setThemePreset, availablePresets, currentPresetId } = useTheme();
  
  // Section visibility state
  const [sectionVisibility, setSectionVisibility] = useState<SectionVisibility>({
    hero: true,
    videoCarousel: true,
    categories: true,
    bestSellers: true,
    bestSellers3D: true,
    newArrivals: true,
    footer: true,
  });
  
  // Stats state
  const [stats, setStats] = useState({
    visitors: 1234,
    wishlists: 89,
    orders: 45,
    conversion: 23,
    totalProducts: 0,
    totalCategories: 0,
    totalVideos: 0,
  });

  // Preview mode for theme
  const [previewMode, setPreviewMode] = useState(false);
  const [tempPreset, setTempPreset] = useState(currentPresetId);

  // Load saved visibility from localStorage
  useEffect(() => {
    const savedVisibility = localStorage.getItem('section-visibility');
    if (savedVisibility) {
      setSectionVisibility(JSON.parse(savedVisibility));
      applySectionVisibility(JSON.parse(savedVisibility));
    }
    
    // Calculate real stats from storeConfig
    setStats(prev => ({
      ...prev,
      totalProducts: storeConfig.bestSellers.filter(p => p.enabled).length + 
                      storeConfig.newArrivals.filter(p => p.enabled).length,
      totalCategories: storeConfig.categories.filter(c => c.enabled).length,
      totalVideos: storeConfig.featureVideos.filter(v => v.enabled).length,
    }));
  }, []);

  // Check admin mode on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const adminParam = urlParams.get('admin');
    const savedAdmin = localStorage.getItem('admin-mode');
    
    if (adminParam === 'true' || savedAdmin === 'true') {
      setIsVisible(true);
      localStorage.setItem('admin-mode', 'true');
    } else {
      setIsVisible(false);
    }
  }, []);

  // Apply section visibility to DOM
  const applySectionVisibility = (visibility: SectionVisibility) => {
    // Store in localStorage
    localStorage.setItem('section-visibility', JSON.stringify(visibility));
    
    // Dispatch custom event for components to listen
    window.dispatchEvent(new CustomEvent('sectionVisibilityChange', { detail: visibility }));
    
    showSuccessMessage('Sections updated! Refresh to see changes.');
  };

  const toggleSection = (section: keyof SectionVisibility) => {
    const newVisibility = { ...sectionVisibility, [section]: !sectionVisibility[section] };
    setSectionVisibility(newVisibility);
    applySectionVisibility(newVisibility);
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const enableAdmin = () => {
    setIsVisible(true);
    localStorage.setItem('admin-mode', 'true');
    window.location.search = '?admin=true';
  };

  const disableAdmin = () => {
    setIsVisible(false);
    localStorage.removeItem('admin-mode');
    localStorage.removeItem('section-visibility');
    window.location.search = '';
  };

  const applyPreset = (presetId: string) => {
    if (previewMode) {
      setTempPreset(presetId);
    } else {
      setThemePreset(presetId);
      showSuccessMessage(`Theme changed to ${availablePresets.find(p => p.id === presetId)?.name}`);
    }
  };

  const applyChanges = () => {
    if (previewMode && tempPreset !== currentPresetId) {
      setThemePreset(tempPreset);
      showSuccessMessage(`Theme applied: ${availablePresets.find(p => p.id === tempPreset)?.name}`);
    }
    setPreviewMode(false);
  };

  const resetToDefault = () => {
    if (confirm('Reset all settings to default?')) {
      localStorage.removeItem('section-visibility');
      localStorage.removeItem('theme-mode');
      localStorage.removeItem('theme-preset');
      window.location.reload();
    }
  };

  const exportConfig = () => {
    const config = {
      sections: sectionVisibility,
      theme: {
        preset: currentPresetId,
        isDarkMode: isDarkMode,
      },
      exportedAt: new Date().toISOString(),
    };
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `store-config-backup-${Date.now()}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    showSuccessMessage('Config exported!');
  };

  if (!isVisible) {
    return (
      <button
        onClick={enableAdmin}
        className="fixed bottom-4 left-4 z-50 bg-theme-secondary text-theme p-2 rounded-full shadow-lg hover:scale-110 transition-all duration-300 opacity-50 hover:opacity-100 group"
        title="Enable Admin Mode"
      >
        <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
      </button>
    );
  }

  return (
    <>
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-[100] bg-theme-primary text-white px-4 py-2 rounded-lg shadow-lg animate-slide-down flex items-center gap-2">
          <Check className="w-4 h-4" />
          {successMessage}
        </div>
      )}

      {/* Admin Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 left-4 z-50 bg-theme-secondary text-theme p-2 rounded-full shadow-lg hover:scale-110 transition-all duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-70 hover:opacity-100'
        } group`}
        title="Admin Panel"
      >
        <Settings className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-90' : 'group-hover:rotate-45'}`} />
      </button>

      {/* Admin Panel */}
      {isOpen && (
        <div className="fixed bottom-16 left-4 z-50 w-80 sm:w-96 bg-theme-surface rounded-xl shadow-2xl border border-theme overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 px-4 py-3 border-b border-theme">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-theme-primary/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-theme-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-theme">Admin Control Panel</h3>
                  <p className="text-xs text-theme-light">Manage your store settings</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetToDefault}
                  className="text-theme-light hover:text-theme-primary transition-colors"
                  title="Reset to Default"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={exportConfig}
                  className="text-theme-light hover:text-theme-primary transition-colors"
                  title="Export Config"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={disableAdmin}
                  className="text-theme-light hover:text-red-500 transition-colors"
                  title="Exit Admin Mode"
                >
                  <EyeOff className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-theme-light hover:text-theme transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-theme bg-theme-primary/5">
            {[
              { id: 'theme', icon: Palette, label: 'Theme' },
              { id: 'sections', icon: Grid, label: 'Sections' },
              { id: 'content', icon: ShoppingBag, label: 'Content' },
              { id: 'analytics', icon: TrendingUp, label: 'Analytics' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'text-theme-primary border-b-2 border-theme-primary bg-theme-primary/5'
                    : 'text-theme-light hover:text-theme hover:bg-theme-primary/10'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-4 max-h-[450px] overflow-y-auto custom-scrollbar">
            
            {/* ==================== THEME TAB ==================== */}
            {activeTab === 'theme' && (
              <div className="space-y-5">
                {/* Dark/Light Mode */}
                <div>
                  <label className="text-xs font-semibold text-theme-light uppercase tracking-wider mb-2 block flex items-center gap-2">
                    <Sun className="w-3 h-3" /> / <Moon className="w-3 h-3" />
                    Appearance Mode
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => !isDarkMode && toggleTheme()}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                        !isDarkMode
                          ? 'bg-theme-primary text-white shadow-md'
                          : 'bg-theme-secondary/20 text-theme hover:bg-theme-secondary/40'
                      }`}
                    >
                      <Sun className="w-4 h-4" />
                      <span className="text-sm">Light</span>
                    </button>
                    <button
                      onClick={() => isDarkMode && toggleTheme()}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                        isDarkMode
                          ? 'bg-theme-primary text-white shadow-md'
                          : 'bg-theme-secondary/20 text-theme hover:bg-theme-secondary/40'
                      }`}
                    >
                      <Moon className="w-4 h-4" />
                      <span className="text-sm">Dark</span>
                    </button>
                  </div>
                </div>

                {/* Color Presets */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-theme-light uppercase tracking-wider flex items-center gap-2">
                      <Palette className="w-3 h-3" />
                      Color Presets
                    </label>
                    <button
                      onClick={() => setPreviewMode(!previewMode)}
                      className={`text-xs px-2 py-0.5 rounded transition-all duration-200 ${
                        previewMode 
                          ? 'bg-theme-secondary text-theme' 
                          : 'bg-theme-primary/10 text-theme-light hover:bg-theme-primary/20'
                      }`}
                    >
                      {previewMode ? '🔍 Preview Mode' : 'Preview'}
                    </button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {availablePresets.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => applyPreset(preset.id)}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-200 ${
                          (previewMode ? tempPreset : currentPresetId) === preset.id
                            ? 'bg-theme-primary/20 ring-1 ring-theme-primary'
                            : 'hover:bg-theme-secondary/20'
                        }`}
                      >
                        <div className="flex gap-1">
                          <div 
                            className="w-6 h-6 rounded-full shadow-md"
                            style={{ backgroundColor: preset.colors.primary }}
                          />
                          <div 
                            className="w-6 h-6 rounded-full shadow-md"
                            style={{ backgroundColor: preset.colors.secondary }}
                          />
                          <div 
                            className="w-6 h-6 rounded-full shadow-md"
                            style={{ backgroundColor: preset.colors.accent }}
                          />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium text-theme">{preset.name}</div>
                          <div className="text-xs text-theme-light">{preset.description}</div>
                        </div>
                        {(previewMode ? tempPreset : currentPresetId) === preset.id && (
                          <div className="w-2 h-2 rounded-full bg-theme-secondary animate-pulse" />
                        )}
                      </button>
                    ))}
                  </div>
                  
                  {previewMode && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={applyChanges}
                        className="flex-1 bg-theme-primary text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
                      >
                        <Save className="w-3 h-3" />
                        Apply Changes
                      </button>
                      <button
                        onClick={() => {
                          setTempPreset(currentPresetId);
                          setPreviewMode(false);
                        }}
                        className="flex-1 bg-theme-secondary/20 text-theme px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-theme-secondary/40 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ==================== SECTIONS TAB ==================== */}
            {activeTab === 'sections' && (
              <div className="space-y-3">
                <p className="text-xs text-theme-light mb-3 flex items-center gap-2">
                  <Menu className="w-3 h-3" />
                  Toggle sections on/off (changes persist after refresh)
                </p>
                <div className="space-y-2">
                  {Object.entries(sectionVisibility).map(([key, value]) => (
                    <label key={key} className="flex items-center justify-between py-2 cursor-pointer group">
                      <span className="text-sm text-theme capitalize group-hover:text-theme-primary transition-colors">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <button
                        onClick={() => toggleSection(key as keyof SectionVisibility)}
                        className={`relative w-10 h-5 rounded-full transition-all duration-300 ${
                          value ? 'bg-theme-primary' : 'bg-theme-secondary/40'
                        }`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                          value ? 'right-0.5' : 'left-0.5'
                        }`} />
                      </button>
                    </label>
                  ))}
                </div>
                <div className="pt-3 mt-2 border-t border-theme">
                  <button
                    onClick={() => {
                      const allTrue = Object.fromEntries(
                        Object.keys(sectionVisibility).map(key => [key, true])
                      ) as SectionVisibility;
                      setSectionVisibility(allTrue);
                      applySectionVisibility(allTrue);
                    }}
                    className="w-full text-xs text-theme-primary hover:underline"
                  >
                    Show All Sections
                  </button>
                </div>
              </div>
            )}

            {/* ==================== CONTENT TAB ==================== */}
            {activeTab === 'content' && (
              <div className="space-y-4">
                <p className="text-xs text-theme-light mb-2 flex items-center gap-2">
                  <ShoppingBag className="w-3 h-3" />
                  Current content statistics from storeConfig
                </p>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-theme-secondary/10 rounded-lg p-3 text-center hover:bg-theme-secondary/20 transition-all">
                    <ShoppingBag className="w-5 h-5 text-theme-primary mx-auto mb-1" />
                    <div className="text-xl font-bold text-theme">{stats.totalProducts}</div>
                    <div className="text-xs text-theme-light">Total Products</div>
                  </div>
                  <div className="bg-theme-secondary/10 rounded-lg p-3 text-center hover:bg-theme-secondary/20 transition-all">
                    <Grid className="w-5 h-5 text-theme-primary mx-auto mb-1" />
                    <div className="text-xl font-bold text-theme">{stats.totalCategories}</div>
                    <div className="text-xs text-theme-light">Categories</div>
                  </div>
                  <div className="bg-theme-secondary/10 rounded-lg p-3 text-center hover:bg-theme-secondary/20 transition-all">
                    <Video className="w-5 h-5 text-theme-primary mx-auto mb-1" />
                    <div className="text-xl font-bold text-theme">{stats.totalVideos}</div>
                    <div className="text-xs text-theme-light">Feature Videos</div>
                  </div>
                  <div className="bg-theme-secondary/10 rounded-lg p-3 text-center hover:bg-theme-secondary/20 transition-all">
                    <Heart className="w-5 h-5 text-theme-primary mx-auto mb-1" />
                    <div className="text-xl font-bold text-theme">{stats.wishlists}</div>
                    <div className="text-xs text-theme-light">Wishlists</div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-3 mt-2 border-t border-theme space-y-2">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(storeConfig, null, 2));
                      showSuccessMessage('Config copied to clipboard!');
                    }}
                    className="w-full bg-theme-primary/10 text-theme-primary px-3 py-2 rounded-lg text-sm font-medium hover:bg-theme-primary/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Copy className="w-3 h-3" />
                    Copy storeConfig to Clipboard
                  </button>
                  <button 
                    onClick={() => {
                      showSuccessMessage('Open src/utils/storeConfig.ts to edit');
                    }}
                    className="w-full bg-theme-secondary/10 text-theme-secondary px-3 py-2 rounded-lg text-sm font-medium hover:bg-theme-secondary/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Edit className="w-3 h-3" />
                    Edit storeConfig.ts
                  </button>
                </div>
              </div>
            )}

            {/* ==================== ANALYTICS TAB ==================== */}
            {activeTab === 'analytics' && (
              <div className="space-y-4">
                <p className="text-xs text-theme-light mb-2 flex items-center gap-2">
                  <TrendingUp className="w-3 h-3" />
                  Real-time analytics (mock data - connect to your API)
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-theme-primary/10 to-transparent rounded-lg p-3 text-center">
                    <Users className="w-5 h-5 text-theme-primary mx-auto mb-1" />
                    <div className="text-xl font-bold text-theme">{stats.visitors.toLocaleString()}</div>
                    <div className="text-xs text-theme-light">Visitors (Today)</div>
                    <div className="text-green-500 text-xs mt-1">↑ +12%</div>
                  </div>
                  <div className="bg-gradient-to-br from-theme-primary/10 to-transparent rounded-lg p-3 text-center">
                    <Heart className="w-5 h-5 text-theme-primary mx-auto mb-1" />
                    <div className="text-xl font-bold text-theme">{stats.wishlists}</div>
                    <div className="text-xs text-theme-light">Wishlists (Total)</div>
                    <div className="text-green-500 text-xs mt-1">↑ +5%</div>
                  </div>
                  <div className="bg-gradient-to-br from-theme-primary/10 to-transparent rounded-lg p-3 text-center">
                    <ShoppingBag className="w-5 h-5 text-theme-primary mx-auto mb-1" />
                    <div className="text-xl font-bold text-theme">{stats.orders}</div>
                    <div className="text-xs text-theme-light">Orders (Month)</div>
                    <div className="text-green-500 text-xs mt-1">↑ +8%</div>
                  </div>
                  <div className="bg-gradient-to-br from-theme-primary/10 to-transparent rounded-lg p-3 text-center">
                    <TrendingUp className="w-5 h-5 text-theme-primary mx-auto mb-1" />
                    <div className="text-xl font-bold text-theme">+{stats.conversion}%</div>
                    <div className="text-xs text-theme-light">Conversion Rate</div>
                    <div className="text-green-500 text-xs mt-1">↑ +3%</div>
                  </div>
                </div>

                {/* Mock Chart */}
                <div className="pt-3 mt-2 border-t border-theme">
                  <div className="text-xs text-theme-light mb-2">Weekly Visitors Trend</div>
                  <div className="flex items-end gap-1 h-24">
                    {[45, 62, 58, 75, 82, 68, 91].map((height, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div 
                          className="w-full bg-theme-primary/30 hover:bg-theme-primary transition-all rounded-t"
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-[10px] text-theme-light">W{i+1}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-theme-light text-center mt-3">
                    Last 7 days • Data updates every hour
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-theme-primary/5 border-t border-theme text-center">
            <p className="text-[10px] text-theme-light">
              Admin Mode Active • Changes auto-save to localStorage
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: var(--color-background-secondary);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--color-primary);
          border-radius: 4px;
        }
      `}</style>
    </>
  );
};