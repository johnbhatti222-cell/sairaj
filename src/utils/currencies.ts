import { Currency } from '../types/invoice';

export const CURRENCIES: Currency[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', locale: 'ar-AE' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', locale: 'de-CH' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
];

export function formatCurrency(amount: number, currency: Currency): string {
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: currency.code === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency.code === 'JPY' ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency.symbol}${amount.toFixed(2)}`;
  }
}
