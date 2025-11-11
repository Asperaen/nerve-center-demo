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
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 relative'>
      <div className='p-8 max-w-[1920px] mx-auto'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Internal Pulse
          </h1>
          <p className='text-gray-600'>
            Track key performance indicators and internal financial metrics
          </p>
        </div>
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
