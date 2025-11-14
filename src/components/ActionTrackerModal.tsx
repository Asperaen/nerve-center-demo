import { useEffect, useState } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import ActionTracker from './ActionTracker';
import CreateActionModal from './CreateActionModal';
import { useActions } from '../contexts/ActionsContext';

interface ActionTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ActionTrackerModal({
  isOpen,
  onClose,
}: ActionTrackerModalProps) {
  const [isCreateActionModalOpen, setIsCreateActionModalOpen] = useState(false);
  const { actions } = useActions();

  // Handle Escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300'
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className='flex items-center justify-center min-h-screen p-4'>
        <div
          className='relative bg-white rounded-xl shadow-2xl w-full max-w-[95vw] max-h-[95vh] flex flex-col overflow-hidden transform transition-all duration-300 scale-100 opacity-100'
          onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className='flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50/50 flex-shrink-0'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900'>
                Action Tracker
              </h2>
              <p className='mt-1 text-sm text-gray-600'>
                Manage and track your team's actions and initiatives • Total:{' '}
                {actions.length}
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <button
                onClick={() => setIsCreateActionModalOpen(true)}
                className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors'>
                <PlusIcon className='w-5 h-5' />
                Create Action
              </button>
              <button
                onClick={onClose}
                className='p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors'>
                <XMarkIcon className='w-6 h-6' />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className='flex-1 overflow-y-auto p-8'>
            <ActionTracker />
          </div>
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
