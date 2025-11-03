import { useState } from 'react';
import ExternalPulseCheck from '../components/ExternalPulseCheck';
import InternalPulseCheck from '../components/InternalPulseCheck';
import RootCauseAnalysisSidebar from '../components/RootCauseAnalysisSidebar';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import type { NewsItem } from '../types';
import type { FinancialMetric } from '../types';

export default function DailyPulseCheck() {
  const [activeTab, setActiveTab] = useState<'external' | 'internal'>(
    'external'
  );
  const [showToast, setShowToast] = useState(false);
  const [selectedExternalItems, setSelectedExternalItems] = useState<
    NewsItem[]
  >([]);
  const [selectedInternalItems, setSelectedInternalItems] = useState<
    FinancialMetric[]
  >([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const hasSelectedItems =
    selectedExternalItems.length > 0 || selectedInternalItems.length > 0;

  const handleScheduleMeeting = () => {
    setShowToast(true);
    // Auto-hide toast after 3 seconds
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className='min-h-screen bg-gray-50 relative'>
      {/* Main Content */}
      <div>
        {/* Header */}
        <div className='bg-white border-b border-gray-200'>
          <div className='px-8 py-6'>
            <h1 className='text-3xl font-bold text-gray-900'>
              Daily Pulse Check
            </h1>
            <p className='mt-1 text-sm text-gray-500'>
              Monitor external market dynamics and internal performance metrics
              with quantitative insights
            </p>
          </div>

          {/* Tabs - Business Facts Book */}
          <div className='px-8'>
            <div className='mb-2'>
              <p className='text-xs font-semibold text-gray-600 uppercase tracking-wide'>
                Business Facts Book
              </p>
            </div>
            <nav
              className='flex space-x-8'
              aria-label='Tabs'>
              <button
                onClick={() => setActiveTab('external')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'external'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}>
                A.2 External Pulse Check
              </button>
              <button
                onClick={() => setActiveTab('internal')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'internal'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}>
                A.1 Internal Pulse Check
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className='p-8'>
          {activeTab === 'external' && (
            <ExternalPulseCheck
              onScheduleMeeting={handleScheduleMeeting}
              onSelectionChange={setSelectedExternalItems}
              selectedItems={selectedExternalItems}
            />
          )}
          {activeTab === 'internal' && (
            <InternalPulseCheck
              onSelectionChange={setSelectedInternalItems}
              selectedItems={selectedInternalItems}
            />
          )}
        </div>
      </div>

      {/* Root Cause Analysis Sidebar */}
      <RootCauseAnalysisSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        selectedExternalItems={selectedExternalItems}
        selectedInternalItems={selectedInternalItems}
        activeTab={activeTab}
        hasSelectedItems={hasSelectedItems}
      />

      {/* Toast Notification */}
      {showToast && (
        <div className='fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom-2'>
          <div className='flex items-center'>
            <CalendarDaysIcon className='w-5 h-5 mr-2' />
            <span>
              Your meeting request is sent to your assistant, will get back to
              you ASAP
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
