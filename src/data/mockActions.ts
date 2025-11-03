import type { Action } from '../types';
import { addDays, subDays } from 'date-fns';

export const mockActions: Action[] = [
  {
    id: 'action-1',
    title: 'Investigate Vietnam production shift for US-bound EV connectors',
    description:
      'Assess feasibility of shifting 20% of EV connector production from China to Vietnam to avoid 25% US tariff. Analyze capacity, cost impact, timeline, and customer acceptance.',
    owner: 'Jennifer Wu - VP Operations',
    status: 'in-progress',
    priority: 'high',
    dueDate: addDays(new Date(), 7),
    createdDate: subDays(new Date(), 2),
    comments: [
      {
        id: 'comment-1-1',
        text: 'Priority 1. Please coordinate with sales team to understand customer timeline flexibility. We may need to accept short-term margin pressure to maintain relationships.',
        createdBy: 'CEO',
        createdAt: subDays(new Date(), 1),
      },
    ],
  },
  {
    id: 'action-2',
    title: 'Secure alternative rare earth material suppliers',
    description:
      'Accelerate negotiations with Australian and US-based rare earth suppliers. Target: signed agreements within 45 days to mitigate China export restrictions.',
    owner: 'Michael Chen - CPO',
    status: 'in-progress',
    priority: 'high',
    dueDate: addDays(new Date(), 14),
    createdDate: subDays(new Date(), 3),
    comments: [
      {
        id: 'comment-2-1',
        text: 'Approved budget increase up to $2M for supply chain diversification. Focus on long-term agreements with pricing protection.',
        createdBy: 'CEO',
        createdAt: subDays(new Date(), 2),
      },
    ],
  },
  {
    id: 'action-3',
    title: 'Strategic account review with Tesla procurement',
    description:
      'Schedule and prepare for strategic account meeting with Tesla to discuss capacity expansion opportunities. Tesla plans to double EV production by 2026.',
    owner: 'David Park - VP Sales',
    status: 'todo',
    priority: 'high',
    dueDate: addDays(new Date(), 10),
    createdDate: subDays(new Date(), 1),
    comments: [],
  },
  {
    id: 'action-4',
    title: 'Accelerate optical connector roadmap',
    description:
      'Respond to TE Connectivity acquisition of optical startup. Review and accelerate our optical connector development timeline by 6 months.',
    owner: 'Dr. Lisa Zhang - CTO',
    status: 'ready-for-review',
    priority: 'medium',
    dueDate: addDays(new Date(), 21),
    createdDate: subDays(new Date(), 1),
    comments: [],
  },
  {
    id: 'action-5',
    title: 'Increase 5G antenna connector production capacity',
    description:
      'With global 5G infrastructure investment at $200B, increase production capacity by 25% to capture market growth. Currently at 85% utilization.',
    owner: 'Jennifer Wu - VP Operations',
    status: 'todo',
    priority: 'medium',
    dueDate: addDays(new Date(), 30),
    createdDate: subDays(new Date(), 2),
    comments: [],
  },
  {
    id: 'action-6',
    title: 'Adjust Q1 2026 production plan for Apple AirPods delay',
    description:
      "Revise production schedule following Apple's AirPods Pro launch delay. Reallocate capacity to other TWS customers to maintain utilization.",
    owner: 'Jennifer Wu - VP Operations',
    status: 'in-progress',
    priority: 'medium',
    dueDate: addDays(new Date(), 7),
    createdDate: subDays(new Date(), 1),
    comments: [],
  },
  {
    id: 'action-7',
    title: 'Accelerate Nvidia GB300 program engagement',
    description:
      "Following Amphenol's strong data center results, accelerate our engagement with Nvidia GB300 server program. Target: design-in confirmation by Q1 2026.",
    owner: 'David Park - VP Sales',
    status: 'in-progress',
    priority: 'high',
    dueDate: addDays(new Date(), 14),
    createdDate: subDays(new Date(), 2),
    comments: [
      {
        id: 'comment-7-1',
        text: 'This is our top priority for AI data center business. Allocate additional engineering resources from R&D team to support this program.',
        createdBy: 'CEO',
        createdAt: subDays(new Date(), 1),
      },
    ],
  },
  {
    id: 'action-8',
    title: 'Review copper hedging strategy',
    description:
      'With copper prices up 15%, review hedging positions with CFO. Evaluate options for additional hedging or customer price adjustments.',
    owner: 'Mark Thompson - CFO',
    status: 'ready-for-review',
    priority: 'medium',
    dueDate: addDays(new Date(), 5),
    createdDate: subDays(new Date(), 1),
    comments: [],
  },
  {
    id: 'action-9',
    title: 'Qualify for Vietnam tax incentive program',
    description:
      'Engage with Vietnamese government to understand requirements for 10-year tax holiday. Potential $3-4M annual savings.',
    owner: 'Jennifer Wu - VP Operations',
    status: 'todo',
    priority: 'medium',
    dueDate: addDays(new Date(), 30),
    createdDate: subDays(new Date(), 1),
    comments: [],
  },
  {
    id: 'action-10',
    title: 'Schedule BYD Europe expansion discussion',
    description:
      'Meet with BYD Europe procurement team regarding their Hungary plant. Explore opportunity for local connector supply partnership.',
    owner: 'David Park - VP Sales',
    status: 'completed',
    priority: 'low',
    dueDate: addDays(new Date(), 45),
    createdDate: subDays(new Date(), 1),
    comments: [],
  },
  {
    id: 'action-11',
    title: 'Root cause analysis on UPPH underperformance',
    description:
      'UPPH at 2.3 vs budget of 2.6. Conduct detailed analysis of production line bottlenecks. L4 manufacturing initiative should improve to 2.6 in 3 days.',
    owner: 'Jennifer Wu - VP Operations',
    status: 'in-progress',
    priority: 'high',
    dueDate: addDays(new Date(), 3),
    createdDate: subDays(new Date(), 5),
    comments: [
      {
        id: 'comment-11-1',
        text: 'UPPH directly impacts our operational efficiency and costs. Please provide daily updates on L4 initiative progress.',
        createdBy: 'CEO',
        createdAt: subDays(new Date(), 3),
      },
    ],
  },
  {
    id: 'action-12',
    title: 'Reduce open customer complaint cases below 35',
    description:
      'Currently at 47 cases vs target of 35. Focus on top 3 customers (Tesla, Apple, Amazon) and resolve their issues within 2 weeks.',
    owner: 'Sarah Johnson - VP Quality',
    status: 'reopen',
    priority: 'high',
    dueDate: subDays(new Date(), 3),
    createdDate: subDays(new Date(), 14),
    comments: [
      {
        id: 'comment-12-1',
        text: 'This is affecting our customer relationships. Please add dedicated resources to accelerate resolution. Report progress in daily standup.',
        createdBy: 'CEO',
        createdAt: subDays(new Date(), 1),
      },
    ],
  },
  {
    id: 'action-13',
    title: 'Procurement cost down improvement initiative',
    description:
      'Procurement cost down at 3.2% vs 5.0% target. Develop action plan to close 1.8% gap through supplier negotiations and material substitution.',
    owner: 'Michael Chen - CPO',
    status: 'todo',
    priority: 'medium',
    dueDate: addDays(new Date(), 14),
    createdDate: subDays(new Date(), 2),
    comments: [],
  },
  {
    id: 'action-14',
    title: 'Cost of poor quality reduction program',
    description:
      'COPQ at $12.8M vs $10M target. Implement Six Sigma initiative to reduce defect rates and rework costs by $2.8M.',
    owner: 'Sarah Johnson - VP Quality',
    status: 'in-progress',
    priority: 'medium',
    dueDate: addDays(new Date(), 60),
    createdDate: subDays(new Date(), 10),
    comments: [],
  },
  {
    id: 'action-15',
    title: 'Q4 revenue gap closure plan',
    description:
      'Revenue at $2,305M vs $2,350M budget. Develop specific actions to close $45M gap including customer order acceleration and new wins.',
    owner: 'David Park - VP Sales',
    status: 'todo',
    priority: 'high',
    dueDate: addDays(new Date(), 5),
    createdDate: subDays(new Date(), 1),
    comments: [],
  },
];
