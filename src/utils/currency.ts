export type Currency = 'USD' | 'NTD';

export const DEFAULT_CURRENCY: Currency = 'USD';
export const USD_TO_NTD = 31.51;

export const currencyLabels: Record<Currency, string> = {
  USD: 'USD',
  NTD: 'NTD',
};

export const convertFromUsd = (value: number, currency: Currency): number => {
  if (!Number.isFinite(value)) return 0;
  return currency === 'USD' ? value : value * USD_TO_NTD;
};

export const formatNumber = (
  value: number,
  options?: Intl.NumberFormatOptions
): string => {
  if (!Number.isFinite(value)) return '-';
  return new Intl.NumberFormat('en-US', options).format(value);
};

export const formatCurrencyValue = (
  value: number,
  currency: Currency,
  options?: Intl.NumberFormatOptions
): string => formatNumber(convertFromUsd(value, currency), options);
