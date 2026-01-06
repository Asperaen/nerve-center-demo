import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { PlusIcon, SparklesIcon } from '@heroicons/react/24/outline';
import CriticalInsights from '../components/CriticalInsights';
import RootCauseAnalysisSidebar from '../components/RootCauseAnalysisSidebar';
import CreateActionModal from '../components/CreateActionModal';
import type { NewsItem, MeetingMaterial } from '../types';

interface ExternalPulsePageContext {
  meetingMaterials: Record<string, MeetingMaterial[]>;
}

export default function ExternalPulsePage() {
  const { meetingMaterials } = useOutletContext<ExternalPulsePageContext>();
  const [selectedExternalItems, setSelectedExternalItems] = useState<
    NewsItem[]
  >([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateActionModalOpen, setIsCreateActionModalOpen] = useState(false);

  const handleGenerateInsights = () => {
    setSidebarOpen(true);
  };

  const totalSelectedCount = selectedExternalItems.length;

  const clearAllSelections = () => {
    setSelectedExternalItems([]);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 relative'>
      <div className='p-8 max-w-[1920px] mx-auto'>
        {/* Action Bar - appears when items are selected */}
        {totalSelectedCount > 0 && (
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
          <div className='flex items-center justify-between mb-2'>
            <h1 className='text-3xl font-bold text-gray-900'>External Pulse</h1>
            <button
              onClick={() => setIsCreateActionModalOpen(true)}
              className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors'>
              <PlusIcon className='w-5 h-5' />
              Create Action
            </button>
          </div>
          <p className='text-gray-600'>
            Executive insights on market trends, risks, and opportunities with quantified business impact
          </p>
        </div>
        <CriticalInsights
          onSelectionChange={setSelectedExternalItems}
          selectedItems={selectedExternalItems}
          meetingMaterials={meetingMaterials}
        />
      </div>

      {/* Root Cause Analysis Sidebar */}
      <RootCauseAnalysisSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        selectedExternalItems={selectedExternalItems}
        selectedInternalItems={[]}
        activeTab='external'
        hasSelectedItems={selectedExternalItems.length > 0}
      />

      {/* Create Action Modal */}
      <CreateActionModal
        isOpen={isCreateActionModalOpen}
        onClose={() => setIsCreateActionModalOpen(false)}
      />
    </div>
  );
}
