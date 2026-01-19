import type { TimeframeOption } from '../components/TimeframePicker';

const STORAGE_KEY = 'nerve-center:selected-timeframe';

const isValidTimeframe = (value: string | null): value is TimeframeOption =>
  value === 'full-year' ||
  value === 'ytm' ||
  value === 'rolling-3m' ||
  value === 'in-month';

export const getStoredTimeframe = (
  fallback: TimeframeOption = 'ytm'
): TimeframeOption => {
  if (typeof window === 'undefined') {
    return fallback;
  }
  const value = window.localStorage.getItem(STORAGE_KEY);
  return isValidTimeframe(value) ? value : fallback;
};

export const setStoredTimeframe = (value: TimeframeOption) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, value);
};
