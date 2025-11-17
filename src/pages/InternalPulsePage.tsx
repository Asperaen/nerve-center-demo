import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PlusIcon, SparklesIcon } from '@heroicons/react/24/outline';
import InternalPulseCheck from '../components/InternalPulseCheck';
import WaveExecutiveDashboard from '../components/WaveExecutiveDashboard';
import RootCauseAnalysisSidebar from '../components/RootCauseAnalysisSidebar';
import CreateActionModal from '../components/CreateActionModal';
import type { FinancialMetric } from '../types';

type ActiveTab = 'kpis' | 'wave';

export default function InternalPulsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const initialTab: ActiveTab = tabParam === 'wave' ? 'wave' : 'kpis';
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);

  // Update tab when URL param changes
  useEffect(() => {
    if (tabParam === 'wave') {
      setActiveTab('wave');
    } else if (tabParam === 'kpis' || !tabParam) {
      setActiveTab('kpis');
    }
  }, [tabParam]);
  const [selectedInternalItems, setSelectedInternalItems] = useState<
    FinancialMetric[]
  >([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateActionModalOpen, setIsCreateActionModalOpen] = useState(false);

  const handleGenerateInsights = () => {
    setSidebarOpen(true);
  };

  const totalSelectedCount = selectedInternalItems.length;

  const clearAllSelections = () => {
    setSelectedInternalItems([]);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 relative'>
      <div className='p-8 max-w-[1920px] mx-auto'>
        {/* Action Bar - appears when items are selected and KPIs tab is active */}
        {activeTab === 'kpis' && totalSelectedCount > 0 && (
          <div className='sticky top-4 z-40 mb-6 bg-white rounded-xl border-2 border-primary-500 shadow-lg p-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium text-gray-700'>
                    {totalSelectedCount} item
                    {totalSelectedCount !== 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={clearAllSelections}
                    className='text-xs text-gray-500 hover:text-gray-700 underline'>
                    Clear all
                  </button>
                </div>
                <p className='text-xs text-gray-500'>
                  💡 Drag selected items directly to calendar events on the left
                </p>
              </div>
              <div className='flex items-center gap-3'>
                <button
                  onClick={handleGenerateInsights}
                  className='flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium'>
                  <SparklesIcon className='w-5 h-5' />
                  AI Analysis
                </button>
              </div>
            </div>
          </div>
        )}

        <div className='mb-6'>
          <div className='flex items-center justify-between'>
            {/* Left: Title and Description */}
            <div className='flex flex-col'>
              <h1 className='text-3xl font-bold text-gray-900 mb-1'>
                Internal Pulse
              </h1>
              <p className='text-gray-600'>
                Track key performance indicators and internal financial metrics
              </p>
            </div>

            {/* Middle: Tab Switcher */}
            <div className='flex-1 flex justify-center'>
              <div className='inline-flex items-center gap-1 bg-gray-100/80 backdrop-blur-sm rounded-xl p-1.5 border border-gray-200/50 shadow-sm'>
                <button
                  onClick={() => {
                    setActiveTab('kpis');
                    setSearchParams({ tab: 'kpis' });
                  }}
                  className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    activeTab === 'kpis'
                      ? 'bg-white text-gray-900 shadow-md shadow-gray-200/50 scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}>
                  KPIs and operational indicators
                </button>
                <button
                  onClick={() => {
                    setActiveTab('wave');
                    setSearchParams({ tab: 'wave' });
                  }}
                  className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    activeTab === 'wave'
                      ? 'bg-white text-gray-900 shadow-md shadow-gray-200/50 scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}>
                  Wave
                </button>
              </div>
            </div>

            {/* Right: Create Action Button */}
            <button
              onClick={() => setIsCreateActionModalOpen(true)}
              className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors'>
              <PlusIcon className='w-5 h-5' />
              Create Action
            </button>
          </div>
        </div>

        {/* Conditional Content Rendering */}
        {activeTab === 'kpis' ? (
          <InternalPulseCheck
            onSelectionChange={setSelectedInternalItems}
            selectedItems={selectedInternalItems}
          />
        ) : (
          <WaveExecutiveDashboard />
        )}
      </div>

      {/* Root Cause Analysis Sidebar - Only show for KPIs tab */}
      {activeTab === 'kpis' && (
        <RootCauseAnalysisSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          selectedExternalItems={[]}
          selectedInternalItems={selectedInternalItems}
          activeTab='internal'
          hasSelectedItems={selectedInternalItems.length > 0}
        />
      )}

      {/* Create Action Modal */}
      <CreateActionModal
        isOpen={isCreateActionModalOpen}
        onClose={() => setIsCreateActionModalOpen(false)}
      />
    </div>
  );
}
