import { mockCalendarEvents } from '../data/mockCalendar';
import type { Meeting, MeetingMaterial } from '../types';

/**
 * Finds all meetings that contain a specific news item as material
 * @param newsId - The ID of the news item to search for
 * @param meetingMaterials - The current meeting materials state from MainLayout
 * @param allMeetings - All meetings (defaults to mockCalendarEvents)
 * @returns Array of meetings that contain the news item
 */
export function getMeetingsForNewsItem(
  newsId: string,
  meetingMaterials: Record<string, MeetingMaterial[]>,
  allMeetings: Meeting[] = mockCalendarEvents
): Meeting[] {
  const meetings: Meeting[] = [];

  // Check all meetings
  for (const meeting of allMeetings) {
    // Get materials from both the meeting's initial materials and the state
    const materials = meetingMaterials[meeting.id] || meeting.materials;

    // Check if this meeting has the news item as a material
    const hasNewsItem = materials.some(
      (material) =>
        material.type === 'external-pulse' && material.itemId === newsId
    );

    if (hasNewsItem) {
      meetings.push(meeting);
    }
  }

  return meetings;
}
