import type { Meeting } from '../types';

// Mock calendar events for Nov 17-21, 2025 (Monday-Friday)
export const mockCalendarEvents: Meeting[] = [
  // Monday, November 17th
  {
    id: 'meeting-monday-1',
    title: 'Weekly Leadership Standup',
    startTime: new Date('2025-11-17T09:00:00+08:00'), // 9 AM GMT+8
    endTime: new Date('2025-11-17T09:30:00+08:00'), // 9:30 AM GMT+8
    location: 'Executive Conference Room',
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
    ],
    description:
      'Weekly leadership team standup to review priorities and blockers',
    meetingType: 'general',
    materials: [],
    isCritical: false,
  },
  {
    id: 'meeting-monday-2',
    title: 'Q4 Sales Pipeline Review',
    startTime: new Date('2025-11-17T10:00:00+08:00'), // 10 AM GMT+8
    endTime: new Date('2025-11-17T11:30:00+08:00'), // 11:30 AM GMT+8
    location: 'Sales Conference Room',
    organizer: 'CMO',
    attendees: [
      {
        name: 'CEO',
        email: 'ceo@company.com',
        role: 'Participant',
        isRequired: true,
      },
      {
        name: 'CMO',
        email: 'cmo@company.com',
        role: 'Presenter',
        isRequired: true,
      },
      {
        name: 'VP Sales',
        email: 'vpsales@company.com',
        role: 'Presenter',
        isRequired: true,
      },
      {
        name: 'Head of Sales - Americas',
        email: 'sales-americas@company.com',
        role: 'Presenter',
        isRequired: true,
      },
      {
        name: 'Head of Sales - APAC',
        email: 'sales-apac@company.com',
        role: 'Presenter',
        isRequired: true,
      },
    ],
    description:
      'Review Q4 sales pipeline, forecast accuracy, and key deals in progress',
    meetingType: 'finance-review',
    materials: [],
    isCritical: false,
  },
  {
    id: 'meeting-monday-3',
    title: '[Block] Focus Time',
    startTime: new Date('2025-11-17T14:00:00+08:00'), // 2 PM GMT+8
    endTime: new Date('2025-11-17T16:00:00+08:00'), // 4 PM GMT+8
    location: 'Office',
    organizer: 'CEO',
    attendees: [
      {
        name: 'CEO',
        email: 'ceo@company.com',
        role: 'Participant',
        isRequired: false,
      },
    ],
    description: 'Blocked time for focused work',
    meetingType: 'general',
    materials: [],
    isCritical: false,
  },
  {
    id: 'meeting-monday-4',
    title: 'Product Roadmap Review - Q1 2026',
    startTime: new Date('2025-11-17T16:30:00+08:00'), // 4:30 PM GMT+8
    endTime: new Date('2025-11-17T17:30:00+08:00'), // 5:30 PM GMT+8
    location: 'Product Conference Room',
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
        name: 'CTO',
        email: 'cto@company.com',
        role: 'Participant',
        isRequired: true,
      },
      {
        name: 'Product Manager',
        email: 'pm@company.com',
        role: 'Presenter',
        isRequired: true,
      },
    ],
    description:
      'Review and approve Q1 2026 product roadmap and strategic initiatives',
    meetingType: 'general',
    materials: [],
    isCritical: false,
  },
  {
    id: 'meeting-monday-5',
    title: 'Strategic Planning Session - 2026 Budget Approval',
    startTime: new Date('2025-11-17T11:30:00+08:00'), // 11:30 AM GMT+8
    endTime: new Date('2025-11-17T13:00:00+08:00'), // 1:00 PM GMT+8
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
      'Critical strategic planning session to review and approve 2026 annual budget, capital allocation, and strategic investment priorities. Key decisions on headcount, R&D spending, and market expansion initiatives.',
    meetingType: 'finance-review',
    materials: [],
    isCritical: true,
  },
  {
    id: 'meeting-monday-6',
    title: 'Board Pre-Read: Q4 Performance & 2026 Strategy',
    startTime: new Date('2025-11-17T14:30:00+08:00'), // 2:30 PM GMT+8
    endTime: new Date('2025-11-17T16:30:00+08:00'), // 4:30 PM GMT+8
    location: 'Executive Conference Room',
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
        role: 'Presenter',
        isRequired: true,
      },
      {
        name: 'COO',
        email: 'coo@company.com',
        role: 'Presenter',
        isRequired: true,
      },
      {
        name: 'VP Strategy',
        email: 'vpstrategy@company.com',
        role: 'Presenter',
        isRequired: true,
      },
      {
        name: 'Head of Investor Relations',
        email: 'ir@company.com',
        role: 'Support',
        isRequired: true,
      },
    ],
    description:
      'Critical board pre-read meeting to finalize Q4 performance presentation and 2026 strategic plan. Review key metrics, financial results, risk factors, and prepare for board meeting on Tuesday. Ensure all board materials are complete and aligned.',
    meetingType: 'finance-review',
    materials: [],
    isCritical: true,
  },
  // Tuesday, November 18th
  {
    id: 'meeting-tuesday-1',
    title: 'All-Hands Meeting Preparation',
    startTime: new Date('2025-11-18T09:00:00+08:00'), // 9 AM GMT+8
    endTime: new Date('2025-11-18T10:00:00+08:00'), // 10 AM GMT+8
    location: 'Executive Conference Room',
    organizer: 'CEO',
    attendees: [
      {
        name: 'CEO',
        email: 'ceo@company.com',
        role: 'Chair',
        isRequired: true,
      },
      {
        name: 'CHRO',
        email: 'chro@company.com',
        role: 'Participant',
        isRequired: true,
      },
      {
        name: 'VP Communications',
        email: 'vpcomms@company.com',
        role: 'Support',
        isRequired: true,
      },
    ],
    description:
      'Prepare agenda and key messages for upcoming all-hands meeting',
    meetingType: 'general',
    materials: [],
    isCritical: false,
  },
  {
    id: 'meeting-tuesday-2',
    title: 'Supply Chain Risk Assessment',
    startTime: new Date('2025-11-18T10:30:00+08:00'), // 10:30 AM GMT+8
    endTime: new Date('2025-11-18T11:30:00+08:00'), // 11:30 AM GMT+8
    location: 'Operations Conference Room',
    organizer: 'COO',
    attendees: [
      {
        name: 'CEO',
        email: 'ceo@company.com',
        role: 'Participant',
        isRequired: true,
      },
      {
        name: 'COO',
        email: 'coo@company.com',
        role: 'Presenter',
        isRequired: true,
      },
      {
        name: 'VP Supply Chain',
        email: 'vpsupply@company.com',
        role: 'Presenter',
        isRequired: true,
      },
      {
        name: 'Head of Procurement',
        email: 'procurement@company.com',
        role: 'Participant',
        isRequired: true,
      },
    ],
    description:
      'Review supply chain risks, supplier relationships, and contingency plans',
    meetingType: 'general',
    materials: [],
    isCritical: false,
  },
  {
    id: 'meeting-tuesday-3',
    title: '[Block] Lunch',
    startTime: new Date('2025-11-18T12:00:00+08:00'), // 12 PM GMT+8
    endTime: new Date('2025-11-18T13:00:00+08:00'), // 1 PM GMT+8
    location: 'Restaurant',
    organizer: 'CEO',
    attendees: [
      {
        name: 'CEO',
        email: 'ceo@company.com',
        role: 'Participant',
        isRequired: false,
      },
    ],
    description: 'Lunch break',
    meetingType: 'general',
    materials: [],
    isCritical: false,
  },
  {
    id: 'meeting-2',
    title: 'Nerve Center Problem Solving',
    startTime: new Date('2025-11-19T17:15:00+08:00'), // 5 PM GMT+8
    endTime: new Date('2025-11-19T18:30:00+08:00'), // 5:30 PM GMT+8
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
        id: 'material-nerve-6',
        type: 'internal-pulse',
        itemId: 'total-revenue', // Total Revenue metric
        addedAt: new Date('2025-11-19T16:55:00+08:00'),
      },
    ],
  },
  {
    id: 'meeting-5',
    title:
      'Cathay Pacific Airways (CX) #123 | Confirmation Code: 79XYZ | Nov 03, 6:35 PM HKT -> Nov 03, 8:55 PM CST',
    startTime: new Date('2025-11-19T19:35:00+08:00'), // 6:35 PM GMT+8
    endTime: new Date('2025-11-19T21:55:00+08:00'), // 8:55 PM GMT+8
    location: 'Hong Kong International Airport -> Taipei Taoyuan Airport',
    organizer: 'Travel Department',
    attendees: [
      {
        name: 'CEO',
        email: 'ceo@company.com',
        role: 'Passenger',
        isRequired: true,
      },
    ],
    description: 'Flight from Hong Kong to Taipei',
    meetingType: 'travel',
    materials: [],
  },
  {
    id: 'meeting-6',
    title:
      'W Taipei | Confirmation#12325315 | PNR: XYZABCD Bldg 7 Taipei Center. Taipei',
    startTime: new Date('2025-11-19T23:00:00+08:00'), // 11 PM GMT+8
    endTime: new Date('2025-11-19T12:00:00+08:00'), // Next day checkout
    location: 'W Taipei, Bldg 7 Taipei Center',
    organizer: 'Travel Department',
    attendees: [
      {
        name: 'CEO',
        email: 'ceo@company.com',
        role: 'Guest',
        isRequired: true,
      },
    ],
    description: 'Hotel reservation in Taipei',
    meetingType: 'travel',
    materials: [],
  },
  {
    id: 'meeting-7',
    title: 'BU Monthly Financial Review - Q4',
    startTime: new Date('2025-11-19T15:00:00+08:00'), // 2:30 PM GMT+8
    endTime: new Date('2025-11-19T16:00:00+08:00'), // 4 PM GMT+8
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
    startTime: new Date('2025-11-19T08:30:00+08:00'), // 8:30 AM GMT+8
    endTime: new Date('2025-11-19T10:00:00+08:00'), // 9:45 AM GMT+8
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
    materials: [
      {
        id: 'material-nerve-1',
        type: 'external-pulse',
        itemId: 'news-1', // US Announces 25% Tariff on Chinese-Made EV Connectors
        addedAt: new Date('2025-11-19T16:30:00+08:00'),
      },
      {
        id: 'material-nerve-2',
        type: 'external-pulse',
        itemId: 'news-3', // EV OEM Q3 Earnings Beat Expectations
        addedAt: new Date('2025-11-19T16:35:00+08:00'),
      },
      {
        id: 'material-nerve-3',
        type: 'external-pulse',
        itemId: 'news-5', // Global 5G Infrastructure Investment
        addedAt: new Date('2025-11-19T16:40:00+08:00'),
      },
      // Internal Pulse Materials
      {
        id: 'material-nerve-4',
        type: 'internal-pulse',
        itemId: 'operating-profit', // Operating Profit metric
        addedAt: new Date('2025-11-19T16:45:00+08:00'),
      },
      {
        id: 'material-nerve-5',
        type: 'internal-pulse',
        itemId: 'net-profit', // Net Profit metric
        addedAt: new Date('2025-11-19T16:50:00+08:00'),
      },
    ],
    isCritical: true,
  },
  {
    id: 'meeting-lunch',
    title: '[Block] Team lunch',
    startTime: new Date('2025-11-19T11:30:00+08:00'), // 11:30 AM GMT+8
    endTime: new Date('2025-11-19T13:00:00+08:00'), // 1:00 PM GMT+8
    location: 'Restaurant',
    organizer: 'CEO',
    attendees: [
      {
        name: 'CEO',
        email: 'ceo@company.com',
        role: 'Participant',
        isRequired: false,
      },
    ],
    description: 'Team lunch',
    meetingType: 'general',
    materials: [],
    isCritical: false,
  },
  {
    id: 'meeting-11',
    title: 'DSM - Tokyo team',
    startTime: new Date('2025-11-19T08:00:00+08:00'), // 7:30 AM GMT+8
    endTime: new Date('2025-11-19T08:10:00+08:00'), // 8:30 AM GMT+8
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
    isCritical: false,
  },
  {
    id: 'meeting-13',
    title: '[Catch up] 1 on 1 with Jack',
    startTime: new Date('2025-11-19T13:00:00+08:00'), // 12:45 PM GMT+8
    endTime: new Date('2025-11-19T13:30:00+08:00'), // 1:15 PM GMT+8
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
        name: 'Customer CEO',
        email: 'ceo@customer.com',
        role: 'Customer CEO',
        isRequired: true,
      },
      {
        name: 'Customer COO',
        email: 'coo@customer.com',
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
    isCritical: false,
  },
  {
    id: 'meeting-14',
    title: 'Executive Meeting - Strategic Partner',
    startTime: new Date('2025-11-19T14:00:00+08:00'), // 2 PM GMT+8
    endTime: new Date('2025-11-19T15:00:00+08:00'), // 3:30 PM GMT+8
    location: 'Partner Headquarters',
    organizer: 'CEO',
    attendees: [
      {
        name: 'CEO',
        email: 'ceo@company.com',
        role: 'Host',
        isRequired: true,
      },
      {
        name: 'Partner CEO',
        email: 'ceo@partner.com',
        role: 'Customer CEO',
        isRequired: true,
      },
      {
        name: 'Partner COO',
        email: 'coo@partner.com',
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
      'Strategic partnership discussion with partner leadership on data center solutions, supply chain collaboration, and joint go-to-market initiatives. Need to bring the Q4 partnership deck and product roadmap presentation.',
    meetingType: 'general',
    materials: [],
    isCritical: true,
  },
  {
    id: 'meeting-16',
    title: 'Board of Directors Meeting - Q4 Strategic Review',
    startTime: new Date('2025-11-18T14:00:00+08:00'), // 2 PM GMT+8, Tuesday
    endTime: new Date('2025-11-18T17:00:00+08:00'), // 5 PM GMT+8
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
        role: 'Presenter',
        isRequired: true,
      },
      {
        name: 'COO',
        email: 'coo@company.com',
        role: 'Presenter',
        isRequired: true,
      },
      {
        name: 'Board Chair',
        email: 'boardchair@company.com',
        role: 'Participant',
        isRequired: true,
      },
      {
        name: 'Independent Director - Finance',
        email: 'director.finance@company.com',
        role: 'Participant',
        isRequired: true,
      },
      {
        name: 'Independent Director - Technology',
        email: 'director.tech@company.com',
        role: 'Participant',
        isRequired: true,
      },
      {
        name: 'VP Strategy',
        email: 'vpstrategy@company.com',
        role: 'Support',
        isRequired: true,
      },
    ],
    description:
      'Quarterly board meeting to review Q4 strategic initiatives, financial performance, risk management, and approve 2025 strategic plan. Key agenda items include M&A pipeline review, capital allocation strategy, and executive succession planning.',
    meetingType: 'finance-review',
    materials: [],
    isCritical: true,
  },
  // Thursday, November 20th
  {
    id: 'meeting-thursday-1',
    title: 'Customer Advisory Board - Q4 Session',
    startTime: new Date('2025-11-20T09:00:00+08:00'), // 9 AM GMT+8
    endTime: new Date('2025-11-20T11:00:00+08:00'), // 11 AM GMT+8
    location: 'Grand Ballroom',
    organizer: 'CMO',
    attendees: [
      {
        name: 'CEO',
        email: 'ceo@company.com',
        role: 'Host',
        isRequired: true,
      },
      {
        name: 'CMO',
        email: 'cmo@company.com',
        role: 'Presenter',
        isRequired: true,
      },
      {
        name: 'CPO',
        email: 'cpo@company.com',
        role: 'Presenter',
        isRequired: true,
      },
      {
        name: 'VP Customer Success',
        email: 'vpcustomersuccess@company.com',
        role: 'Support',
        isRequired: true,
      },
    ],
    description:
      'Quarterly customer advisory board meeting to gather feedback on product roadmap and strategic direction',
    meetingType: 'general',
    materials: [],
    isCritical: true,
  },
  {
    id: 'meeting-thursday-2',
    title: 'Technology Strategy Review',
    startTime: new Date('2025-11-20T13:30:00+08:00'), // 1:30 PM GMT+8
    endTime: new Date('2025-11-20T15:00:00+08:00'), // 3 PM GMT+8
    location: 'Tech Conference Room',
    organizer: 'CTO',
    attendees: [
      {
        name: 'CEO',
        email: 'ceo@company.com',
        role: 'Participant',
        isRequired: true,
      },
      {
        name: 'CTO',
        email: 'cto@company.com',
        role: 'Presenter',
        isRequired: true,
      },
      {
        name: 'VP Engineering',
        email: 'vpeng@company.com',
        role: 'Presenter',
        isRequired: true,
      },
      {
        name: 'VP Architecture',
        email: 'vparc@company.com',
        role: 'Participant',
        isRequired: true,
      },
    ],
    description:
      'Review technology strategy, infrastructure investments, and innovation initiatives',
    meetingType: 'general',
    materials: [],
    isCritical: false,
  },
  {
    id: 'meeting-thursday-3',
    title: 'M&A Pipeline Review',
    startTime: new Date('2025-11-20T15:30:00+08:00'), // 3:30 PM GMT+8
    endTime: new Date('2025-11-20T17:00:00+08:00'), // 5 PM GMT+8
    location: 'Board Room',
    organizer: 'VP Strategy',
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
        role: 'Presenter',
        isRequired: true,
      },
      {
        name: 'Head of Corporate Development',
        email: 'corpdev@company.com',
        role: 'Presenter',
        isRequired: true,
      },
    ],
    description:
      'Review M&A pipeline, potential targets, and strategic acquisition opportunities',
    meetingType: 'finance-review',
    materials: [],
    isCritical: true,
  },
  // Friday, November 21st
  {
    id: 'meeting-friday-1',
    title: 'Weekly Executive Briefing',
    startTime: new Date('2025-11-21T08:30:00+08:00'), // 8:30 AM GMT+8
    endTime: new Date('2025-11-21T09:30:00+08:00'), // 9:30 AM GMT+8
    location: 'Executive Conference Room',
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
    ],
    description:
      'Weekly executive briefing on key metrics, initiatives, and strategic priorities',
    meetingType: 'general',
    materials: [],
    isCritical: false,
  },
  {
    id: 'meeting-friday-2',
    title: 'Q4 Marketing Campaign Review',
    startTime: new Date('2025-11-21T10:00:00+08:00'), // 10 AM GMT+8
    endTime: new Date('2025-11-21T11:00:00+08:00'), // 11 AM GMT+8
    location: 'Marketing Conference Room',
    organizer: 'CMO',
    attendees: [
      {
        name: 'CEO',
        email: 'ceo@company.com',
        role: 'Participant',
        isRequired: true,
      },
      {
        name: 'CMO',
        email: 'cmo@company.com',
        role: 'Presenter',
        isRequired: true,
      },
      {
        name: 'VP Marketing',
        email: 'vpmarketing@company.com',
        role: 'Presenter',
        isRequired: true,
      },
      {
        name: 'Head of Brand',
        email: 'brand@company.com',
        role: 'Participant',
        isRequired: false,
      },
    ],
    description:
      'Review Q4 marketing campaign performance, ROI, and plan for Q1 2026',
    meetingType: 'general',
    materials: [],
    isCritical: false,
  },
  {
    id: 'meeting-friday-3',
    title: '[Block] Lunch with Board Chair',
    startTime: new Date('2025-11-21T12:00:00+08:00'), // 12 PM GMT+8
    endTime: new Date('2025-11-21T13:30:00+08:00'), // 1:30 PM GMT+8
    location: 'Private Dining Room',
    organizer: 'CEO',
    attendees: [
      {
        name: 'CEO',
        email: 'ceo@company.com',
        role: 'Host',
        isRequired: true,
      },
      {
        name: 'Board Chair',
        email: 'boardchair@company.com',
        role: 'Guest',
        isRequired: true,
      },
    ],
    description:
      'Informal lunch meeting with board chair to discuss strategic matters',
    meetingType: 'general',
    materials: [],
    isCritical: false,
  },
  {
    id: 'meeting-17',
    title: 'Investor Relations - Q4 Earnings Preview',
    startTime: new Date('2025-11-21T15:00:00+08:00'), // 3 PM GMT+8, Friday
    endTime: new Date('2025-11-21T16:30:00+08:00'), // 4:30 PM GMT+8
    location: 'Executive Conference Room',
    organizer: 'CFO',
    attendees: [
      {
        name: 'CEO',
        email: 'ceo@company.com',
        role: 'Presenter',
        isRequired: true,
      },
      {
        name: 'CFO',
        email: 'cfo@company.com',
        role: 'Presenter',
        isRequired: true,
      },
      {
        name: 'Head of Investor Relations',
        email: 'ir@company.com',
        role: 'Presenter',
        isRequired: true,
      },
      {
        name: 'VP Finance',
        email: 'vpfinance@company.com',
        role: 'Support',
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
      'Critical preparation meeting for Q4 earnings announcement. Review financial results, key metrics, forward guidance, and messaging strategy. Finalize earnings presentation deck and prepare for analyst Q&A session. Ensure alignment on revenue recognition, margin trends, and strategic initiatives to highlight.',
    meetingType: 'finance-review',
    materials: [],
    isCritical: true,
  },
];
