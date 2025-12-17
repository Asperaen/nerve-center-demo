import { useState, useMemo } from 'react';
import {
  format,
  startOfWeek,
  addWeeks,
  subWeeks,
  eachDayOfInterval,
  isSameWeek,
  isSameDay,
} from 'date-fns';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import { mockCalendarEvents } from '../data/mockCalendar';
import { mockNews } from '../data/mockNews';
import { internalPulseColumns } from '../data/mockInternalPulse';
import type { Meeting, NewsItem, PulseMetric, MeetingMaterial } from '../types';

interface MeetingDetailModalProps {
  meeting: Meeting | null;
  meetingMaterials: MeetingMaterial[];
  onClose: () => void;
}

function MeetingDetailModal({
  meeting,
  meetingMaterials,
  onClose,
}: MeetingDetailModalProps) {
  if (!meeting) return null;

  // Get materials data
  const externalMaterials = meetingMaterials
    .filter((m) => m.type === 'external-pulse')
    .map((m) => mockNews.find((n) => n.id === m.itemId))
    .filter((n): n is NewsItem => n !== undefined);

  const internalMaterials = meetingMaterials
    .filter((m) => m.type === 'internal-pulse')
    .map((m) => {
      // Find the metric in internal pulse columns
      for (const column of internalPulseColumns) {
        for (const section of column.sections) {
          const metric = section.metrics.find((met) => met.id === m.itemId);
          if (metric) return metric;
        }
      }
      return null;
    })
    .filter((m): m is PulseMetric => m !== null);

  const requiredAttendees = meeting.attendees.filter((a) => a.isRequired);
  const optionalAttendees = meeting.attendees.filter((a) => !a.isRequired);

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black bg-opacity-50 transition-opacity'
        onClick={onClose}
      />

      {/* Modal */}
      <div className='flex min-h-full items-center justify-center p-4'>
        <div className='relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto'>
          {/* Header */}
          <div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between z-10'>
            <div className='flex-1'>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                {meeting.title}
              </h2>
              <div className='flex items-center gap-4 text-sm text-gray-600'>
                <div className='flex items-center'>
                  <span className='font-medium'>Time:</span>
                  <span className='ml-2'>
                    {format(meeting.startTime, 'h:mm a')} -{' '}
                    {format(meeting.endTime, 'h:mm a')}
                  </span>
                </div>
                {meeting.location && (
                  <div className='flex items-center'>
                    <span className='font-medium'>Location:</span>
                    <span className='ml-2'>{meeting.location}</span>
                  </div>
                )}
                <div className='flex items-center'>
                  <span className='font-medium'>Organizer:</span>
                  <span className='ml-2'>{meeting.organizer}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className='ml-4 p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700'>
              <XMarkIcon className='w-6 h-6' />
            </button>
          </div>

          {/* Content */}
          <div className='p-6 space-y-6'>
            {/* Description */}
            {meeting.description && (
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  Description
                </h3>
                <p className='text-sm text-gray-700'>{meeting.description}</p>
              </div>
            )}

            {/* Attendees */}
            <div>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Attendees
              </h3>
              <div className='space-y-4'>
                {requiredAttendees.length > 0 && (
                  <div>
                    <h4 className='text-sm font-medium text-gray-700 mb-2'>
                      Required
                    </h4>
                    <div className='flex flex-wrap gap-3'>
                      {requiredAttendees.map((attendee, index) => (
                        <div
                          key={index}
                          className='flex items-center gap-2 px-3 py-2 bg-primary-50 rounded-lg border border-primary-200'>
                          <div className='w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold'>
                            {attendee.name.charAt(0)}
                          </div>
                          <div>
                            <div className='text-sm font-medium text-gray-900'>
                              {attendee.name}
                            </div>
                            {attendee.role && (
                              <div className='text-xs text-gray-500'>
                                {attendee.role}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {optionalAttendees.length > 0 && (
                  <div>
                    <h4 className='text-sm font-medium text-gray-700 mb-2'>
                      Optional
                    </h4>
                    <div className='flex flex-wrap gap-3'>
                      {optionalAttendees.map((attendee, index) => (
                        <div
                          key={index}
                          className='flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200'>
                          <div className='w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-sm font-semibold'>
                            {attendee.name.charAt(0)}
                          </div>
                          <div>
                            <div className='text-sm font-medium text-gray-900'>
                              {attendee.name}
                            </div>
                            {attendee.role && (
                              <div className='text-xs text-gray-500'>
                                {attendee.role}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Meeting Materials */}
            <div>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Meeting Materials
                </h3>
                <div className='text-sm text-gray-500'>
                  {meetingMaterials.length} item
                  {meetingMaterials.length !== 1 ? 's' : ''} attached
                </div>
              </div>

              {meetingMaterials.length === 0 ? (
                <div className='text-center py-8 border-2 border-dashed border-gray-300 rounded-lg'>
                  <p className='text-sm text-gray-500'>
                    No materials attached.
                  </p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {externalMaterials.length > 0 && (
                    <div>
                      <h4 className='text-sm font-medium text-gray-700 mb-2'>
                        External Pulse
                      </h4>
                      <div className='space-y-2'>
                        {externalMaterials.map((news) => (
                          <div
                            key={news.id}
                            className='p-3 bg-gray-50 rounded-lg border border-gray-200'>
                            <h5 className='text-sm font-medium text-gray-900'>
                              {news.title}
                            </h5>
                            <p className='text-xs text-gray-500 mt-1 line-clamp-2'>
                              {news.summary}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {internalMaterials.length > 0 && (
                    <div>
                      <h4 className='text-sm font-medium text-gray-700 mb-2'>
                        Internal Pulse
                      </h4>
                      <div className='space-y-2'>
                        {internalMaterials.map((metric) => (
                          <div
                            key={metric.id}
                            className='p-3 bg-gray-50 rounded-lg border border-gray-200'>
                            <div className='text-sm font-medium text-gray-900'>
                              {metric.name}
                            </div>
                            {metric.value !== undefined && (
                              <div className='text-xs text-gray-500 mt-1'>
                                {metric.valuePercent !== undefined
                                  ? `$${metric.value}M (${metric.valuePercent}%)`
                                  : `$${metric.value}M`}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyMeetingsPage() {
  // Initialize to the week containing the mock data (November 19, 2025)
  const [currentWeek, setCurrentWeek] = useState(
    new Date('2025-11-19T00:00:00+08:00')
  );
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const today = new Date('2025-11-19T00:00:00+08:00'); // Today is Nov 19, 2025

  // Calculate Monday-Friday of current week
  const weekStart = useMemo(() => {
    const monday = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday as start
    return monday;
  }, [currentWeek]);

  const weekDays = useMemo(() => {
    return eachDayOfInterval({
      start: weekStart,
      end: new Date(weekStart.getTime() + 4 * 24 * 60 * 60 * 1000), // Monday + 4 days = Friday
    });
  }, [weekStart]);

  // Filter meetings for the current week
  const weekMeetings = useMemo(() => {
    const dayKeys = weekDays.map((day) => format(day, 'yyyy-MM-dd'));
    return mockCalendarEvents.filter((meeting) => {
      const meetingDateKey = format(meeting.startTime, 'yyyy-MM-dd');
      return dayKeys.includes(meetingDateKey);
    });
  }, [weekDays]);

  // Group meetings by day
  const meetingsByDay = useMemo(() => {
    const grouped: Record<string, Meeting[]> = {};
    weekDays.forEach((day) => {
      const dayKey = format(day, 'yyyy-MM-dd');
      grouped[dayKey] = weekMeetings.filter((meeting) => {
        const meetingDate = format(meeting.startTime, 'yyyy-MM-dd');
        return meetingDate === dayKey;
      });
    });
    return grouped;
  }, [weekDays, weekMeetings]);

  // Time slots from 7 AM to 8 PM (30-minute intervals) to cover all meetings
  const timeSlots = useMemo(() => {
    const slots: string[] = ['All Day'];
    for (let hour = 7; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = new Date();
        time.setHours(hour, minute, 0, 0);
        slots.push(format(time, 'h:mm a'));
      }
    }
    return slots;
  }, []);

  // Get event position and height
  const getEventPosition = (meeting: Meeting, dayIndex: number) => {
    const startHour = meeting.startTime.getHours();
    const startMinutes = meeting.startTime.getMinutes();
    const endHour = meeting.endTime.getHours();
    const endMinutes = meeting.endTime.getMinutes();

    // Calculate position from 7 AM (slot index 1, after "All Day")
    // Clamp hours to visible range (7 AM - 8 PM)
    const minHour = 7;
    const maxHour = 20;
    const clampedStartHour = Math.max(minHour, Math.min(maxHour, startHour));
    const clampedEndHour = Math.max(minHour, Math.min(maxHour, endHour));

    const startSlot =
      (clampedStartHour - minHour) * 2 + Math.floor(startMinutes / 30);
    const endSlot =
      (clampedEndHour - minHour) * 2 + Math.floor(endMinutes / 30);
    const duration = Math.max(endSlot - startSlot, 1); // At least 1 slot

    // Each 30-minute slot is approximately 40px
    const SLOT_HEIGHT = 40;
    const top = startSlot * SLOT_HEIGHT;
    const height = Math.max(duration * SLOT_HEIGHT, 30); // Minimum 30px

    return {
      top: `${top}px`,
      height: `${height}px`,
      column: dayIndex,
    };
  };

  // Get event color based on meeting type
  const getEventColor = (meetingType: string, isCritical?: boolean) => {
    if (isCritical) {
      return 'bg-blue-600 border-2 border-blue-700 text-white font-semibold';
    }

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

  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const handleToday = () => {
    setCurrentWeek(new Date());
  };

  const formatWeekRange = () => {
    const monday = weekDays[0];
    const friday = weekDays[4];
    // Calculate week number manually
    const jan1 = new Date(monday.getFullYear(), 0, 1);
    const daysSinceJan1 = Math.floor(
      (monday.getTime() - jan1.getTime()) / (24 * 60 * 60 * 1000)
    );
    const weekNumber = Math.ceil((daysSinceJan1 + jan1.getDay() + 1) / 7);
    return `${format(monday, 'd MMMM')} - ${format(
      friday,
      'd MMMM yyyy'
    )} (Week ${weekNumber})`;
  };

  const isCurrentWeek = isSameWeek(currentWeek, new Date(), {
    weekStartsOn: 1,
  });

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Top Navigation Bar */}
      <div className='bg-white border-b border-gray-200 sticky top-0 z-20'>
        <div className='px-6 py-4 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <button
              onClick={handlePreviousWeek}
              className='p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900'>
              <ChevronLeftIcon className='w-5 h-5' />
            </button>
            <button
              onClick={handleNextWeek}
              className='p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900'>
              <ChevronRightIcon className='w-5 h-5' />
            </button>
            <button
              onClick={handleToday}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isCurrentWeek
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              Today
            </button>
            <div className='text-sm font-semibold text-gray-900'>
              {formatWeekRange()}
            </div>
          </div>
          <div className='text-sm text-gray-600'>HKT (GMT+8)</div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className='p-6'>
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          {/* Header Row - Days */}
          <div className='grid grid-cols-6 border-b border-gray-200 bg-gray-50'>
            <div className='p-3 border-r border-gray-200 text-xs font-semibold text-gray-500'>
              Time
            </div>
            {weekDays.map((day, index) => {
              const isDayToday = isSameDay(day, today);
              return (
                <div
                  key={index}
                  className={`p-3 border-r border-gray-200 last:border-r-0 text-center ${
                    isDayToday
                      ? 'bg-blue-200 border-2 border-blue-400 shadow-md'
                      : ''
                  }`}>
                  <div
                    className={`text-xs font-semibold uppercase ${
                      isDayToday ? 'text-blue-800' : 'text-gray-500'
                    }`}>
                    {format(day, 'EEE')}
                  </div>
                  <div
                    className={`text-sm font-bold mt-1 ${
                      isDayToday
                        ? 'text-blue-700 bg-blue-300 border-2 border-blue-500 rounded-full w-8 h-8 flex items-center justify-center mx-auto shadow-sm'
                        : 'text-gray-900'
                    }`}>
                    {format(day, 'd')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time Slots and Events */}
          <div className='relative overflow-x-auto overflow-y-auto max-h-[800px] scrollbar-hide'>
            <div
              className='min-w-full'
              style={{ height: `${(timeSlots.length - 1) * 40}px` }}>
              <div className='grid grid-cols-6 h-full'>
                {/* Time Column */}
                <div className='border-r border-gray-200'>
                  {timeSlots.slice(1).map((time, index) => (
                    <div
                      key={index}
                      className='border-b border-gray-100 h-10 flex items-center px-3'>
                      <span className='text-xs text-gray-500'>{time}</span>
                    </div>
                  ))}
                </div>

                {/* Day Columns */}
                {weekDays.map((day, dayIndex) => {
                  const dayKey = format(day, 'yyyy-MM-dd');
                  const dayMeetings = meetingsByDay[dayKey] || [];
                  const isDayToday = isSameDay(day, today);

                  return (
                    <div
                      key={dayIndex}
                      className={`border-r border-gray-200 last:border-r-0 relative ${
                        isDayToday ? 'bg-blue-50/30' : ''
                      }`}>
                      {/* Time slot lines */}
                      {timeSlots.slice(1).map((_, index) => (
                        <div
                          key={index}
                          className='border-b border-dotted border-gray-200 h-10'
                        />
                      ))}

                      {/* Events */}
                      <div className='absolute inset-0 pointer-events-none'>
                        {dayMeetings.map((meeting) => {
                          const position = getEventPosition(meeting, dayIndex);
                          const isCritical = meeting.isCritical;
                          const durationMinutes =
                            (meeting.endTime.getHours() -
                              meeting.startTime.getHours()) *
                              60 +
                            (meeting.endTime.getMinutes() -
                              meeting.startTime.getMinutes());

                          return (
                            <div
                              key={meeting.id}
                              className={`absolute left-1 right-1 rounded p-1.5 cursor-pointer pointer-events-auto transition-all overflow-hidden text-xs ${getEventColor(
                                meeting.meetingType,
                                isCritical
                              )}`}
                              style={{
                                top: position.top,
                                height: position.height,
                                minHeight: '30px',
                              }}
                              onClick={() => setSelectedMeeting(meeting)}>
                              <div className='flex items-start gap-1 h-full'>
                                <div className='flex-1 min-w-0'>
                                  <div className='font-semibold truncate'>
                                    {meeting.title}
                                  </div>
                                  {durationMinutes >= 30 && (
                                    <div className='text-xs mt-0.5 opacity-75'>
                                      {format(meeting.startTime, 'h:mm a')} -{' '}
                                      {format(meeting.endTime, 'h:mm a')}
                                    </div>
                                  )}
                                </div>
                                {meeting.materials.length > 0 && (
                                  <LinkIcon className='w-3 h-3 flex-shrink-0 mt-0.5' />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meeting Detail Modal */}
      <MeetingDetailModal
        meeting={selectedMeeting}
        meetingMaterials={selectedMeeting?.materials || []}
        onClose={() => setSelectedMeeting(null)}
      />
    </div>
  );
}
