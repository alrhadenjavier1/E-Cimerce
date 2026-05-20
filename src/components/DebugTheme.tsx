// src/components/DebugTheme.tsx
import { useTheme } from '../context/ThemeContext';

export const DebugTheme = () => {
  const { isDarkMode, currentTheme, currentPresetId, availablePresets } = useTheme();
  
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-theme-surface border border-theme rounded-lg p-3 shadow-xl text-xs">
      <div className="space-y-1">
        <div className="font-bold text-theme">Theme Debug</div>
        <div className="text-theme">Mode: {isDarkMode ? '🌙 Dark' : '☀️ Light'}</div>
        <div className="text-theme">Preset: {currentTheme.name}</div>
        <div className="text-theme">Primary: <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} /></div>
        <div className="text-theme">Secondary: <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-secondary)' }} /></div>
        <button 
          onClick={() => {
            const root = document.documentElement;
            console.log('CSS Variables:', {
              background: getComputedStyle(root).getPropertyValue('--color-background'),
              text: getComputedStyle(root).getPropertyValue('--color-text'),
              primary: getComputedStyle(root).getPropertyValue('--color-primary'),
            });
          }}
          className="mt-2 px-2 py-1 bg-theme-secondary text-theme rounded text-xs"
        >
          Log CSS Vars
        </button>
      </div>
    </div>
  );
};