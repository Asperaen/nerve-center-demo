import { useState } from 'react';
import { mockConflicts } from '../data/mockAssumptions';
import type { Conflict, ConflictType, ConflictSeverity } from '../types';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function ConflictAlertsPanel() {
  const [conflicts, setConflicts] = useState(mockConflicts);
  const [selectedSeverity, setSelectedSeverity] = useState<
    ConflictSeverity | 'all'
  >('all');
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(
    null
  );
  const [resolution, setResolution] = useState('');

  const filteredConflicts =
    selectedSeverity === 'all'
      ? conflicts
      : conflicts.filter((c) => c.severity === selectedSeverity);

  const handleResolve = (conflictId: string) => {
    const updatedConflicts = conflicts.map((c) =>
      c.id === conflictId ? { ...c, status: 'resolved' as const } : c
    );
    setConflicts(updatedConflicts);
    setSelectedConflict(null);
    setResolution('');
    alert('Conflict resolved successfully! Stakeholders have been notified.');
  };

  const handleDismiss = (conflictId: string) => {
    const updatedConflicts = conflicts.map((c) =>
      c.id === conflictId ? { ...c, status: 'dismissed' as const } : c
    );
    setConflicts(updatedConflicts);
    setSelectedConflict(null);
    alert('Conflict dismissed.');
  };

  const getSeverityBadge = (severity: ConflictSeverity) => {
    const styles = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[severity]}`}>
        {severity.toUpperCase()}
      </span>
    );
  };

  const getTypeBadge = (type: ConflictType) => {
    const labels = {
      obvious_error: 'Obvious Error',
      inconsistent_insight: 'Inconsistent Data',
      duplication: 'Duplication',
    };

    return (
      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
        {labels[type]}
      </span>
    );
  };

  return (
    <>
      <div className='space-y-6'>
        {/* Severity Filter */}
        <div className='bg-white rounded-lg border border-gray-200 p-4'>
          <div className='flex items-center space-x-2'>
            <button
              onClick={() => setSelectedSeverity('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedSeverity === 'all'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              All Conflicts ({conflicts.length})
            </button>
            <button
              onClick={() => setSelectedSeverity('critical')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedSeverity === 'critical'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              Critical (
              {conflicts.filter((c) => c.severity === 'critical').length})
            </button>
            <button
              onClick={() => setSelectedSeverity('high')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedSeverity === 'high'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              High ({conflicts.filter((c) => c.severity === 'high').length})
            </button>
            <button
              onClick={() => setSelectedSeverity('medium')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedSeverity === 'medium'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              Medium ({conflicts.filter((c) => c.severity === 'medium').length})
            </button>
          </div>
        </div>

        {/* Conflict Cards */}
        <div className='space-y-4'>
          {filteredConflicts.map((conflict) => (
            <div
              key={conflict.id}
              className={`bg-white rounded-lg border-2 p-6 ${
                conflict.severity === 'critical'
                  ? 'border-red-200'
                  : conflict.severity === 'high'
                  ? 'border-orange-200'
                  : 'border-gray-200'
              }`}>
              <div className='flex items-start space-x-4'>
                <div
                  className={`flex-shrink-0 p-2 rounded-full ${
                    conflict.severity === 'critical' ||
                    conflict.severity === 'high'
                      ? 'bg-red-100'
                      : 'bg-yellow-100'
                  }`}>
                  <ExclamationTriangleIcon
                    className={`w-6 h-6 ${
                      conflict.severity === 'critical' ||
                      conflict.severity === 'high'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                    }`}
                  />
                </div>

                <div className='flex-1 min-w-0'>
                  <div className='flex items-center space-x-2 mb-2'>
                    {getSeverityBadge(conflict.severity)}
                    {getTypeBadge(conflict.type)}
                    {conflict.status !== 'open' && (
                      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize'>
                        {conflict.status}
                      </span>
                    )}
                  </div>

                  <h3 className='text-base font-semibold text-gray-900 mb-2'>
                    {conflict.description}
                  </h3>

                  <div className='space-y-2 text-sm text-gray-600'>
                    <div>
                      <span className='font-medium'>Affected Assumptions:</span>{' '}
                      {conflict.affectedAssumptions.join(', ')}
                    </div>

                    <div className='p-3 bg-blue-50 rounded-lg border border-blue-100'>
                      <span className='font-medium text-blue-900'>
                        Suggested Resolution:
                      </span>
                      <p className='mt-1 text-blue-700'>
                        {conflict.suggestedResolution}
                      </p>
                    </div>

                    <div>
                      <span className='font-medium'>
                        Stakeholders to notify:
                      </span>{' '}
                      {conflict.stakeholders.join(', ')}
                    </div>
                  </div>

                  {conflict.status === 'open' && (
                    <div className='mt-4 flex items-center space-x-3'>
                      <button
                        onClick={() => setSelectedConflict(conflict)}
                        className='px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700'>
                        Resolve Conflict
                      </button>
                      <button
                        onClick={() => handleDismiss(conflict.id)}
                        className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200'>
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredConflicts.length === 0 && (
          <div className='bg-white rounded-lg border border-gray-200 p-12 text-center'>
            <CheckCircleIcon className='w-16 h-16 text-opportunity-500 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              No Conflicts Found
            </h3>
            <p className='text-sm text-gray-500'>
              All business assumptions are consistent and validated.
            </p>
          </div>
        )}
      </div>

      {/* Resolution Modal */}
      {selectedConflict && (
        <ConflictResolutionModal
          conflict={selectedConflict}
          resolution={resolution}
          onResolutionChange={setResolution}
          onResolve={() => handleResolve(selectedConflict.id)}
          onClose={() => {
            setSelectedConflict(null);
            setResolution('');
          }}
        />
      )}
    </>
  );
}

interface ConflictResolutionModalProps {
  conflict: Conflict;
  resolution: string;
  onResolutionChange: (value: string) => void;
  onResolve: () => void;
  onClose: () => void;
}

function ConflictResolutionModal({
  conflict,
  resolution,
  onResolutionChange,
  onResolve,
  onClose,
}: ConflictResolutionModalProps) {
  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0'>
        <div
          className='fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75'
          onClick={onClose}></div>

        <div className='inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg'>
          {/* Header */}
          <div className='px-6 py-4 border-b border-gray-200 flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Resolve Conflict
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
              <p className='text-sm font-medium text-gray-700 mb-1'>
                Conflict Description:
              </p>
              <p className='text-sm text-gray-600'>{conflict.description}</p>
            </div>

            <div className='p-4 bg-blue-50 rounded-lg border border-blue-100'>
              <p className='text-sm font-medium text-blue-900 mb-1'>
                Suggested Resolution:
              </p>
              <p className='text-sm text-blue-700'>
                {conflict.suggestedResolution}
              </p>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Resolution Details:
              </label>
              <textarea
                value={resolution}
                onChange={(e) => onResolutionChange(e.target.value)}
                placeholder='Describe how this conflict was resolved or provide corrected values...'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none'
                rows={4}
              />
            </div>

            <div>
              <p className='text-sm font-medium text-gray-700 mb-2'>
                Stakeholders to Notify:
              </p>
              <div className='flex flex-wrap gap-2'>
                {conflict.stakeholders.map((stakeholder, index) => (
                  <span
                    key={index}
                    className='inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700'>
                    {stakeholder}
                  </span>
                ))}
              </div>
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
              onClick={onResolve}
              className='px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 flex items-center'>
              <CheckCircleIcon className='w-4 h-4 mr-2' />
              Resolve & Notify
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
