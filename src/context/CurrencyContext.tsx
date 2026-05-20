// src/context/CurrencyContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { currencyService, availableCurrencies, type Currency } from '../services/currencyService';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertPrice: (pricePHP: number) => number;
  formatPrice: (pricePHP: number) => string;
  availableCurrencies: Currency[];
  isLoading: boolean;
  refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency | null>(null);
  const [availableCurrenciesList, setAvailableCurrenciesList] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initCurrency();
  }, []);

  const initCurrency = async () => {
    setIsLoading(true);
    
    try {
      await refreshRates();
      
      const available = await currencyService.getAvailableCurrencies();
      setAvailableCurrenciesList(available);
      
      const savedCurrencyCode = localStorage.getItem('selectedCurrency');
      let selectedCurrency = available.find(c => c.code === savedCurrencyCode);
      
      if (!selectedCurrency) {
        const detectedCode = await currencyService.detectUserCurrency();
        selectedCurrency = available.find(c => c.code === detectedCode) || available[0];
      }
      
      if (selectedCurrency) {
        setCurrencyState(selectedCurrency);
        localStorage.setItem('selectedCurrency', selectedCurrency.code);
      } else if (available.length > 0) {
        setCurrencyState(available[0]);
      } else {
        const phpCurrency = availableCurrencies.find(c => c.code === 'PHP');
        setCurrencyState(phpCurrency || { code: 'PHP', symbol: '₱', name: 'Philippine Peso', flag: '🇵🇭', isAvailable: true });
      }
    } catch (error) {
      console.error('Failed to initialize currency:', error);
      const phpCurrency = availableCurrencies.find(c => c.code === 'PHP');
      setCurrencyState(phpCurrency || { code: 'PHP', symbol: '₱', name: 'Philippine Peso', flag: '🇵🇭', isAvailable: true });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshRates = async () => {
    await currencyService.fetchRates('PHP');
  };

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('selectedCurrency', newCurrency.code);
  };

  const convertPrice = (pricePHP: number): number => {
    if (!currency) return pricePHP;
    return currencyService.convertPrice(pricePHP, currency.code);
  };

  const formatPrice = (pricePHP: number): string => {
    if (!currency) return `₱${pricePHP.toFixed(2)}`;
    return currencyService.formatPrice(pricePHP, currency.code, currency.symbol);
  };

  // Show loading state while initializing
  if (isLoading || !currency) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-theme-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        convertPrice,
        formatPrice,
        availableCurrencies: availableCurrenciesList,
        isLoading,
        refreshRates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};