import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Action, ActionPriority } from '../types';
import { useActions } from '../contexts/ActionsContext';

interface CreateActionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockOwners = [
  'Jennifer Wu - VP Operations',
  'David Park - VP Sales',
  'Dr. Lisa Zhang - CTO',
  'Jack Chen - CPO',
  'Mark Thompson - CFO',
  'Sarah Johnson - VP Quality',
];

export default function CreateActionModal({
  isOpen,
  onClose,
}: CreateActionModalProps) {
  const { addAction } = useActions();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [owner, setOwner] = useState('');
  const [priority, setPriority] = useState<ActionPriority>('medium');
  const [dueDate, setDueDate] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!title.trim() || !description.trim() || !owner || !dueDate) {
      return;
    }

    const newAction: Action = {
      id: `action-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      owner,
      status: 'todo',
      priority,
      dueDate: new Date(dueDate),
      createdDate: new Date(),
      comments: [],
    };

    addAction(newAction);

    // Reset form
    setTitle('');
    setDescription('');
    setOwner('');
    setPriority('medium');
    setDueDate('');

    onClose();
  };

  const handleClose = () => {
    // Reset form on close
    setTitle('');
    setDescription('');
    setOwner('');
    setPriority('medium');
    setDueDate('');
    onClose();
  };

  const isFormValid = title.trim() && description.trim() && owner && dueDate;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div
        className='fixed inset-0 bg-black bg-opacity-50 transition-opacity'
        onClick={handleClose}></div>

      <div className='flex items-center justify-center min-h-screen p-4'>
        <div
          className='relative bg-white rounded-lg shadow-xl w-full max-w-2xl'
          onClick={(e) => e.stopPropagation()}>
          <div className='flex items-center justify-between p-6 border-b border-gray-200'>
            <div>
              <h3 className='text-xl font-semibold text-gray-900'>
                Create New Action
              </h3>
              <p className='mt-1 text-sm text-gray-500'>
                Add a new action to the Action Tracker
              </p>
            </div>
            <button
              onClick={handleClose}
              className='p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors'>
              <XMarkIcon className='w-6 h-6' />
            </button>
          </div>

          <div className='p-6 space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Title *
              </label>
              <input
                type='text'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='Enter action title...'
                className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='Describe the action...'
                className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 resize-none'
                rows={4}
                required
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Owner *
                </label>
                <select
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500'
                  required>
                  <option value=''>Select owner...</option>
                  {mockOwners.map((ownerOption) => (
                    <option
                      key={ownerOption}
                      value={ownerOption}>
                      {ownerOption}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Priority *
                </label>
                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as ActionPriority)
                  }
                  className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500'
                  required>
                  <option value='high'>High</option>
                  <option value='medium'>Medium</option>
                  <option value='low'>Low</option>
                </select>
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Due Date *
              </label>
              <input
                type='date'
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500'
                required
              />
            </div>
          </div>

          <div className='flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50'>
            <button
              onClick={handleClose}
              className='px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'>
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isFormValid}
              className='px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'>
              Create Action
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
