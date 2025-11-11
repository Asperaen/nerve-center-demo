import type { Meeting } from '../types';

// Mock calendar events for Nov 3, 2024 (Monday)
export const mockCalendarEvents: Meeting[] = [
  {
    id: 'meeting-1',
    title:
      'Canceled: McKinsey Interview - Technical Experience Interview + Personal Experience Interview',
    startTime: new Date('2024-11-03T13:00:00+08:00'), // 1 PM GMT+8
    endTime: new Date('2024-11-03T14:00:00+08:00'), // 2 PM GMT+8
    location: 'Virtual',
    organizer: 'McKinsey Recruiting',
    attendees: [
      {
        name: 'CEO',
        email: 'ceo@company.com',
        role: 'Interviewee',
        isRequired: true,
      },
      {
        name: 'McKinsey Partner',
        email: 'partner@mckinsey.com',
        role: 'Interviewer',
        isRequired: true,
      },
    ],
    description: 'Technical and personal experience interview',
    meetingType: 'interview',
    materials: [],
  },
  {
    id: 'meeting-2',
    title: '[FIT] Nerve Center PS',
    startTime: new Date('2024-11-03T17:00:00+08:00'), // 5 PM GMT+8
    endTime: new Date('2024-11-03T17:30:00+08:00'), // 5:30 PM GMT+8
    location: 'Conference Room A',
    organizer: 'Product Team',
    attendees: [
      {
        name: 'CEO',
        email: 'ceo@company.com',
        role: 'Participant',
        isRequired: true,
      },
      {
        name: 'Product Manager',
        email: 'pm@company.com',
        role: 'Presenter',
        isRequired: true,
      },
      {
        name: 'Engineering Lead',
        email: 'eng@company.com',
        role: 'Participant',
        isRequired: false,
      },
    ],
    description: 'Nerve Center product status update',
    meetingType: 'check-in',
    materials: [
      // External Pulse Materials
      {
        id: 'material-nerve-1',
        type: 'external-pulse',
        itemId: 'news-1', // US Announces 25% Tariff on Chinese-Made EV Connectors
        addedAt: new Date('2024-11-03T16:30:00+08:00'),
      },
      {
        id: 'material-nerve-2',
        type: 'external-pulse',
        itemId: 'news-3', // Tesla Q3 Earnings Beat Expectations
        addedAt: new Date('2024-11-03T16:35:00+08:00'),
      },
      {
        id: 'material-nerve-3',
        type: 'external-pulse',
        itemId: 'news-5', // Global 5G Infrastructure Investment
        addedAt: new Date('2024-11-03T16:40:00+08:00'),
      },
      // Internal Pulse Materials
      {
        id: 'material-nerve-4',
        type: 'internal-pulse',
        itemId: 'operating-profit', // Operating Profit metric
        addedAt: new Date('2024-11-03T16:45:00+08:00'),
      },
      {
        id: 'material-nerve-5',
        type: 'internal-pulse',
        itemId: 'net-profit', // Net Profit metric
        addedAt: new Date('2024-11-03T16:50:00+08:00'),
      },
      {
        id: 'material-nerve-6',
        type: 'internal-pulse',
        itemId: 'total-revenue', // Total Revenue metric
        addedAt: new Date('2024-11-03T16:55:00+08:00'),
      },
    ],
  },
  {
    id: 'meeting-3',
    title: 'MFG squad daily check-in',
    startTime: new Date('2024-11-03T17:30:00+08:00'), // 5:30 PM GMT+8
    endTime: new Date('2024-11-03T18:00:00+08:00'), // 6 PM GMT+8
    location: 'Virtual',
    organizer: 'Manufacturing Team',
    attendees: [
      {
        name: 'CEO',
        email: 'ceo@company.com',
        role: 'Participant',
        isRequired: true,
      },
      {
        name: 'Manufacturing Director',
        email: 'mfg@company.com',
        role: 'Presenter',
        isRequired: true,
      },
      {
        name: 'Operations Manager',
        email: 'ops@company.com',
        role: 'Participant',
        isRequired: false,
      },
    ],
    description: 'Daily manufacturing status check',
    meetingType: 'check-in',
    materials: [],
  },
  {
    id: 'meeting-4',
    title: 'Finance Review',
    startTime: new Date('2024-11-03T10:00:00+08:00'), // 10 AM GMT+8
    endTime: new Date('2024-11-03T11:30:00+08:00'), // 11:30 AM GMT+8
    location: 'Executive Conference Room',
    organizer: 'CFO',
    attendees: [
      {
        name: 'CEO',
        email: 'ceo@company.com',
        role: 'Chair',
        isRequired: true,
      },
      {
        name: 'CFO',
        email: 'cfo@company.com',
        role: 'Presenter',
        isRequired: true,
      },
      {
        name: 'VP Finance',
        email: 'vpfinance@company.com',
        role: 'Participant',
        isRequired: true,
      },
      {
        name: 'Finance Director',
        email: 'findir@company.com',
        role: 'Participant',
        isRequired: false,
      },
      {
        name: 'Financial Analyst',
        email: 'analyst@company.com',
        role: 'Support',
        isRequired: false,
      },
    ],
    description:
      'Monthly finance review meeting to discuss financial performance, forecasts, and strategic financial decisions',
    meetingType: 'finance-review',
    materials: [],
  },
  {
    id: 'meeting-5',
    title:
      'Cathay Pacific Airways (CX) #328 | Confirmation Code: DMWROK | Nov 03, 6:35 PM HKT -> Nov 03, 8:55 PM CST',
    startTime: new Date('2024-11-03T18:35:00+08:00'), // 6:35 PM GMT+8
    endTime: new Date('2024-11-03T20:55:00+08:00'), // 8:55 PM GMT+8
    location: 'Hong Kong International Airport -> Shanghai Pudong Airport',
    organizer: 'Travel Department',
    attendees: [
      {
        name: 'CEO',
        email: 'ceo@company.com',
        role: 'Passenger',
        isRequired: true,
      },
    ],
    description: 'Flight from Hong Kong to Shanghai',
    meetingType: 'travel',
    materials: [],
  },
  {
    id: 'meeting-6',
    title:
      'W SUZHOU | Confirmation#76525315 | PNR: EQDPZF Bldg 7 Suzhou Center. Suzhou',
    startTime: new Date('2024-11-03T23:00:00+08:00'), // 11 PM GMT+8
    endTime: new Date('2024-11-04T12:00:00+08:00'), // Next day checkout
    location: 'W Suzhou, Bldg 7 Suzhou Center',
    organizer: 'Travel Department',
    attendees: [
      {
        name: 'CEO',
        email: 'ceo@company.com',
        role: 'Guest',
        isRequired: true,
      },
    ],
    description: 'Hotel reservation in Suzhou',
    meetingType: 'travel',
    materials: [],
  },
];
