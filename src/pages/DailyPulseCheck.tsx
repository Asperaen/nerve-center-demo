import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ExternalPulseCheck from '../components/ExternalPulseCheck';
import InternalPulseCheck from '../components/InternalPulseCheck';
import ActionTracker from '../components/ActionTracker';
import RootCauseAnalysisSidebar from '../components/RootCauseAnalysisSidebar';
import type { NewsItem } from '../types';
import type { FinancialMetric } from '../types';

export default function DailyPulseCheck() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from URL
  let activeTab: 'external' | 'internal' | 'actions' = 'external';
  if (location.pathname.includes('/internal')) {
    activeTab = 'internal';
  } else if (location.pathname.includes('/actions')) {
    activeTab = 'actions';
  }

  const [selectedExternalItems, setSelectedExternalItems] = useState<
    NewsItem[]
  >([]);
  const [selectedInternalItems, setSelectedInternalItems] = useState<
    FinancialMetric[]
  >([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect to default tab if on base route
  useEffect(() => {
    if (location.pathname === '/daily-pulse-check') {
      navigate('/daily-pulse-check/external', { replace: true });
    }
  }, [location.pathname, navigate]);

  const hasSelectedItems =
    selectedExternalItems.length > 0 || selectedInternalItems.length > 0;

  const handleGenerateInsights = () => {
    setSidebarOpen(true);
  };

  return (
    <div className='min-h-screen bg-gray-50 relative'>
      {/* Main Content */}
      <div>
        {/* Content */}
        <div className='p-8'>
          {activeTab === 'external' && (
            <ExternalPulseCheck
              onGenerateInsights={handleGenerateInsights}
              onSelectionChange={setSelectedExternalItems}
              selectedItems={selectedExternalItems}
            />
          )}
          {activeTab === 'internal' && (
            <InternalPulseCheck
              onGenerateInsights={handleGenerateInsights}
              onSelectionChange={setSelectedInternalItems}
              selectedItems={selectedInternalItems}
            />
          )}
          {activeTab === 'actions' && <ActionTracker />}
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
    </div>
  );
}
