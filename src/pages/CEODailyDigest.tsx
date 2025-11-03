import { useState } from 'react';
import ExternalPulseCheck from '../components/ExternalPulseCheck';
import InternalPulseCheck from '../components/InternalPulseCheck';
import RootCauseAnalysis from '../components/RootCauseAnalysis';
import ActionTracker from '../components/ActionTracker';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

export default function CEODailyDigest() {
  const [activeTab, setActiveTab] = useState<
    'external' | 'internal' | 'analysis' | 'actions'
  >('external');
  const [showToast, setShowToast] = useState(false);

  const handleScheduleMeeting = () => {
    setShowToast(true);
    // Auto-hide toast after 3 seconds
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200'>
        <div className='px-8 py-6'>
          <h1 className='text-3xl font-bold text-gray-900'>CEO Daily Digest</h1>
          <p className='mt-1 text-sm text-gray-500'>
            Comprehensive view of external market dynamics, internal
            performance, and key actions
          </p>
        </div>

        {/* Tabs */}
        <div className='px-8'>
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
              External Pulse Check
            </button>
            <button
              onClick={() => setActiveTab('internal')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'internal'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}>
              Internal Pulse Check
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'analysis'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}>
              Root Cause Analysis
            </button>
            <button
              onClick={() => setActiveTab('actions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'actions'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}>
              Action Tracker
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className='p-8'>
        {activeTab === 'external' && (
          <ExternalPulseCheck onScheduleMeeting={handleScheduleMeeting} />
        )}
        {activeTab === 'internal' && <InternalPulseCheck />}
        {activeTab === 'analysis' && <RootCauseAnalysis />}
        {activeTab === 'actions' && <ActionTracker />}
      </div>

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
