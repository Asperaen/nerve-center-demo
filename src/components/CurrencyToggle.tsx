import { useCurrency } from '../contexts/CurrencyContext';

export default function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className='inline-flex items-center rounded-lg border border-gray-200 bg-white/95 shadow-sm backdrop-blur-sm p-1'>
      {(['USD', 'NTD'] as const).map((option) => (
        <button
          key={option}
          onClick={() => setCurrency(option)}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
            currency === option
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}>
          {option}
        </button>
      ))}
    </div>
  );
}
