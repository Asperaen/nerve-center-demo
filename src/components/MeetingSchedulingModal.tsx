import { useState, useEffect } from 'react';
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import type {
  Meeting,
  MeetingAttendee,
  MeetingMaterial,
  MeetingType,
} from '../types';
import type { SelectedItem, RelevantMeeting } from '../utils/meetingRelevance';
import { generateMeetingTitle } from '../utils/meetingRelevance';

interface MeetingSchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: SelectedItem[];
  relevantMeetings: RelevantMeeting[];
  onScheduleNewMeeting: (meeting: Omit<Meeting, 'id'>) => void;
  onAddToMeetings: (meetingIds: string[], materials: MeetingMaterial[]) => void;
}

export default function MeetingSchedulingModal({
  isOpen,
  onClose,
  selectedItems,
  relevantMeetings,
  onScheduleNewMeeting,
  onAddToMeetings,
}: MeetingSchedulingModalProps) {
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [selectedMeetingIds, setSelectedMeetingIds] = useState<Set<string>>(
    new Set()
  );
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingStartTime, setMeetingStartTime] = useState('09:00');
  const [meetingEndTime, setMeetingEndTime] = useState('10:00');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [meetingDescription, setMeetingDescription] = useState('');
  const [meetingType, setMeetingType] = useState<MeetingType>('general');
  const [attendees] = useState<MeetingAttendee[]>([
    {
      name: 'CEO',
      email: 'ceo@company.com',
      role: 'Organizer',
      isRequired: true,
    },
  ]);

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      const title = generateMeetingTitle(selectedItems);
      setMeetingTitle(title);

      // Set default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setMeetingDate(format(tomorrow, 'yyyy-MM-dd'));

      // Set mode based on relevant meetings
      if (relevantMeetings.length > 0) {
        setMode('existing');
        // Pre-select all relevant meetings
        setSelectedMeetingIds(
          new Set(relevantMeetings.map((rm) => rm.meeting.id))
        );
      } else {
        setMode('new');
      }

      // Generate description from selected items
      const itemDescriptions = selectedItems.map((item) => {
        if (item.type === 'news') {
          const news = item.data as any;
          return `- ${news.title}: ${news.summary}`;
        }
        return `- ${item.name}`;
      });
      setMeetingDescription(`Discussion on:\n${itemDescriptions.join('\n')}`);
    }
  }, [isOpen, selectedItems, relevantMeetings]);

  if (!isOpen) return null;

  // Generate meeting materials from selected items
  const generateMaterials = (): MeetingMaterial[] => {
    return selectedItems.map((item, index) => {
      const materialType =
        item.type === 'news' ? 'external-pulse' : 'internal-pulse';
      return {
        id: `material-${Date.now()}-${index}`,
        type: materialType,
        itemId: item.id,
        addedAt: new Date(),
      };
    });
  };

  const handleToggleMeeting = (meetingId: string) => {
    setSelectedMeetingIds((prev) => {
      const next = new Set(prev);
      if (next.has(meetingId)) {
        next.delete(meetingId);
      } else {
        next.add(meetingId);
      }
      return next;
    });
  };

  const handleScheduleNew = () => {
    if (!meetingDate || !meetingTitle.trim()) {
      alert('Please fill in meeting title and date');
      return;
    }

    const startDateTime = new Date(`${meetingDate}T${meetingStartTime}`);
    const endDateTime = new Date(`${meetingDate}T${meetingEndTime}`);

    if (endDateTime <= startDateTime) {
      alert('End time must be after start time');
      return;
    }

    const newMeeting: Omit<Meeting, 'id'> = {
      title: meetingTitle,
      startTime: startDateTime,
      endTime: endDateTime,
      location: meetingLocation || undefined,
      organizer: 'CEO',
      attendees,
      description: meetingDescription || undefined,
      meetingType,
      materials: generateMaterials(),
      isCritical: false,
    };

    onScheduleNewMeeting(newMeeting);
    onClose();
  };

  const handleAddToExisting = () => {
    if (selectedMeetingIds.size === 0) {
      alert('Please select at least one meeting');
      return;
    }

    const materials = generateMaterials();
    onAddToMeetings(Array.from(selectedMeetingIds), materials);
    onClose();
  };

  const totalSelected = selectedItems.length;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div
        className='fixed inset-0 bg-black bg-opacity-50 transition-opacity'
        onClick={onClose}
      />

      <div className='flex items-center justify-center min-h-screen p-4'>
        <div className='relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col'>
          {/* Header */}
          <div className='flex items-center justify-between p-6 border-b border-gray-200'>
            <div>
              <h3 className='text-xl font-semibold text-gray-900'>
                Schedule Meeting
              </h3>
              <p className='mt-1 text-sm text-gray-500'>
                {totalSelected} item{totalSelected !== 1 ? 's' : ''} selected
              </p>
            </div>
            <button
              onClick={onClose}
              className='p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors'>
              <XMarkIcon className='w-6 h-6' />
            </button>
          </div>

          {/* Content */}
          <div className='flex-1 p-6 overflow-y-auto'>
            {/* Mode Selection */}
            {relevantMeetings.length > 0 && (
              <div className='mb-6'>
                <div className='flex gap-4 mb-4'>
                  <button
                    onClick={() => setMode('existing')}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                      mode === 'existing'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}>
                    <div className='font-semibold'>
                      Add to Existing Meetings
                    </div>
                    <div className='text-sm mt-1'>
                      {relevantMeetings.length} relevant meeting
                      {relevantMeetings.length !== 1 ? 's' : ''} found
                    </div>
                  </button>
                  <button
                    onClick={() => setMode('new')}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                      mode === 'new'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}>
                    <div className='font-semibold'>Schedule New Meeting</div>
                    <div className='text-sm mt-1'>Create a new meeting</div>
                  </button>
                </div>
              </div>
            )}

            {/* Existing Meetings Mode */}
            {mode === 'existing' && relevantMeetings.length > 0 && (
              <div className='space-y-4'>
                <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                  <p className='text-sm text-blue-800'>
                    The following meetings are relevant to your selected topics.
                    Select which meetings you'd like to add these items to.
                  </p>
                </div>

                <div className='space-y-3'>
                  {relevantMeetings.map((relevantMeeting) => {
                    const meeting = relevantMeeting.meeting;
                    const isSelected = selectedMeetingIds.has(meeting.id);

                    return (
                      <div
                        key={meeting.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        onClick={() => handleToggleMeeting(meeting.id)}>
                        <div className='flex items-start gap-3'>
                          <input
                            type='checkbox'
                            checked={isSelected}
                            onChange={() => handleToggleMeeting(meeting.id)}
                            className='mt-1 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500'
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className='flex-1'>
                            <div className='flex items-center gap-2 mb-1'>
                              <h4 className='font-semibold text-gray-900'>
                                {meeting.title}
                              </h4>
                              {meeting.isCritical && (
                                <span className='px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-800 rounded'>
                                  Critical
                                </span>
                              )}
                            </div>
                            <div className='text-sm text-gray-600 space-y-1'>
                              <div className='flex items-center gap-1'>
                                <CalendarIcon className='w-4 h-4' />
                                {format(meeting.startTime, 'MMM d, yyyy')}
                              </div>
                              <div className='flex items-center gap-1'>
                                <ClockIcon className='w-4 h-4' />
                                {format(meeting.startTime, 'h:mm a')} -{' '}
                                {format(meeting.endTime, 'h:mm a')}
                              </div>
                              {meeting.location && (
                                <div className='flex items-center gap-1'>
                                  <MapPinIcon className='w-4 h-4' />
                                  {meeting.location}
                                </div>
                              )}
                              {meeting.description && (
                                <p className='text-gray-500 mt-2 line-clamp-2'>
                                  {meeting.description}
                                </p>
                              )}
                            </div>
                            <div className='mt-2'>
                              <span className='text-xs text-primary-600 font-medium'>
                                Matched:{' '}
                                {relevantMeeting.matchedKeywords
                                  .slice(0, 3)
                                  .join(', ')}
                                {relevantMeeting.matchedKeywords.length > 3 &&
                                  '...'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* New Meeting Mode */}
            {mode === 'new' && (
              <div className='space-y-6'>
                {/* Meeting Title */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Meeting Title *
                  </label>
                  <input
                    type='text'
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                    placeholder='Enter meeting title'
                  />
                </div>

                {/* Date and Time */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      <CalendarIcon className='w-4 h-4 inline mr-1' />
                      Date *
                    </label>
                    <input
                      type='date'
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      min={format(new Date(), 'yyyy-MM-dd')}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      <ClockIcon className='w-4 h-4 inline mr-1' />
                      Start Time *
                    </label>
                    <input
                      type='time'
                      value={meetingStartTime}
                      onChange={(e) => setMeetingStartTime(e.target.value)}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      <ClockIcon className='w-4 h-4 inline mr-1' />
                      End Time *
                    </label>
                    <input
                      type='time'
                      value={meetingEndTime}
                      onChange={(e) => setMeetingEndTime(e.target.value)}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                    />
                  </div>
                </div>

                {/* Location and Type */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      <MapPinIcon className='w-4 h-4 inline mr-1' />
                      Location
                    </label>
                    <input
                      type='text'
                      value={meetingLocation}
                      onChange={(e) => setMeetingLocation(e.target.value)}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                      placeholder='e.g., Conference Room A'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Meeting Type
                    </label>
                    <select
                      value={meetingType}
                      onChange={(e) =>
                        setMeetingType(e.target.value as MeetingType)
                      }
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'>
                      <option value='general'>General</option>
                      <option value='finance-review'>Finance Review</option>
                      <option value='check-in'>Check-in</option>
                      <option value='interview'>Interview</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    <DocumentTextIcon className='w-4 h-4 inline mr-1' />
                    Description
                  </label>
                  <textarea
                    value={meetingDescription}
                    onChange={(e) => setMeetingDescription(e.target.value)}
                    rows={4}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                    placeholder='Meeting description...'
                  />
                </div>

                {/* Selected Items Preview */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Selected Topics (will be added as meeting materials)
                  </label>
                  <div className='bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2'>
                    {selectedItems.map((item) => (
                      <div
                        key={item.id}
                        className='text-sm text-gray-700 flex items-center gap-2'>
                        <span className='w-2 h-2 bg-primary-500 rounded-full'></span>
                        {item.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className='flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50'>
            <button
              onClick={onClose}
              className='px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'>
              Cancel
            </button>
            {mode === 'existing' ? (
              <button
                onClick={handleAddToExisting}
                disabled={selectedMeetingIds.size === 0}
                className='px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
                Add to {selectedMeetingIds.size} Meeting
                {selectedMeetingIds.size !== 1 ? 's' : ''}
              </button>
            ) : (
              <button
                onClick={handleScheduleNew}
                className='px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors'>
                Schedule Meeting
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
