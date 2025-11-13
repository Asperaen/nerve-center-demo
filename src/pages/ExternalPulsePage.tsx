import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import ExternalPulseCheck from '../components/ExternalPulseCheck';
import RootCauseAnalysisSidebar from '../components/RootCauseAnalysisSidebar';
import CreateActionModal from '../components/CreateActionModal';
import type { NewsItem } from '../types';

export default function ExternalPulsePage() {
  const [selectedExternalItems, setSelectedExternalItems] = useState<
    NewsItem[]
  >([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateActionModalOpen, setIsCreateActionModalOpen] = useState(false);

  const handleGenerateInsights = () => {
    setSidebarOpen(true);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 relative'>
      <div className='p-8 max-w-[1920px] mx-auto'>
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
            Monitor market trends, news, and external factors affecting your
            business
          </p>
        </div>
        <ExternalPulseCheck
          onGenerateInsights={handleGenerateInsights}
          onSelectionChange={setSelectedExternalItems}
          selectedItems={selectedExternalItems}
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
