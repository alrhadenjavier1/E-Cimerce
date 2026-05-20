// src/context/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { storeConfig, themePresets, type Theme } from '../utils/storeConfig';

interface ThemeContextType {
  currentTheme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  // Admin functions - can be exposed via admin panel only
  setThemePreset: (presetId: string) => void;
  availablePresets: Theme[];
  currentPresetId: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Check if we're in admin mode (can be set via URL param or environment variable)
const isAdminMode = () => {
  // Option 1: Check URL param
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('admin') === 'true' || import.meta.env.DEV;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPresetId, setCurrentPresetId] = useState(storeConfig.theme.preset);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const availablePresets = storeConfig.themePresets || themePresets;
  
  const getThemeColors = (presetId: string, dark: boolean): Theme => {
    const preset = availablePresets.find(p => p.id === presetId) || availablePresets[0];
    const colors = { ...preset.colors };
    
    // Apply custom colors if specified (admin only)
    if (isAdminMode() && storeConfig.theme.customColors) {
      if (storeConfig.theme.customColors.primary) colors.primary = storeConfig.theme.customColors.primary;
      if (storeConfig.theme.customColors.secondary) colors.secondary = storeConfig.theme.customColors.secondary;
      if (storeConfig.theme.customColors.accent) colors.accent = storeConfig.theme.customColors.accent;
      if (storeConfig.theme.customColors.background && !dark) colors.background = storeConfig.theme.customColors.background;
      if (storeConfig.theme.customColors.text) colors.text = storeConfig.theme.customColors.text;
    }
    
    // Dark mode adjustments
    if (dark) {
      return {
        ...preset,
        colors: {
          ...colors,
          background: '#1a1a1a',
          backgroundSecondary: '#2d2d2d',
          surface: '#3d3d3d',
          text: '#ffffff',
          textLight: '#b0b0b0',
          border: '#4d4d4d',
        },
      };
    }
    
    return { ...preset, colors };
  };
  
  const applyThemeToDocument = (presetId: string, dark: boolean) => {
    const theme = getThemeColors(presetId, dark);
    const root = document.documentElement;
    const colors = theme.colors;
    
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-background-secondary', colors.backgroundSecondary);
    root.style.setProperty('--color-surface', colors.surface);
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-text', colors.text);
    root.style.setProperty('--color-text-light', colors.textLight);
    root.style.setProperty('--color-border', colors.border);
    root.style.setProperty('--color-success', colors.success);
    root.style.setProperty('--color-error', colors.error);
    root.style.setProperty('--color-warning', colors.warning);
    
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };
  
  // Initialize theme
  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode');
    const savedPreset = localStorage.getItem('theme-preset');
    
    let dark = false;
    
    // Only load saved preset for admin mode
    if (isAdminMode() && savedPreset) {
      setCurrentPresetId(savedPreset);
    }
    
    if (savedMode === 'dark') {
      dark = true;
      setIsDarkMode(true);
    } else if (savedMode === 'light') {
      dark = false;
      setIsDarkMode(false);
    } else if (storeConfig.theme.defaultMode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      dark = prefersDark;
      setIsDarkMode(prefersDark);
    } else if (storeConfig.theme.defaultMode === 'dark') {
      dark = true;
      setIsDarkMode(true);
    } else {
      dark = false;
      setIsDarkMode(false);
    }
    
    applyThemeToDocument(currentPresetId, dark);
    setIsInitialized(true);
  }, []);
  
  // Apply theme when preset or dark mode changes
  useEffect(() => {
    if (isInitialized) {
      applyThemeToDocument(currentPresetId, isDarkMode);
      localStorage.setItem('theme-mode', isDarkMode ? 'dark' : 'light');
      if (isAdminMode()) {
        localStorage.setItem('theme-preset', currentPresetId);
      }
    }
  }, [currentPresetId, isDarkMode, isInitialized]);
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  const setThemePreset = (presetId: string) => {
    if (isAdminMode()) {
      setCurrentPresetId(presetId);
    }
  };
  
  const currentTheme = getThemeColors(currentPresetId, isDarkMode);
  
  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        isDarkMode,
        toggleTheme,
        setThemePreset,
        availablePresets,
        currentPresetId,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};