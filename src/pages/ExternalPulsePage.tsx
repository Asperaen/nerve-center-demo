import { useState } from 'react';
import ExternalPulseCheck from '../components/ExternalPulseCheck';
import RootCauseAnalysisSidebar from '../components/RootCauseAnalysisSidebar';
import type { NewsItem } from '../types';

export default function ExternalPulsePage() {
  const [selectedExternalItems, setSelectedExternalItems] = useState<
    NewsItem[]
  >([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleGenerateInsights = () => {
    setSidebarOpen(true);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 relative'>
      <div className='p-8 max-w-[1920px] mx-auto'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            External Pulse
          </h1>
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
    </div>
  );
}
