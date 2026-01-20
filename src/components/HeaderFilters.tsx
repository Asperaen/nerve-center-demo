import type { ReactNode } from 'react';

type BuOption = { id: string; name: string };

interface HeaderFiltersProps {
  timeframeContent: ReactNode;
  buOptions?: BuOption[];
  selectedBu?: string;
  onBuChange?: (buId: string) => void;
  showBu?: boolean;
}

export default function HeaderFilters({
  timeframeContent,
  buOptions = [],
  selectedBu = 'all',
  onBuChange,
  showBu = true,
}: HeaderFiltersProps) {
  return (
    <div className='space-y-4'>
      <div>{timeframeContent}</div>
      {showBu && (
        <div className='flex items-center gap-4'>
          <span className='text-sm font-medium text-gray-600 w-32'>
            Select BU
          </span>
          <div className='flex bg-gray-100 rounded-lg p-1'>
            <button
              onClick={() => onBuChange?.('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedBu === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}>
              All BUs
            </button>
            {buOptions.map((bu) => (
              <button
                key={bu.id}
                onClick={() => onBuChange?.(bu.id)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedBu === bu.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}>
                {bu.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
