import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  DEFAULT_CURRENCY,
  type Currency,
  currencyLabels,
  convertFromUsd,
  formatCurrencyValue,
} from '../utils/currency';

interface CurrencyContextValue {
  currency: Currency;
  currencyLabel: string;
  setCurrency: (currency: Currency) => void;
  convertAmount: (value: number) => number;
  formatAmount: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatAmountWithLabel: (
    value: number,
    options?: Intl.NumberFormatOptions
  ) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(
  undefined
);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(DEFAULT_CURRENCY);

  const value = useMemo<CurrencyContextValue>(() => {
    const currencyLabel = currencyLabels[currency];
    return {
      currency,
      currencyLabel,
      setCurrency,
      convertAmount: (value) => convertFromUsd(value, currency),
      formatAmount: (value, options) =>
        formatCurrencyValue(value, currency, options),
      formatAmountWithLabel: (value, options) =>
        `${formatCurrencyValue(value, currency, options)} ${currencyLabel}`,
    };
  }, [currency]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
}
