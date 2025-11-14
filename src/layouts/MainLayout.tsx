import { useState, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import RightSidebar from '../components/RightSidebar';
import CalendarSidebar from '../components/CalendarSidebar';
import { mockCalendarEvents } from '../data/mockCalendar';
import type { MeetingMaterial } from '../types';

export default function MainLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const location = useLocation();
  const isMeetingPage = location.pathname.startsWith('/meeting/');
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

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 relative'>
      {/* Left Calendar Sidebar */}
      {isCalendarVisible && (
        <CalendarSidebar
          selectedMeetingId={meetingId}
          onMeetingSelect={() => {
            // Navigation handled by CalendarSidebar component
          }}
          onDropMaterial={handleDropMaterial}
          meetingMaterials={meetingMaterials}
        />
      )}

      {/* Right Sidebar */}
      <RightSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isCalendarVisible={isCalendarVisible}
        onToggleCalendar={() => setIsCalendarVisible(!isCalendarVisible)}
      />

      {/* Main content area - adjust margin for both sidebars */}
      <main
        className={`min-h-screen transition-all duration-300 ${
          isCalendarVisible ? 'ml-80' : 'ml-0'
        } ${isSidebarCollapsed ? 'mr-16' : 'mr-64'}`}>
        <Outlet context={{ meetingMaterials }} />
      </main>
    </div>
  );
}
