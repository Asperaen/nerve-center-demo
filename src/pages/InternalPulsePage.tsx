import { useState } from 'react';
import InternalPulseCheck from '../components/InternalPulseCheck';
import RootCauseAnalysisSidebar from '../components/RootCauseAnalysisSidebar';
import type { FinancialMetric } from '../types';

export default function InternalPulsePage() {
  const [selectedInternalItems, setSelectedInternalItems] = useState<
    FinancialMetric[]
  >([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleGenerateInsights = () => {
    setSidebarOpen(true);
  };

  return (
    <div className='min-h-screen bg-gray-50 relative'>
      <div className='p-8'>
        <InternalPulseCheck
          onGenerateInsights={handleGenerateInsights}
          onSelectionChange={setSelectedInternalItems}
          selectedItems={selectedInternalItems}
        />
      </div>

      {/* Root Cause Analysis Sidebar */}
      <RootCauseAnalysisSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        selectedExternalItems={[]}
        selectedInternalItems={selectedInternalItems}
        activeTab='internal'
        hasSelectedItems={selectedInternalItems.length > 0}
      />
    </div>
  );
}
