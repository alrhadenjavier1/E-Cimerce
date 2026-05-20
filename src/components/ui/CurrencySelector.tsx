// src/components/ui/CurrencySelector.tsx
import { useState, useRef, useEffect } from 'react';
import { DollarSign, ChevronDown, Check, Globe } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

export const CurrencySelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currency, setCurrency, availableCurrencies } = useCurrency();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (availableCurrencies.length <= 1) {
    // Show only the current currency if only one is available
    return (
      <div className="flex items-center gap-2 text-theme px-3 py-2">
        <span className="text-xl">{currency.flag}</span>
        <span className="text-sm font-medium">{currency.code}</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-theme hover:text-theme-primary transition-colors px-3 py-2 rounded-lg hover:bg-theme-secondary/20"
      >
        <span className="text-xl">{currency.flag}</span>
        <span className="text-sm font-medium">{currency.code}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-theme-surface rounded-xl shadow-xl border border-theme overflow-hidden animate-slide-down z-50">
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-medium text-theme-light border-b border-theme mb-1 flex items-center gap-2">
              <Globe className="w-3 h-3" />
              Select your currency
            </div>
            <div className="max-h-80 overflow-y-auto">
              {availableCurrencies.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => {
                    setCurrency(curr);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    currency.code === curr.code
                      ? 'bg-theme-primary/10 text-theme-primary'
                      : 'text-theme hover:bg-theme-secondary/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{curr.flag}</span>
                    <div className="text-left">
                      <span className="font-medium">{curr.code}</span>
                      <span className="text-xs text-theme-light ml-2">{curr.name}</span>
                    </div>
                  </div>
                  {currency.code === curr.code && (
                    <Check className="w-4 h-4 text-theme-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};