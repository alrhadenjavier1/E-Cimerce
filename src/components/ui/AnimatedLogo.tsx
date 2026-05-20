// src/components/ui/AnimatedLogo.tsx
import { useState } from 'react';
import { storeConfig } from '../../utils/storeConfig';

interface AnimatedLogoProps {
  onClick?: () => void;
  className?: string;
}

export const AnimatedLogo = ({ onClick, className = "" }: AnimatedLogoProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { companyName, animations } = storeConfig;

  return (
    <div 
      className={`relative cursor-pointer ${className}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h1 className={`text-xl sm:text-2xl font-serif tracking-wide text-theme transition-all duration-${animations.animationDuration} ${
        isHovered && animations.enableHoverEffects 
          ? 'text-theme-primary scale-105' 
          : ''
      }`}>
        {companyName}
      </h1>
      
      <div className={`absolute -bottom-1 left-0 h-0.5 bg-theme-secondary transition-all duration-${animations.animationDuration} ${
        isHovered && animations.enableHoverEffects ? 'w-full' : 'w-0'
      }`} />
      
      {isHovered && animations.enableHoverEffects && (
        <div className="absolute inset-0 overflow-hidden rounded">
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>
      )}
      
      <div className={`absolute -inset-2 bg-theme-primary/0 rounded-lg transition-all duration-${animations.animationDuration} ${
        isHovered && animations.enableHoverEffects ? 'bg-theme-primary/10 scale-110' : ''
      }`} />
    </div>
  );
};