export type TimeframeOption =
  | 'full-year'
  | 'ytm'
  | 'rolling-3m'
  | 'in-month'
  | 'budget';

export interface TimeframeOptionItem {
  value: TimeframeOption;
  label: string;
}

export const TIMEFRAME_OPTIONS: TimeframeOptionItem[] = [
  { value: 'full-year', label: 'Full year forecast' },
  { value: 'ytm', label: 'Year to Month actuals' },
  { value: 'rolling-3m', label: 'Rolling 3 months' },
  { value: 'in-month', label: 'In-month' },
];

type PickerVariant = 'default' | 'compact';

interface TimeframePickerProps {
  selectedTimeframe: TimeframeOption;
  onTimeframeChange: (timeframe: TimeframeOption) => void;
  label?: string | null;
  className?: string;
  variant?: PickerVariant;
  options?: TimeframeOptionItem[];
}

export default function TimeframePicker({
  selectedTimeframe,
  onTimeframeChange,
  label = 'Timeframe',
  className = '',
  variant = 'default',
  options = TIMEFRAME_OPTIONS,
}: TimeframePickerProps) {
  const containerStyles =
    variant === 'compact'
      ? 'flex items-center gap-1 bg-gray-100/80 backdrop-blur-sm rounded-xl p-1.5 border border-gray-200/50 shadow-sm'
      : 'flex bg-gray-100 rounded-lg p-1';

  const buttonStyles = (isSelected: boolean) =>
    variant === 'compact'
      ? `px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
          isSelected
            ? 'bg-white text-gray-900 shadow-md shadow-gray-200/50 scale-105'
            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
        }`
      : `px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          isSelected
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`;

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {label && (
        <span className='text-sm font-medium text-gray-600 w-32'>{label}</span>
      )}
      <div className={containerStyles}>
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onTimeframeChange(option.value)}
            className={buttonStyles(selectedTimeframe === option.value)}>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

