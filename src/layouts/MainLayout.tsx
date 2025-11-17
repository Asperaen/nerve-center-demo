import { useState, useCallback, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import RightSidebar from '../components/RightSidebar';
import CalendarSidebar from '../components/CalendarSidebar';
import { mockCalendarEvents } from '../data/mockCalendar';
import type { MeetingMaterial } from '../types';

export default function MainLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [isCalendarClosing, setIsCalendarClosing] = useState(false);
  const location = useLocation();
  const isMeetingPage = location.pathname.startsWith('/meeting/');
  const isMyMeetingsPage = location.pathname === '/my-meetings';
  const meetingId = isMeetingPage ? location.pathname.split('/')[2] : undefined;

  // State for meeting materials (which pulse items are attached to which meetings)
  const [meetingMaterials, setMeetingMaterials] = useState<
    Record<string, MeetingMaterial[]>
  >(() => {
    // Initialize with existing materials from mockCalendarEvents
    const initial: Record<string, MeetingMaterial[]> = {};
    mockCalendarEvents.forEach((meeting) => {
      initial[meeting.id] = meeting.materials;
    });
    return initial;
  });

  const handleDropMaterial = useCallback(
    (
      meetingId: string,
      materialType: 'external-pulse' | 'internal-pulse',
      itemId: string
    ) => {
      setMeetingMaterials((prev) => {
        const existing = prev[meetingId] || [];
        // Check if material already exists
        const exists = existing.some(
          (m) => m.type === materialType && m.itemId === itemId
        );
        if (exists) {
          return prev; // Don't add duplicates
        }

        const newMaterial: MeetingMaterial = {
          id: `material-${Date.now()}-${Math.random()}`,
          type: materialType,
          itemId,
          addedAt: new Date(),
        };

        return {
          ...prev,
          [meetingId]: [...existing, newMaterial],
        };
      });
    },
    []
  );

  const handleCloseCalendar = () => {
    setIsCalendarClosing(true);
    setTimeout(() => {
      setIsCalendarVisible(false);
      setIsCalendarClosing(false);
    }, 300); // Match animation duration
  };

  // Close calendar when navigating to My Meetings page
  useEffect(() => {
    if (isMyMeetingsPage && isCalendarVisible) {
      handleCloseCalendar();
    }
  }, [isMyMeetingsPage, isCalendarVisible]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 relative'>
      {/* Floating Calendar Toggle Button - Only show when calendar is closed and not on My Meetings page */}
      {!isCalendarVisible && !isMyMeetingsPage && (
        <button
          onClick={() => setIsCalendarVisible(true)}
          className='fixed top-3 left-0 z-50 w-8 h-8 rounded-md shadow-lg transition-all duration-200 flex items-center justify-center bg-white/95 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-gray-900 border border-gray-200/60 hover:border-gray-300 hover:shadow-xl'
          aria-label='Open calendar'>
          <CalendarDaysIcon className='w-4 h-4' />
        </button>
      )}

      {/* Left Calendar Sidebar - Hide on My Meetings page */}
      {isCalendarVisible && !isMyMeetingsPage && (
        <CalendarSidebar
          selectedMeetingId={meetingId}
          onMeetingSelect={() => {
            // Navigation handled by CalendarSidebar component
          }}
          onDropMaterial={handleDropMaterial}
          meetingMaterials={meetingMaterials}
          onClose={handleCloseCalendar}
          isClosing={isCalendarClosing}
        />
      )}

      {/* Right Sidebar */}
      <RightSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main content area - adjust margin for both sidebars */}
      <main
        className={`min-h-screen transition-all duration-300 ${
          isCalendarVisible && !isMyMeetingsPage ? 'ml-80' : 'ml-0'
        } ${isSidebarCollapsed ? 'mr-16' : 'mr-64'}`}>
        <Outlet context={{ meetingMaterials }} />
      </main>
    </div>
  );
}
