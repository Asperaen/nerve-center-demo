import { useState } from 'react';
import { mockActions } from '../data/mockActions';
import type { Action, ActionStatus } from '../types';
import {
  ClipboardDocumentListIcon,
  UserCircleIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function ActionTracker() {
  const [actions, setActions] = useState(mockActions);
  const [filter, setFilter] = useState<'all' | 'pending' | 'overdue'>('all');
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [decisionInput, setDecisionInput] = useState('');
  const [expandedActions, setExpandedActions] = useState<Set<string>>(
    new Set()
  );

  const filteredActions = actions.filter((action) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return action.status === 'pending';
    if (filter === 'overdue') return action.status === 'overdue';
    return true;
  });

  const toggleExpanded = (actionId: string) => {
    const newExpanded = new Set(expandedActions);
    if (newExpanded.has(actionId)) {
      newExpanded.delete(actionId);
    } else {
      newExpanded.add(actionId);
    }
    setExpandedActions(newExpanded);
  };

  const handleReassign = (newOwner: string) => {
    if (selectedAction) {
      const updatedActions = actions.map((a) =>
        a.id === selectedAction.id ? { ...a, owner: newOwner } : a
      );
      setActions(updatedActions);
      setShowReassignModal(false);
      setSelectedAction(null);
      alert(
        `Action reassigned to ${newOwner}. Notifications sent to both parties.`
      );
    }
  };

  const handleSubmitDecision = (actionId: string) => {
    if (decisionInput.trim()) {
      const updatedActions = actions.map((a) =>
        a.id === actionId
          ? {
              ...a,
              decisions: [
                ...a.decisions,
                {
                  id: `dec-${Date.now()}`,
                  text: decisionInput,
                  createdBy: 'CEO',
                  createdAt: new Date(),
                },
              ],
            }
          : a
      );
      setActions(updatedActions);
      setDecisionInput('');
      alert('Decision guidance added successfully!');
    }
  };

  return (
    <>
      <div className='bg-white rounded-lg border border-gray-200'>
        <div className='p-6 border-b border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-xl font-semibold text-gray-900 flex items-center'>
                <ClipboardDocumentListIcon className='w-6 h-6 mr-2 text-primary-600' />
                Action Tracker
              </h2>
              <p className='mt-1 text-sm text-gray-500'>
                Track key actions, assign owners, and provide real-time guidance
              </p>
            </div>

            {/* Filters */}
            <div className='flex space-x-2'>
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filter === 'all'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                All ({actions.length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filter === 'pending'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                Pending ({actions.filter((a) => a.status === 'pending').length})
              </button>
              <button
                onClick={() => setFilter('overdue')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filter === 'overdue'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                Overdue ({actions.filter((a) => a.status === 'overdue').length})
              </button>
            </div>
          </div>
        </div>

        {/* Actions Table */}
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Action
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Owner
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Priority
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Due Date
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {filteredActions.map((action) => (
                <>
                  <tr
                    key={action.id}
                    className='hover:bg-gray-50'>
                    <td className='px-6 py-4'>
                      <div>
                        <button
                          onClick={() => toggleExpanded(action.id)}
                          className='text-sm font-medium text-gray-900 hover:text-primary-600 text-left'>
                          {action.title}
                        </button>
                        {action.decisions.length > 0 && (
                          <span className='ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800'>
                            {action.decisions.length} decision
                            {action.decisions.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center'>
                        <UserCircleIcon className='w-5 h-5 text-gray-400 mr-2' />
                        <span className='text-sm text-gray-700'>
                          {action.owner}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          action.status === 'completed'
                            ? 'bg-opportunity-100 text-opportunity-800'
                            : action.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800'
                            : action.status === 'overdue'
                            ? 'bg-risk-100 text-risk-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                        {action.status.toUpperCase().replace('-', ' ')}
                      </span>
                    </td>
                    <td className='px-6 py-4'>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          action.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : action.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                        {action.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-700'>
                      {format(action.dueDate, 'MMM d, yyyy')}
                    </td>
                    <td className='px-6 py-4'>
                      <button
                        onClick={() => {
                          setSelectedAction(action);
                          setShowReassignModal(true);
                        }}
                        className='text-sm text-primary-600 hover:text-primary-700 font-medium'>
                        Reassign
                      </button>
                    </td>
                  </tr>
                  {expandedActions.has(action.id) && (
                    <tr>
                      <td
                        colSpan={6}
                        className='px-6 py-4 bg-gray-50'>
                        <div className='space-y-4'>
                          {/* Description */}
                          <div>
                            <p className='text-sm font-medium text-gray-700 mb-1'>
                              Description:
                            </p>
                            <p className='text-sm text-gray-600'>
                              {action.description}
                            </p>
                          </div>

                          {/* Previous Decisions */}
                          {action.decisions.length > 0 && (
                            <div>
                              <p className='text-sm font-medium text-gray-700 mb-2'>
                                CEO Decisions & Guidance:
                              </p>
                              <div className='space-y-2'>
                                {action.decisions.map((decision) => (
                                  <div
                                    key={decision.id}
                                    className='p-3 bg-blue-50 rounded-lg border border-blue-100'>
                                    <p className='text-sm text-gray-700'>
                                      {decision.text}
                                    </p>
                                    <p className='mt-1 text-xs text-gray-500'>
                                      {decision.createdBy} •{' '}
                                      {format(decision.createdAt, 'PPp')}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Add Decision */}
                          <div>
                            <p className='text-sm font-medium text-gray-700 mb-2'>
                              Add Decision / Guidance:
                            </p>
                            <div className='flex space-x-2'>
                              <textarea
                                value={decisionInput}
                                onChange={(e) =>
                                  setDecisionInput(e.target.value)
                                }
                                placeholder='Provide guidance or decision...'
                                className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none'
                                rows={2}
                              />
                              <button
                                onClick={() => handleSubmitDecision(action.id)}
                                disabled={!decisionInput.trim()}
                                className='px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed'>
                                Submit
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reassign Owner Modal */}
      {showReassignModal && selectedAction && (
        <ReassignOwnerModal
          action={selectedAction}
          onClose={() => {
            setShowReassignModal(false);
            setSelectedAction(null);
          }}
          onReassign={handleReassign}
        />
      )}
    </>
  );
}

interface ReassignOwnerModalProps {
  action: Action;
  onClose: () => void;
  onReassign: (newOwner: string) => void;
}

function ReassignOwnerModal({
  action,
  onClose,
  onReassign,
}: ReassignOwnerModalProps) {
  const [selectedOwner, setSelectedOwner] = useState('');
  const [reason, setReason] = useState('');

  const mockOwners = [
    'Jennifer Wu - VP Operations',
    'David Park - VP Sales',
    'Dr. Lisa Zhang - CTO',
    'Michael Chen - CPO',
    'Mark Thompson - CFO',
    'Sarah Johnson - VP Quality',
  ];

  const handleSubmit = () => {
    if (selectedOwner) {
      onReassign(selectedOwner);
    }
  };

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0'>
        <div
          className='fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75'
          onClick={onClose}></div>

        <div className='inline-block w-full max-w-lg my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg'>
          {/* Header */}
          <div className='px-6 py-4 border-b border-gray-200 flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Reassign Action Owner
            </h3>
            <button
              onClick={onClose}
              className='p-2 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-100'>
              <XMarkIcon className='w-5 h-5' />
            </button>
          </div>

          {/* Content */}
          <div className='px-6 py-4 space-y-4'>
            <div>
              <p className='text-sm font-medium text-gray-700 mb-1'>Action:</p>
              <p className='text-sm text-gray-600'>{action.title}</p>
            </div>

            <div>
              <p className='text-sm font-medium text-gray-700 mb-1'>
                Current Owner:
              </p>
              <p className='text-sm text-gray-600'>{action.owner}</p>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                New Owner:
              </label>
              <select
                value={selectedOwner}
                onChange={(e) => setSelectedOwner(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'>
                <option value=''>Select new owner...</option>
                {mockOwners
                  .filter((owner) => owner !== action.owner)
                  .map((owner) => (
                    <option
                      key={owner}
                      value={owner}>
                      {owner}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Reason for Reassignment (optional):
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder='Explain why this action is being reassigned...'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none'
                rows={3}
              />
            </div>
          </div>

          {/* Footer */}
          <div className='px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3'>
            <button
              onClick={onClose}
              className='px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800'>
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedOwner}
              className='px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center'>
              <CheckIcon className='w-4 h-4 mr-2' />
              Reassign Owner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
