import type { Meeting } from '../types';

// Mock calendar events for Nov 4, 2024 (Monday)
export const mockCalendarEvents: Meeting[] = [
  {
    id: 'meeting-1',
    title:
      'Canceled: Interview - Technical Experience Interview + Personal Experience Interview',
    startTime: new Date('2024-11-04T13:00:00+08:00'), // 1 PM GMT+8
    endTime: new Date('2024-11-04T14:00:00+08:00'), // 2 PM GMT+8
    location: 'Virtual',
    organizer: 'Recruiting',
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
    startTime: new Date('2024-11-04T17:00:00+08:00'), // 5 PM GMT+8
    endTime: new Date('2024-11-04T17:30:00+08:00'), // 5:30 PM GMT+8
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
        addedAt: new Date('2024-11-04T16:30:00+08:00'),
      },
      {
        id: 'material-nerve-2',
        type: 'external-pulse',
        itemId: 'news-3', // Tesla Q3 Earnings Beat Expectations
        addedAt: new Date('2024-11-04T16:35:00+08:00'),
      },
      {
        id: 'material-nerve-3',
        type: 'external-pulse',
        itemId: 'news-5', // Global 5G Infrastructure Investment
        addedAt: new Date('2024-11-04T16:40:00+08:00'),
      },
      // Internal Pulse Materials
      {
        id: 'material-nerve-4',
        type: 'internal-pulse',
        itemId: 'operating-profit', // Operating Profit metric
        addedAt: new Date('2024-11-04T16:45:00+08:00'),
      },
      {
        id: 'material-nerve-5',
        type: 'internal-pulse',
        itemId: 'net-profit', // Net Profit metric
        addedAt: new Date('2024-11-04T16:50:00+08:00'),
      },
      {
        id: 'material-nerve-6',
        type: 'internal-pulse',
        itemId: 'total-revenue', // Total Revenue metric
        addedAt: new Date('2024-11-04T16:55:00+08:00'),
      },
    ],
  },
  {
    id: 'meeting-3',
    title: 'MFG squad daily check-in',
    startTime: new Date('2024-11-04T17:30:00+08:00'), // 5:30 PM GMT+8
    endTime: new Date('2024-11-04T18:00:00+08:00'), // 6 PM GMT+8
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
    startTime: new Date('2024-11-04T10:00:00+08:00'), // 10 AM GMT+8
    endTime: new Date('2024-11-04T11:30:00+08:00'), // 11:30 AM GMT+8
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
    isCritical: true,
  },
  {
    id: 'meeting-5',
    title:
      'Cathay Pacific Airways (CX) #328 | Confirmation Code: DMWROK | Nov 03, 6:35 PM HKT -> Nov 03, 8:55 PM CST',
    startTime: new Date('2024-11-04T18:35:00+08:00'), // 6:35 PM GMT+8
    endTime: new Date('2024-11-04T20:55:00+08:00'), // 8:55 PM GMT+8
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
    startTime: new Date('2024-11-04T23:00:00+08:00'), // 11 PM GMT+8
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
  {
    id: 'meeting-7',
    title: 'BU Monthly Financial Review - Q4',
    startTime: new Date('2024-11-04T08:30:00+08:00'), // 8:30 AM GMT+8
    endTime: new Date('2024-11-04T09:45:00+08:00'), // 9:45 AM GMT+8
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
        name: 'BU President - Americas',
        email: 'bu-americas@company.com',
        role: 'Presenter',
        isRequired: true,
      },
      {
        name: 'BU President - APAC',
        email: 'bu-apac@company.com',
        role: 'Presenter',
        isRequired: true,
      },
      {
        name: 'BU President - EMEA',
        email: 'bu-emea@company.com',
        role: 'Presenter',
        isRequired: true,
      },
      {
        name: 'VP Finance',
        email: 'vpfinance@company.com',
        role: 'Participant',
        isRequired: true,
      },
    ],
    description:
      'Monthly review of financial performance across all business units, including revenue, profitability, and key metrics',
    meetingType: 'finance-review',
    materials: [],
    isCritical: true,
  },
  {
    id: 'meeting-8',
    title: 'Full Year Forecast Discussion',
    startTime: new Date('2024-11-04T14:30:00+08:00'), // 2:30 PM GMT+8
    endTime: new Date('2024-11-04T16:00:00+08:00'), // 4 PM GMT+8
    location: 'Board Room',
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
        name: 'COO',
        email: 'coo@company.com',
        role: 'Participant',
        isRequired: true,
      },
      {
        name: 'CTO',
        email: 'cto@company.com',
        role: 'Participant',
        isRequired: true,
      },
      {
        name: 'CMO',
        email: 'cmo@company.com',
        role: 'Participant',
        isRequired: true,
      },
      {
        name: 'VP Strategy',
        email: 'vpstrategy@company.com',
        role: 'Participant',
        isRequired: true,
      },
      {
        name: 'Head of FP&A',
        email: 'fpanda@company.com',
        role: 'Support',
        isRequired: true,
      },
    ],
    description:
      'Strategic discussion on full year forecast, scenario planning, and key assumptions for 2025 planning',
    meetingType: 'finance-review',
    materials: [],
    isCritical: true,
  },
  {
    id: 'meeting-9',
    title: 'Weekly Procurement Review',
    startTime: new Date('2024-11-04T11:45:00+08:00'), // 11:45 AM GMT+8
    endTime: new Date('2024-11-04T12:30:00+08:00'), // 12:30 PM GMT+8
    location: 'Executive Conference Room',
    organizer: 'CPO',
    attendees: [
      {
        name: 'CEO',
        email: 'ceo@company.com',
        role: 'Participant',
        isRequired: true,
      },
      {
        name: 'CPO',
        email: 'cpo@company.com',
        role: 'Presenter',
        isRequired: true,
      },
      {
        name: 'COO',
        email: 'coo@company.com',
        role: 'Participant',
        isRequired: true,
      },
      {
        name: 'VP Procurement',
        email: 'vpprocurement@company.com',
        role: 'Presenter',
        isRequired: true,
      },
      {
        name: 'Director Supply Chain',
        email: 'supplychain@company.com',
        role: 'Participant',
        isRequired: false,
      },
    ],
    description:
      'Weekly review of procurement activities, supplier performance, cost optimization opportunities, and supply chain risks',
    meetingType: 'check-in',
    materials: [],
  },
  {
    id: 'meeting-10',
    title: 'Customer Executive Meeting - TechCorp Global',
    startTime: new Date('2024-11-04T16:00:00+08:00'), // 4 PM GMT+8
    endTime: new Date('2024-11-04T16:45:00+08:00'), // 4:45 PM GMT+8
    location: 'Virtual',
    organizer: 'CEO',
    attendees: [
      {
        name: 'CEO',
        email: 'ceo@company.com',
        role: 'Host',
        isRequired: true,
      },
      {
        name: 'John Smith',
        email: 'john.smith@techcorp.com',
        role: 'Customer CEO',
        isRequired: true,
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@techcorp.com',
        role: 'Customer CTO',
        isRequired: true,
      },
      {
        name: 'CMO',
        email: 'cmo@company.com',
        role: 'Participant',
        isRequired: true,
      },
      {
        name: 'VP Sales',
        email: 'vpsales@company.com',
        role: 'Support',
        isRequired: false,
      },
    ],
    description:
      'Strategic discussion with TechCorp Global leadership on partnership expansion, product roadmap alignment, and joint initiatives',
    meetingType: 'general',
    materials: [],
    isCritical: true,
  },
  {
    id: 'meeting-11',
    title: 'C-Suite Strategy Review',
    startTime: new Date('2024-11-04T07:30:00+08:00'), // 7:30 AM GMT+8
    endTime: new Date('2024-11-04T08:30:00+08:00'), // 8:30 AM GMT+8
    location: 'Board Room',
    organizer: 'CEO',
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
        role: 'Participant',
        isRequired: true,
      },
      {
        name: 'COO',
        email: 'coo@company.com',
        role: 'Participant',
        isRequired: true,
      },
      {
        name: 'CTO',
        email: 'cto@company.com',
        role: 'Participant',
        isRequired: true,
      },
      {
        name: 'CMO',
        email: 'cmo@company.com',
        role: 'Participant',
        isRequired: true,
      },
      {
        name: 'CHRO',
        email: 'chro@company.com',
        role: 'Participant',
        isRequired: true,
      },
      {
        name: 'CPO',
        email: 'cpo@company.com',
        role: 'Participant',
        isRequired: true,
      },
    ],
    description:
      'Monthly C-suite strategy review covering strategic initiatives, organizational priorities, and cross-functional alignment',
    meetingType: 'general',
    materials: [],
    isCritical: true,
  },
  {
    id: 'meeting-12',
    title: 'Board Meeting Preparation',
    startTime: new Date('2024-11-04T16:45:00+08:00'), // 4:45 PM GMT+8
    endTime: new Date('2024-11-04T17:00:00+08:00'), // 5 PM GMT+8
    location: 'CEO Office',
    organizer: 'CEO',
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
        role: 'Participant',
        isRequired: true,
      },
      {
        name: 'VP Strategy',
        email: 'vpstrategy@company.com',
        role: 'Support',
        isRequired: true,
      },
      {
        name: 'Executive Assistant',
        email: 'ea@company.com',
        role: 'Support',
        isRequired: false,
      },
    ],
    description:
      'Preparation session for upcoming board meeting, reviewing materials, key messages, and strategic topics',
    meetingType: 'general',
    materials: [],
  },
  {
    id: 'meeting-13',
    title: 'Customer Executive Meeting - Global Manufacturing Inc.',
    startTime: new Date('2024-11-04T12:45:00+08:00'), // 12:45 PM GMT+8
    endTime: new Date('2024-11-04T13:15:00+08:00'), // 1:15 PM GMT+8
    location: 'Virtual',
    organizer: 'CEO',
    attendees: [
      {
        name: 'CEO',
        email: 'ceo@company.com',
        role: 'Host',
        isRequired: true,
      },
      {
        name: 'Jack Chen',
        email: 'michael.chen@gmfg.com',
        role: 'Customer CEO',
        isRequired: true,
      },
      {
        name: 'Lisa Wang',
        email: 'lisa.wang@gmfg.com',
        role: 'Customer COO',
        isRequired: true,
      },
      {
        name: 'COO',
        email: 'coo@company.com',
        role: 'Participant',
        isRequired: true,
      },
    ],
    description:
      'Quarterly business review with Global Manufacturing Inc. leadership on operational excellence and supply chain collaboration',
    meetingType: 'general',
    materials: [],
    isCritical: true,
  },
  {
    id: 'meeting-14',
    title: 'Customer Executive Meeting - Dell Technologies',
    startTime: new Date('2024-11-07T14:00:00+08:00'), // 2 PM GMT+8, Thursday
    endTime: new Date('2024-11-07T15:30:00+08:00'), // 3:30 PM GMT+8
    location: 'Dell Headquarters, Round Rock, TX',
    organizer: 'CEO',
    attendees: [
      {
        name: 'CEO',
        email: 'ceo@company.com',
        role: 'Host',
        isRequired: true,
      },
      {
        name: 'Michael Dell',
        email: 'michael.dell@dell.com',
        role: 'Customer CEO',
        isRequired: true,
      },
      {
        name: 'Jeff Clarke',
        email: 'jeff.clarke@dell.com',
        role: 'Customer COO',
        isRequired: true,
      },
      {
        name: 'CMO',
        email: 'cmo@company.com',
        role: 'Participant',
        isRequired: true,
      },
      {
        name: 'VP Sales',
        email: 'vpsales@company.com',
        role: 'Support',
        isRequired: false,
      },
    ],
    description:
      'Strategic partnership discussion with Dell leadership on data center solutions, supply chain collaboration, and joint go-to-market initiatives. Need to bring the Q4 partnership deck and product roadmap presentation.',
    meetingType: 'general',
    materials: [],
    isCritical: true,
  },
  {
    id: 'meeting-15',
    title: 'Procurement Strategy Review - Q4 Planning',
    startTime: new Date('2024-11-07T10:00:00+08:00'), // 10 AM GMT+8, Thursday
    endTime: new Date('2024-11-07T12:00:00+08:00'), // 12 PM GMT+8
    location: 'Executive Conference Room',
    organizer: 'CPO',
    attendees: [
      {
        name: 'CEO',
        email: 'ceo@company.com',
        role: 'Chair',
        isRequired: true,
      },
      {
        name: 'CPO',
        email: 'cpo@company.com',
        role: 'Presenter',
        isRequired: true,
      },
      {
        name: 'Xiaochen Guo',
        email: 'xiaochen.guo@company.com',
        role: 'Presenter',
        isRequired: true,
      },
      {
        name: 'COO',
        email: 'coo@company.com',
        role: 'Participant',
        isRequired: true,
      },
      {
        name: 'VP Procurement',
        email: 'vpprocurement@company.com',
        role: 'Support',
        isRequired: true,
      },
    ],
    description:
      'Quarterly procurement strategy review covering supplier diversification, cost optimization initiatives, and supply chain risk mitigation. Double check with Xiaochen on the status of alternative rare earth supplier negotiations and Vietnam production shift timeline.',
    meetingType: 'finance-review',
    materials: [],
    isCritical: true,
  },
];
