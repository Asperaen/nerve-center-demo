import { useState, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import RightSidebar from '../components/RightSidebar';
import CalendarSidebar from '../components/CalendarSidebar';
import ActionTrackerModal from '../components/ActionTrackerModal';
import { mockCalendarEvents } from '../data/mockCalendar';
import type { MeetingMaterial } from '../types';

export default function MainLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isActionTrackerModalOpen, setIsActionTrackerModalOpen] =
    useState(false);
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
      <CalendarSidebar
        selectedMeetingId={meetingId}
        onMeetingSelect={() => {
          // Navigation handled by CalendarSidebar component
        }}
        onDropMaterial={handleDropMaterial}
        meetingMaterials={meetingMaterials}
      />

      {/* Right Sidebar */}
      <RightSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main content area - adjust margin for both sidebars */}
      <main
        className={`min-h-screen transition-all duration-300 ml-80 ${
          isSidebarCollapsed ? 'mr-16' : 'mr-64'
        }`}>
        <Outlet context={{ meetingMaterials }} />
      </main>

      {/* Floating Action Tracker Button */}
      <button
        onClick={() => setIsActionTrackerModalOpen(true)}
        className='fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 bg-gray-700 text-white rounded-full shadow-lg hover:bg-gray-800 hover:shadow-xl transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-gray-300'
        aria-label='View Action Tracker'>
        <ClipboardDocumentListIcon className='w-6 h-6' />
      </button>

      {/* Action Tracker Modal */}
      <ActionTrackerModal
        isOpen={isActionTrackerModalOpen}
        onClose={() => setIsActionTrackerModalOpen(false)}
      />
    </div>
  );
}
