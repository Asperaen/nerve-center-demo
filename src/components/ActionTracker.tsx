import { useState } from 'react';
import { mockActions } from '../data/mockActions';
import type { Action, ActionStatus } from '../types';
import {
  ClipboardDocumentListIcon,
  UserCircleIcon,
  XMarkIcon,
  CheckIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function ActionTracker() {
  const [actions, setActions] = useState(mockActions);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>(
    {}
  );
  const [expandedActions, setExpandedActions] = useState<Set<string>>(
    new Set()
  );

  const handleStatusChange = (actionId: string, newStatus: ActionStatus) => {
    const updatedActions = actions.map((a) =>
      a.id === actionId ? { ...a, status: newStatus } : a
    );
    setActions(updatedActions);
  };

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

  const handleAddComment = (actionId: string) => {
    const commentText = commentInputs[actionId];
    if (commentText?.trim()) {
      const updatedActions = actions.map((a) =>
        a.id === actionId
          ? {
              ...a,
              comments: [
                ...a.comments,
                {
                  id: `comment-${Date.now()}`,
                  text: commentText,
                  createdBy: 'Current User',
                  createdAt: new Date(),
                },
              ],
            }
          : a
      );
      setActions(updatedActions);
      setCommentInputs({ ...commentInputs, [actionId]: '' });
    }
  };

  const getStatusColor = (status: ActionStatus) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ready-for-review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'reopen':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: ActionStatus) => {
    switch (status) {
      case 'todo':
        return 'TODO';
      case 'in-progress':
        return 'In Progress';
      case 'ready-for-review':
        return 'Ready for Review';
      case 'completed':
        return 'Completed';
      case 'reopen':
        return 'Reopen';
      default:
        return status;
    }
  };

  const statusColumns: ActionStatus[] = [
    'todo',
    'in-progress',
    'ready-for-review',
    'completed',
    'reopen',
  ];

  const getActionsByStatus = (status: ActionStatus) => {
    return actions.filter((action) => action.status === status);
  };

  return (
    <>
      <div className='bg-white rounded-lg border border-gray-200 max-w-full overflow-hidden'>
        <div className='p-6 border-b border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-xl font-semibold text-gray-900 flex items-center'>
                <ClipboardDocumentListIcon className='w-6 h-6 mr-2 text-primary-600' />
                Action Tracker
              </h2>
              <p className='mt-1 text-sm text-gray-500'>
                JIRA-like swim lane board for tracking actions and tasks
              </p>
            </div>

            {/* Summary */}
            <div className='flex items-center space-x-4 text-sm text-gray-600'>
              <span>Total: {actions.length}</span>
            </div>
          </div>
        </div>

        {/* Swim Lane Board */}
        <div className='p-6 overflow-x-auto max-w-full'>
          <div className='flex space-x-4'>
            {statusColumns.map((status) => {
              const columnActions = getActionsByStatus(status);
              return (
                <div
                  key={status}
                  className='flex-shrink-0 w-[280px] sm:w-[300px]'>
                  {/* Column Header */}
                  <div
                    className={`mb-4 px-4 py-3 rounded-lg border-2 ${getStatusColor(
                      status
                    )}`}>
                    <div className='flex items-center justify-between'>
                      <h3 className='font-semibold text-sm'>
                        {getStatusLabel(status)}
                      </h3>
                      <span className='text-xs font-medium bg-white/50 px-2 py-0.5 rounded-full'>
                        {columnActions.length}
                      </span>
                    </div>
                  </div>

                  {/* Column Cards */}
                  <div className='space-y-3 min-h-[400px]'>
                    {columnActions.map((action) => (
                      <ActionCard
                        key={action.id}
                        action={action}
                        isExpanded={expandedActions.has(action.id)}
                        onToggleExpand={() => toggleExpanded(action.id)}
                        onStatusChange={handleStatusChange}
                        onReassign={() => {
                          setSelectedAction(action);
                          setShowReassignModal(true);
                        }}
                        onAddComment={handleAddComment}
                        commentInput={commentInputs[action.id] || ''}
                        onCommentInputChange={(value) =>
                          setCommentInputs({
                            ...commentInputs,
                            [action.id]: value,
                          })
                        }
                        getStatusColor={getStatusColor}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
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

interface ActionCardProps {
  action: Action;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onStatusChange: (actionId: string, newStatus: ActionStatus) => void;
  onReassign: () => void;
  onAddComment: (actionId: string) => void;
  commentInput: string;
  onCommentInputChange: (value: string) => void;
  getStatusColor: (status: ActionStatus) => string;
}

function ActionCard({
  action,
  isExpanded,
  onToggleExpand,
  onStatusChange,
  onReassign,
  onAddComment,
  commentInput,
  onCommentInputChange,
  getStatusColor,
}: ActionCardProps) {
  const statusOptions: ActionStatus[] = [
    'todo',
    'in-progress',
    'ready-for-review',
    'completed',
    'reopen',
  ];

  const getStatusLabel = (status: ActionStatus) => {
    switch (status) {
      case 'todo':
        return 'TODO';
      case 'in-progress':
        return 'In Progress';
      case 'ready-for-review':
        return 'Ready for Review';
      case 'completed':
        return 'Completed';
      case 'reopen':
        return 'Reopen';
      default:
        return status;
    }
  };

  return (
    <div className='bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow'>
      {/* Card Header */}
      <div className='p-4'>
        <div className='flex items-start justify-between mb-2'>
          <button
            onClick={onToggleExpand}
            className='flex-1 text-left'>
            <h4 className='text-sm font-semibold text-gray-900 hover:text-primary-600'>
              {action.title}
            </h4>
          </button>
          <select
            value={action.status}
            onChange={(e) =>
              onStatusChange(action.id, e.target.value as ActionStatus)
            }
            onClick={(e) => e.stopPropagation()}
            className={`ml-2 px-2 py-1 text-xs font-medium rounded border-0 focus:ring-2 focus:ring-primary-500 ${getStatusColor(
              action.status
            )} cursor-pointer`}>
            {statusOptions.map((status) => (
              <option
                key={status}
                value={status}>
                {getStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>

        {/* Metadata */}
        <div className='flex items-center justify-between text-xs text-gray-500 mb-2'>
          <div className='flex items-center space-x-3'>
            <div className='flex items-center'>
              <UserCircleIcon className='w-4 h-4 mr-1' />
              <span className='truncate max-w-[120px]'>{action.owner}</span>
            </div>
            <div className='flex items-center'>
              <CalendarDaysIcon className='w-4 h-4 mr-1' />
              <span>{format(action.dueDate, 'MMM d')}</span>
            </div>
          </div>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              action.priority === 'high'
                ? 'bg-red-100 text-red-800'
                : action.priority === 'medium'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
            {action.priority.toUpperCase()}
          </span>
        </div>

        {/* Quick Actions */}
        <div className='flex items-center justify-between pt-2 border-t border-gray-100'>
          <div className='flex items-center space-x-2'>
            {action.comments.length > 0 && (
              <span className='inline-flex items-center text-xs text-gray-600'>
                <ChatBubbleLeftRightIcon className='w-4 h-4 mr-1' />
                {action.comments.length}
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReassign();
            }}
            className='text-xs text-primary-600 hover:text-primary-700 font-medium'>
            Reassign
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className='px-4 pb-4 border-t border-gray-100 pt-4 space-y-4'>
          {/* Description */}
          <div>
            <p className='text-xs font-medium text-gray-700 mb-1'>
              Description:
            </p>
            <p className='text-xs text-gray-600'>{action.description}</p>
          </div>

          {/* Comments */}
          {action.comments.length > 0 && (
            <div>
              <p className='text-xs font-medium text-gray-700 mb-2'>
                Comments:
              </p>
              <div className='space-y-2'>
                {action.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className='p-2 bg-gray-50 rounded border border-gray-200'>
                    <p className='text-xs text-gray-700'>{comment.text}</p>
                    <p className='mt-1 text-xs text-gray-500'>
                      {comment.createdBy} • {format(comment.createdAt, 'PPp')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Comment */}
          <div>
            <p className='text-xs font-medium text-gray-700 mb-2'>
              Add Comment:
            </p>
            <div className='flex space-x-2'>
              <textarea
                value={commentInput}
                onChange={(e) => onCommentInputChange(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder='Add a comment...'
                className='flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none'
                rows={2}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddComment(action.id);
                }}
                disabled={!commentInput.trim()}
                className='px-3 py-1.5 text-xs bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed'>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
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
