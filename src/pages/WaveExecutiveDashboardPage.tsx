import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import WaveExecutiveDashboard from '../components/WaveExecutiveDashboard';
import CreateActionModal from '../components/CreateActionModal';

export default function WaveExecutiveDashboardPage() {
  const [isCreateActionModalOpen, setIsCreateActionModalOpen] = useState(false);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 relative'>
      <div className='p-8 max-w-[1920px] mx-auto'>
        <div className='mb-6'>
          <div className='flex items-center justify-between mb-2'>
            <h1 className='text-3xl font-bold text-gray-900'>Wave Dashboard</h1>
            <button
              onClick={() => setIsCreateActionModalOpen(true)}
              className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors'>
              <PlusIcon className='w-5 h-5' />
              Create Action
            </button>
          </div>
          <p className='text-gray-600'>
            Review of top initiatives for each workflow and value delivery
            tracking
          </p>
        </div>
        <WaveExecutiveDashboard />

        {/* Create Action Modal */}
        <CreateActionModal
          isOpen={isCreateActionModalOpen}
          onClose={() => setIsCreateActionModalOpen(false)}
        />
      </div>
    </div>
  );
}
