import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import ActionTracker from '../components/ActionTracker';
import CreateActionModal from '../components/CreateActionModal';
import { useActions } from '../contexts/ActionsContext';

export default function ActionTrackerPage() {
  const [isCreateActionModalOpen, setIsCreateActionModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'my-actions' | 'assign-to-others'>(
    'my-actions'
  );
  const { actions } = useActions();

  return (
    <div className='p-8'>
      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Action Tracker</h1>
            <p className='mt-2 text-sm text-gray-600'>
              Manage and track your team's actions and initiatives • Total:{' '}
              {actions.length}
            </p>
          </div>

          {/* Tab Switch */}
          <div className='flex items-center gap-1 bg-gray-100/80 backdrop-blur-sm rounded-xl p-1.5 border border-gray-200/50 shadow-sm'>
            <button
              onClick={() => setActiveTab('my-actions')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'my-actions'
                  ? 'bg-white text-gray-900 shadow-md shadow-gray-200/50 scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}>
              My Actions
            </button>
            <button
              onClick={() => setActiveTab('assign-to-others')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'assign-to-others'
                  ? 'bg-white text-gray-900 shadow-md shadow-gray-200/50 scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}>
              Assign to others
            </button>
          </div>

          <button
            onClick={() => setIsCreateActionModalOpen(true)}
            className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors'>
            <PlusIcon className='w-5 h-5' />
            Create Action
          </button>
        </div>
      </div>

      {/* Action Tracker Content */}
      <div className='w-full'>
        <ActionTracker activeTab={activeTab} />
      </div>

      {/* Create Action Modal */}
      <CreateActionModal
        isOpen={isCreateActionModalOpen}
        onClose={() => setIsCreateActionModalOpen(false)}
      />
    </div>
  );
}
