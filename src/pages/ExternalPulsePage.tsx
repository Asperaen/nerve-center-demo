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
    <div className='min-h-screen bg-gray-50 relative'>
      <div className='p-8'>
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
