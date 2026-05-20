// src/services/currencyService.ts (Updated with CORS fix)
import { supabase } from '../lib/supabase';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  isAvailable: boolean;
}

export const availableCurrencies: Currency[] = [
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', flag: '🇵🇭', isAvailable: true },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', isAvailable: false },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', isAvailable: false },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', isAvailable: false },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵', isAvailable: false },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦', isAvailable: false },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺', isAvailable: false },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳', isAvailable: false },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', flag: '🇰🇷', isAvailable: false },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬', isAvailable: false },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', flag: '🇲🇾', isAvailable: false },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', flag: '🇮🇩', isAvailable: false },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', flag: '🇹🇭', isAvailable: false },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', flag: '🇻🇳', isAvailable: false },
];

class CurrencyService {
  private rates: { [key: string]: number } = {};
  private lastUpdate: Date | null = null;
  // Using exchangerate-api.com which has CORS enabled
  private readonly API_URL = 'https://api.exchangerate-api.com/v4/latest';

  async fetchRates(baseCurrency: string = 'PHP'): Promise<{ [key: string]: number } | null> {
    try {
      // ExchangeRate-API supports CORS and has PHP rates
      const response = await fetch(`${this.API_URL}/PHP`);
      const data = await response.json();
      
      if (data && data.rates) {
        this.rates = { ...data.rates, PHP: 1 };
        this.lastUpdate = new Date();
        
        localStorage.setItem('exchangeRates', JSON.stringify({
          rates: this.rates,
          base: baseCurrency,
          lastUpdate: this.lastUpdate.toISOString()
        }));
        
        return this.rates;
      }
      return this.getCachedRates();
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      return this.getCachedRates();
    }
  }

  getCachedRates(): { [key: string]: number } | null {
    const cached = localStorage.getItem('exchangeRates');
    if (cached) {
      const data = JSON.parse(cached);
      this.rates = data.rates;
      this.lastUpdate = new Date(data.lastUpdate);
      return data.rates;
    }
    // Fallback default rates
    return {
      PHP: 1,
      USD: 0.018,
      EUR: 0.017,
      GBP: 0.014,
      JPY: 2.7,
      CAD: 0.024,
      AUD: 0.027,
      CNY: 0.13,
      KRW: 24.5,
      SGD: 0.024,
      MYR: 0.084,
      IDR: 285,
      THB: 0.65,
      VND: 450
    };
  }

  convertPrice(pricePHP: number, targetCurrency: string): number {
    const rates = this.getCachedRates();
    if (!rates || !rates[targetCurrency]) {
      return pricePHP;
    }
    return pricePHP * rates[targetCurrency];
  }

  formatPrice(pricePHP: number, currencyCode: string, currencySymbol: string): string {
    const converted = this.convertPrice(pricePHP, currencyCode);
    const symbol = currencySymbol || this.getCurrencySymbol(currencyCode);
    
    if (currencyCode === 'JPY' || currencyCode === 'KRW' || currencyCode === 'VND' || currencyCode === 'IDR') {
      return `${symbol}${Math.round(converted).toLocaleString()}`;
    }
    
    return `${symbol}${converted.toFixed(2)}`;
  }

  getCurrencySymbol(code: string): string {
    const currency = availableCurrencies.find(c => c.code === code);
    return currency?.symbol || '$';
  }

  async getAvailableCurrencies(): Promise<Currency[]> {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('available_currencies')
        .maybeSingle();
      
      if (!error && data?.available_currencies) {
        const availableCodes = Array.isArray(data.available_currencies) 
          ? data.available_currencies 
          : JSON.parse(data.available_currencies);
        return availableCurrencies.filter(c => availableCodes.includes(c.code));
      }
      
      return availableCurrencies.filter(c => c.code === 'PHP' || c.code === 'USD');
    } catch (error) {
      console.error('Failed to fetch available currencies:', error);
      return availableCurrencies.filter(c => c.code === 'PHP' || c.code === 'USD');
    }
  }

  async getDefaultCurrency(): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('default_currency')
        .maybeSingle();
      
      if (!error && data?.default_currency) {
        return data.default_currency;
      }
      return 'PHP';
    } catch (error) {
      return 'PHP';
    }
  }

  async detectUserCurrency(): Promise<string> {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      const countryCurrencyMap: { [key: string]: string } = {
        'PH': 'PHP', 'US': 'USD', 'GB': 'GBP', 'DE': 'EUR', 'FR': 'EUR',
        'IT': 'EUR', 'ES': 'EUR', 'JP': 'JPY', 'KR': 'KRW', 'CN': 'CNY',
        'SG': 'SGD', 'MY': 'MYR', 'ID': 'IDR', 'TH': 'THB', 'VN': 'VND',
      };
      
      return countryCurrencyMap[data.country_code] || 'PHP';
    } catch (error) {
      return 'PHP';
    }
  }
}

export const currencyService = new CurrencyService();