import { useMemo, useState } from 'react';
import {
  ClipboardDocumentListIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import ActionTracker from '../components/ActionTracker';
import CreateActionModal from '../components/CreateActionModal';
import { useActions } from '../contexts/ActionsContext';

export default function ActionTrackerPage() {
  const [isCreateActionModalOpen, setIsCreateActionModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'my-actions' | 'assign-to-others'>(
    'my-actions'
  );
  const { actions } = useActions();
  const highPriorityActions = useMemo(
    () => actions.filter((action) => action.priority === 'high'),
    [actions]
  );
  const urgentActions = useMemo(
    () =>
      highPriorityActions.filter(
        (action) =>
          action.status === 'todo' ||
          action.status === 'in-progress' ||
          action.status === 'reopen'
      ),
    [highPriorityActions]
  );

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

      {/* Action Items Requiring Attention */}
      <div className='mt-10'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
            <ClipboardDocumentListIcon className='w-6 h-6 text-primary-600' />
            Action Items Requiring Attention
          </h2>
        </div>
        <p className='text-gray-600 mb-4'>
          {urgentActions.length} urgent high-priority actions requiring
          immediate attention, including Vietnam production shift for EV
          connectors, securing alternative rare earth suppliers, and
          accelerating Nvidia GB300 program engagement to capture data center
          growth.
        </p>
        <div className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
            <div className='text-center p-4 bg-red-50 rounded-lg border border-red-200'>
              <div className='text-3xl font-bold text-red-600 mb-1'>
                {urgentActions.length}
              </div>
              <div className='text-sm font-medium text-red-800'>
                Urgent High-Priority Actions
              </div>
            </div>
            <div className='text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200'>
              <div className='text-3xl font-bold text-yellow-600 mb-1'>
                {highPriorityActions.length}
              </div>
              <div className='text-sm font-medium text-yellow-800'>
                Total High-Priority Actions
              </div>
            </div>
            <div className='text-center p-4 bg-blue-50 rounded-lg border border-blue-200'>
              <div className='text-3xl font-bold text-blue-600 mb-1'>
                {actions.length}
              </div>
              <div className='text-sm font-medium text-blue-800'>
                Total Actions
              </div>
            </div>
          </div>
          {urgentActions.length > 0 && (
            <div className='space-y-3'>
              <h4 className='text-sm font-semibold text-gray-700 mb-2'>
                Top Urgent Actions:
              </h4>
              {urgentActions.slice(0, 3).map((action) => (
                <div
                  key={action.id}
                  className='flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-semibold ${
                          action.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : action.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                        {action.priority.toUpperCase()}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium capitalize ${
                          action.status === 'todo'
                            ? 'bg-blue-100 text-blue-800'
                            : action.status === 'in-progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : action.status === 'reopen'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                        {action.status.replace('-', ' ')}
                      </span>
                    </div>
                    <h5 className='text-sm font-medium text-gray-900'>
                      {action.title}
                    </h5>
                    <p className='text-xs text-gray-600 mt-1'>
                      Owner: {action.owner}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Action Modal */}
      <CreateActionModal
        isOpen={isCreateActionModalOpen}
        onClose={() => setIsCreateActionModalOpen(false)}
      />
    </div>
  );
}
