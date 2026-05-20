// src/pages/admin/AdminCurrencySettings.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { availableCurrencies, currencyService, type Currency } from '../../services/currencyService';
import { Save, RefreshCw, DollarSign, Globe, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const AdminCurrencySettings = () => {
  const [currencies, setCurrencies] = useState<Currency[]>(availableCurrencies);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({});
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [defaultCurrency, setDefaultCurrency] = useState('PHP');

  useEffect(() => {
    loadSettings();
    loadExchangeRates();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('available_currencies, default_currency')
        .single();
      
      if (!error && data) {
        if (data.available_currencies) {
          setCurrencies(prev => prev.map(c => ({
            ...c,
            isAvailable: data.available_currencies.includes(c.code)
          })));
        }
        setDefaultCurrency(data.default_currency || 'PHP');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExchangeRates = async () => {
    const rates = currencyService.getCachedRates();
    if (rates) {
      setExchangeRates(rates);
      const cached = localStorage.getItem('exchangeRates');
      if (cached) {
        const data = JSON.parse(cached);
        setLastUpdate(new Date(data.lastUpdate).toLocaleString());
      }
    }
  };

  const toggleCurrency = (code: string) => {
    setCurrencies(prev => prev.map(c => 
      c.code === code ? { ...c, isAvailable: !c.isAvailable } : c
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    
    const availableCodes = currencies.filter(c => c.isAvailable).map(c => c.code);
    
    // Ensure at least one currency is selected
    if (availableCodes.length === 0) {
      setMessage({ type: 'error', text: 'At least one currency must be available' });
      setSaving(false);
      return;
    }
    
    // Ensure default currency is available
    if (!availableCodes.includes(defaultCurrency)) {
      setDefaultCurrency(availableCodes[0]);
    }
    
    try {
      const { error } = await supabase
        .from('store_settings')
        .upsert({
          id: 1,
          available_currencies: availableCodes,
          default_currency: defaultCurrency,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Currency settings saved successfully!' });
      
      // Refresh available currencies in service
      await currencyService.getAvailableCurrencies();
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save:', error);
      setMessage({ type: 'error', text: 'Failed to save currency settings' });
    } finally {
      setSaving(false);
    }
  };

  const fetchLiveRates = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      const rates = await currencyService.fetchRates('PHP');
      if (rates) {
        setExchangeRates(rates);
        setLastUpdate(new Date().toLocaleString());
        setMessage({ type: 'success', text: 'Exchange rates updated successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch exchange rates' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch exchange rates' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-theme-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const selectedCount = currencies.filter(c => c.isAvailable).length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Currency Settings</h1>
          <p className="text-gray-500 mt-1">Manage available currencies and exchange rates</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchLiveRates}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
            Fetch Live Rates
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-theme-primary text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {message.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {message.type === 'error' && <AlertCircle className="w-5 h-5" />}
          {message.type === 'info' && <Globe className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Exchange Rates Info */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-theme-primary" />
              Current Exchange Rates (PHP Base)
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Last updated: {lastUpdate || 'Not yet fetched'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500">Powered by</span>
            <p className="font-medium text-gray-700">Frankfurter API</p>
          </div>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-3">
          {Object.entries(exchangeRates).slice(0, 12).map(([code, rate]) => (
            <div key={code} className="bg-white rounded p-2 text-center">
              <span className="font-bold text-gray-700">{code}</span>
              <span className="text-xs text-gray-500 ml-1">{rate.toFixed(4)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Default Currency Selection */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-theme-primary" />
          Default Currency
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          This currency will be shown to new visitors before they select their preference
        </p>
        <select
          value={defaultCurrency}
          onChange={(e) => setDefaultCurrency(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-theme-primary"
        >
          {currencies.filter(c => c.isAvailable).map(currency => (
            <option key={currency.code} value={currency.code}>
              {currency.flag} {currency.name} ({currency.code})
            </option>
          ))}
        </select>
      </div>

      {/* Available Currencies */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Available Currencies</h2>
            <span className="text-sm text-gray-500">{selectedCount} selected</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Enable currencies that customers can choose from the storefront
          </p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {currencies.map((currency) => (
            <div key={currency.code} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{currency.flag}</span>
                <div>
                  <p className="font-medium text-gray-900">
                    {currency.name} <span className="text-gray-500 ml-1">({currency.code})</span>
                  </p>
                  <p className="text-sm text-gray-500">{currency.symbol}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {exchangeRates[currency.code] && (
                  <span className="text-sm text-gray-500">
                    1 PHP = {exchangeRates[currency.code].toFixed(4)} {currency.code}
                  </span>
                )}
                <button
                  onClick={() => toggleCurrency(currency.code)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-offset-2 ${
                    currency.isAvailable ? 'bg-theme-primary' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      currency.isAvailable ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          About Exchange Rates
        </h3>
        <p className="text-sm text-blue-700">
          • Exchange rates are fetched from the Frankfurter API, which provides real-time rates<br />
          • Rates are updated daily or can be manually refreshed using the "Fetch Live Rates" button<br />
          • All prices are stored in PHP (Philippine Peso) and converted based on selected currency<br />
          • Customers can switch between enabled currencies using the currency selector in the navigation bar<br />
          • The system will attempt to auto-detect the user's country and suggest the appropriate currency
        </p>
      </div>
    </div>
  );
};