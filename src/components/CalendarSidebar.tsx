import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Meeting, MeetingMaterial } from '../types';
import { mockCalendarEvents } from '../data/mockCalendar';

interface CalendarSidebarProps {
  selectedMeetingId?: string;
  onMeetingSelect?: (meetingId: string) => void;
  onDropMaterial?: (
    meetingId: string,
    materialType: 'external-pulse' | 'internal-pulse' | 'cost-impact-factory',
    itemId: string,
    itemTitle?: string,
    itemDescription?: string
  ) => void;
  meetingMaterials?: Record<string, MeetingMaterial[]>;
  onClose?: () => void;
  isClosing?: boolean;
}

export default function CalendarSidebar({
  selectedMeetingId,
  onMeetingSelect,
  onDropMaterial,
  meetingMaterials = {},
  onClose,
  isClosing = false,
}: CalendarSidebarProps) {
  const navigate = useNavigate();
  const [draggedOverMeetingId, setDraggedOverMeetingId] = useState<
    string | null
  >(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Get current date (Nov 19, 2025)
  const currentDate = new Date('2025-11-19T00:00:00+08:00');
  const currentTime = new Date('2025-11-19T08:07:00+08:00'); // 8:07 AM as shown in image
  const today = new Date('2025-11-19T00:00:00+08:00'); // Today is Nov 19, 2025

  // Helper function to check if two dates are on the same day
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // Check if current date is today
  const isToday = isSameDay(currentDate, today);

  // Filter events to only show those on the current date
  const eventsForCurrentDate = mockCalendarEvents.filter((meeting) =>
    isSameDay(meeting.startTime, currentDate)
  );

  // Merge meeting materials with events
  const eventsWithMaterials: Meeting[] = eventsForCurrentDate.map(
    (meeting) => ({
      ...meeting,
      materials: meetingMaterials[meeting.id] || meeting.materials,
    })
  );

  // Generate time slots for 24 hours (midnight to 11 PM)
  const timeSlots: Date[] = [];
  for (let hour = 0; hour <= 23; hour++) {
    timeSlots.push(
      new Date(`2025-11-19T${hour.toString().padStart(2, '0')}:00:00+08:00`)
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

    // Check for multiple items first (multi-drag support)
    const multipleItemsData = e.dataTransfer.getData('multipleItems');
    if (multipleItemsData && onDropMaterial) {
      try {
        const items: Array<{
          type: 'external-pulse' | 'internal-pulse';
          itemId: string;
        }> = JSON.parse(multipleItemsData);

        // Add all items to the meeting
        items.forEach((item) => {
          onDropMaterial(meetingId, item.type, item.itemId);
        });
        return;
      } catch (error) {
        console.error('Failed to parse multiple items:', error);
      }
    }

    // Fallback to single item (backward compatibility)
    const materialType = e.dataTransfer.getData('materialType') as
      | 'external-pulse'
      | 'internal-pulse'
      | 'cost-impact-factory';
    const itemId = e.dataTransfer.getData('itemId');
    const itemTitle = e.dataTransfer.getData('itemTitle');
    const itemDescription = e.dataTransfer.getData('itemDescription');

    if (materialType && itemId && onDropMaterial) {
      onDropMaterial(meetingId, materialType, itemId, itemTitle, itemDescription);
    }
  };

  // Fixed height per hour in pixels (60px = 1 hour)
  const PIXELS_PER_HOUR = 60;
  const TOTAL_HOURS = 24; // Full 24-hour day (midnight to 11 PM)
  const TOTAL_HEIGHT = TOTAL_HOURS * PIXELS_PER_HOUR; // 1440px

  const getEventPosition = (meeting: Meeting) => {
    const startHour = meeting.startTime.getHours();
    const startMinutes = meeting.startTime.getMinutes();
    const endHour = meeting.endTime.getHours();
    const endMinutes = meeting.endTime.getMinutes();

    const startPosition = startHour * 60 + startMinutes; // Minutes from midnight
    const duration = (endHour - startHour) * 60 + (endMinutes - startMinutes); // Duration in minutes

    // Convert to pixels based on fixed height
    const topPx = (startPosition / 60) * PIXELS_PER_HOUR;
    const heightPx = (duration / 60) * PIXELS_PER_HOUR;

    return {
      top: `${topPx}px`,
      height: `${heightPx}px`,
    };
  };

  const getEventColor = (meetingType: string, isCritical?: boolean) => {
    // Critical meetings get blue background with white text for strong contrast and importance
    if (isCritical) {
      return 'bg-blue-600 border-2 border-blue-700 text-white font-semibold';
    }

    // Regular meetings use type-based colors with dashed borders
    switch (meetingType) {
      case 'finance-review':
        return 'bg-blue-100 border-2 border-dashed border-blue-300 text-blue-900';
      case 'interview':
        return 'bg-purple-100 border-2 border-dashed border-purple-300 text-purple-900';
      case 'check-in':
        return 'bg-green-100 border-2 border-dashed border-green-300 text-green-900';
      case 'travel':
        return 'bg-orange-100 border-2 border-dashed border-orange-300 text-orange-900';
      default:
        return 'bg-pink-100 border-2 border-dashed border-pink-300 text-gray-900';
    }
  };

  const getCurrentTimePosition = () => {
    const hour = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const position = hour * 60 + minutes; // Minutes from midnight
    // Convert to pixels based on fixed height
    return (position / 60) * PIXELS_PER_HOUR;
  };

  // Scroll to 7am at the top of the screen on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      // 7am = 7 hours * 60 minutes = 420 minutes from midnight
      const sevenAmPosition = ((7 * 60) / 60) * PIXELS_PER_HOUR; // 420px
      scrollContainerRef.current.scrollTop = Math.max(0, sevenAmPosition);
    }
  }, []);

  return (
    <div
      className={`fixed left-0 top-0 h-full w-80 bg-white border-r border-gray-200 shadow-lg z-20 overflow-hidden flex flex-col ${
        isClosing ? 'animate-slide-out-left' : 'animate-slide-in-left'
      }`}>
      {/* Header */}
      <div className='p-4 border-b border-gray-200 bg-gray-50 relative'>
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className='absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm'
            aria-label='Close calendar'>
            <XMarkIcon className='w-5 h-5' />
          </button>
        )}
        <div className='text-sm font-semibold text-gray-900'>GMT+8</div>
        <div
          className={`text-lg font-bold mt-1 ${
            isToday
              ? 'text-blue-700 bg-blue-200 border-2 border-blue-400 shadow-md px-3 py-2 rounded-lg'
              : 'text-gray-900'
          }`}>
          {format(currentDate, 'EEE d')}
          {isToday && (
            <span className='ml-2 text-xs font-semibold text-blue-700'>
              (Today)
            </span>
          )}
        </div>
        <div className='text-xs text-gray-500 mt-1'>All Day</div>
      </div>

      {/* Calendar View */}
      <div
        ref={scrollContainerRef}
        className='flex-1 overflow-y-auto relative'>
        {/* Container with fixed height for time slots and events */}
        <div
          className='relative'
          style={{ height: `${TOTAL_HEIGHT}px` }}>
          {/* Time Slots */}
          <div className='relative h-full'>
            {timeSlots.map((time, index) => (
              <div
                key={index}
                className='border-b border-gray-100 absolute left-0 right-0'
                style={{
                  top: `${index * PIXELS_PER_HOUR}px`,
                  height: `${PIXELS_PER_HOUR}px`,
                }}>
                <div className='px-3 py-1 text-xs text-gray-500'>
                  {format(time, 'h a')}
                </div>
              </div>
            ))}
          </div>

          {/* Current Time Indicator */}
          <div
            className='absolute left-0 right-0 border-t-2 border-blue-500 z-10 pointer-events-none'
            style={{ top: `${getCurrentTimePosition()}px` }}>
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
              const isCritical = meeting.isCritical;

              // Calculate meeting duration in minutes
              const startHour = meeting.startTime.getHours();
              const startMinutes = meeting.startTime.getMinutes();
              const endHour = meeting.endTime.getHours();
              const endMinutes = meeting.endTime.getMinutes();
              const durationMinutes =
                (endHour - startHour) * 60 + (endMinutes - startMinutes);

              // Only show time if meeting is 60 minutes (1 hour) or longer
              const shouldShowTime = durationMinutes >= 60;

              return (
                <div
                  key={meeting.id}
                  className={`absolute left-0 right-0 mx-2 rounded p-2 cursor-pointer pointer-events-auto transition-all overflow-hidden ${getEventColor(
                    meeting.meetingType,
                    isCritical
                  )} ${
                    isSelected
                      ? isCritical
                        ? 'ring-2 ring-blue-300 ring-offset-1'
                        : 'ring-2 ring-primary-500 ring-offset-2'
                      : ''
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
                  <div className='flex flex-row justify-between items-start h-full overflow-hidden gap-2'>
                    <div className='flex flex-col flex-1 min-w-0'>
                      <div
                        className={`text-xs truncate ${
                          isCritical ? 'font-semibold' : 'font-semibold'
                        }`}>
                        {meeting.title}
                      </div>
                      {shouldShowTime && (
                        <div
                          className={`text-xs mt-1 truncate ${
                            isCritical ? 'opacity-90' : 'opacity-75'
                          }`}>
                          {format(meeting.startTime, 'h:mm a')} -{' '}
                          {format(meeting.endTime, 'h:mm a')}
                        </div>
                      )}
                    </div>
                    {meeting.materials.length > 0 && (
                      <div className='text-xs flex items-center gap-1 flex-shrink-0'>
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            isCritical ? 'bg-white' : 'bg-primary-500'
                          }`}></span>
                        <span className='whitespace-nowrap'>
                          {meeting.materials.length} material
                          {meeting.materials.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
