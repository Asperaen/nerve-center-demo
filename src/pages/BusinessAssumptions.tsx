import { useState } from 'react';
import AssumptionsTable from '../components/AssumptionsTable';
import ConflictAlertsPanel from '../components/ConflictAlertsPanel';
import { mockConflicts } from '../data/mockAssumptions';

export default function BusinessAssumptions() {
  const [activeTab, setActiveTab] = useState<'assumptions' | 'conflicts'>(
    'assumptions'
  );
  const openConflicts = mockConflicts.filter((c) => c.status === 'open');

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200'>
        <div className='px-8 py-6'>
          <h1 className='text-3xl font-bold text-gray-900'>
            Business Assumptions
          </h1>
          <p className='mt-1 text-sm text-gray-500'>
            Review, approve, and manage key business assumptions driving your
            forecast
          </p>
        </div>

        {/* Tabs */}
        <div className='px-8'>
          <nav
            className='flex space-x-8'
            aria-label='Tabs'>
            <button
              onClick={() => setActiveTab('assumptions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'assumptions'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}>
              Assumptions Management
            </button>
            <button
              onClick={() => setActiveTab('conflicts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                activeTab === 'conflicts'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}>
              Conflict Resolution
              {openConflicts.length > 0 && (
                <span className='ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'>
                  {openConflicts.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className='p-8'>
        {activeTab === 'assumptions' && <AssumptionsTable />}
        {activeTab === 'conflicts' && <ConflictAlertsPanel />}
      </div>
    </div>
  );
}
