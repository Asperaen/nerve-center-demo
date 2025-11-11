import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import type { Meeting, MeetingMaterial } from '../types';
import { mockCalendarEvents } from '../data/mockCalendar';

interface CalendarSidebarProps {
  selectedMeetingId?: string;
  onMeetingSelect?: (meetingId: string) => void;
  onDropMaterial?: (
    meetingId: string,
    materialType: 'external-pulse' | 'internal-pulse',
    itemId: string
  ) => void;
  meetingMaterials?: Record<string, MeetingMaterial[]>;
}

export default function CalendarSidebar({
  selectedMeetingId,
  onMeetingSelect,
  onDropMaterial,
  meetingMaterials = {},
}: CalendarSidebarProps) {
  const navigate = useNavigate();
  const [draggedOverMeetingId, setDraggedOverMeetingId] = useState<
    string | null
  >(null);

  // Merge meeting materials with events
  const eventsWithMaterials: Meeting[] = mockCalendarEvents.map((meeting) => ({
    ...meeting,
    materials: meetingMaterials[meeting.id] || meeting.materials,
  }));

  // Get current date (Nov 3, 2024)
  const currentDate = new Date('2024-11-03T00:00:00+08:00');
  const currentTime = new Date('2024-11-03T17:07:00+08:00'); // 5:07 PM as shown in image

  // Generate time slots from 6 AM to 11 PM
  const timeSlots: Date[] = [];
  for (let hour = 6; hour <= 23; hour++) {
    timeSlots.push(
      new Date(`2024-11-03T${hour.toString().padStart(2, '0')}:00:00+08:00`)
    );
  }

  const handleMeetingClick = (meetingId: string) => {
    if (onMeetingSelect) {
      onMeetingSelect(meetingId);
    }
    navigate(`/meeting/${meetingId}`);
  };

  const handleDragOver = (e: React.DragEvent, meetingId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedOverMeetingId(meetingId);
  };

  const handleDragLeave = () => {
    setDraggedOverMeetingId(null);
  };

  const handleDrop = (e: React.DragEvent, meetingId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedOverMeetingId(null);

    const materialType = e.dataTransfer.getData('materialType') as
      | 'external-pulse'
      | 'internal-pulse';
    const itemId = e.dataTransfer.getData('itemId');

    if (materialType && itemId && onDropMaterial) {
      onDropMaterial(meetingId, materialType, itemId);
    }
  };

  const getEventPosition = (meeting: Meeting) => {
    const startHour = meeting.startTime.getHours();
    const startMinutes = meeting.startTime.getMinutes();
    const endHour = meeting.endTime.getHours();
    const endMinutes = meeting.endTime.getMinutes();

    const startPosition = (startHour - 6) * 60 + startMinutes; // Minutes from 6 AM
    const duration = (endHour - startHour) * 60 + (endMinutes - startMinutes); // Duration in minutes

    const topPercent = (startPosition / (18 * 60)) * 100; // 18 hours from 6 AM to 11 PM
    const heightPercent = (duration / (18 * 60)) * 100;

    return {
      top: `${topPercent}%`,
      height: `${heightPercent}%`,
    };
  };

  const getEventColor = (meetingType: string) => {
    switch (meetingType) {
      case 'finance-review':
        return 'bg-blue-100 border-blue-300 text-blue-900';
      case 'interview':
        return 'bg-purple-100 border-purple-300 text-purple-900';
      case 'check-in':
        return 'bg-green-100 border-green-300 text-green-900';
      case 'travel':
        return 'bg-orange-100 border-orange-300 text-orange-900';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-900';
    }
  };

  const isCurrentTime = (time: Date) => {
    return (
      time.getHours() === currentTime.getHours() &&
      Math.abs(time.getMinutes() - currentTime.getMinutes()) < 15
    );
  };

  const getCurrentTimePosition = () => {
    const hour = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const position = (hour - 6) * 60 + minutes;
    return (position / (18 * 60)) * 100;
  };

  return (
    <div className='fixed left-0 top-0 h-full w-80 bg-white border-r border-gray-200 shadow-lg z-20 overflow-hidden flex flex-col'>
      {/* Header */}
      <div className='p-4 border-b border-gray-200 bg-gray-50'>
        <div className='text-sm font-semibold text-gray-900'>GMT+8</div>
        <div className='text-lg font-bold text-gray-900 mt-1'>
          {format(currentDate, 'EEE d')}
        </div>
        <div className='text-xs text-gray-500 mt-1'>All Day</div>
      </div>

      {/* Calendar View */}
      <div className='flex-1 overflow-y-auto relative'>
        {/* Time Slots */}
        <div className='relative'>
          {timeSlots.map((time, index) => (
            <div
              key={index}
              className='border-b border-gray-100'
              style={{ minHeight: '60px' }}>
              <div className='px-3 py-1 text-xs text-gray-500'>
                {format(time, 'h a')}
              </div>
            </div>
          ))}
        </div>

        {/* Current Time Indicator */}
        <div
          className='absolute left-0 right-0 border-t-2 border-blue-500 z-10 pointer-events-none'
          style={{ top: `${getCurrentTimePosition()}%` }}>
          <div className='absolute -left-2 -top-2 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded'>
            {format(currentTime, 'h:mm a')}
          </div>
        </div>

        {/* Events */}
        <div className='absolute inset-0 pointer-events-none'>
          {eventsWithMaterials.map((meeting) => {
            const position = getEventPosition(meeting);
            const isSelected = selectedMeetingId === meeting.id;
            const isDraggedOver = draggedOverMeetingId === meeting.id;

            return (
              <div
                key={meeting.id}
                className={`absolute left-0 right-0 mx-2 rounded border-2 p-2 cursor-pointer pointer-events-auto transition-all ${getEventColor(
                  meeting.meetingType
                )} ${
                  isSelected ? 'ring-2 ring-primary-500 ring-offset-2' : ''
                } ${
                  isDraggedOver
                    ? 'ring-2 ring-purple-500 ring-offset-2 bg-opacity-80'
                    : ''
                }`}
                style={{
                  top: position.top,
                  height: position.height,
                  minHeight: '40px',
                }}
                onClick={() => handleMeetingClick(meeting.id)}
                onDragOver={(e) => handleDragOver(e, meeting.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, meeting.id)}>
                <div className='text-xs font-semibold truncate'>
                  {meeting.title}
                </div>
                <div className='text-xs mt-1 opacity-75'>
                  {format(meeting.startTime, 'h:mm a')} -{' '}
                  {format(meeting.endTime, 'h:mm a')}
                </div>
                {meeting.materials.length > 0 && (
                  <div className='text-xs mt-1 flex items-center gap-1'>
                    <span className='w-2 h-2 bg-primary-500 rounded-full'></span>
                    <span>
                      {meeting.materials.length} material
                      {meeting.materials.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
