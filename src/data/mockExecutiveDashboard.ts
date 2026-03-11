import type {
  ExecutiveInitiative,
  Milestone,
  WorkflowGroup,
  ExecutiveDashboardSummary,
} from '../types';
import { addDays, subDays } from 'date-fns';

// Chart Data Types
export interface ValueProgressData {
  current: {
    value1: number;
    value2: number;
    date: string;
  };
  target: {
    total: number;
    segments: Array<{ value: number; color: string; label: string }>;
  };
}

export interface ValueDeliveryTrackingData {
  month: string;
  target: number;
  segments: Array<{ value: number; color: string }>;
  total: number;
}

export interface VarianceAnalysisData {
  category: string;
  value: number;
  type: 'positive' | 'negative' | 'total';
}

export interface WorkflowValueDeliveryData {
  workflow: string;
  value1: number;
  value2: number;
  total: number;
}

export const mockExecutiveInitiatives: ExecutiveInitiative[] = [
  {
    id: '21151',
    name: 'Test_Peter',
    phase: 'L0',
    phaseLabel: 'L0(Concept)',
    weeklyStatus: 'progressing-smoothly',
    owner: 'Peter Csepregi',
    responsibleWorkflow: 'Pipeline - Management',
    recurringNetBenefit: 1000.0,
    isAsset: 'no',
  },
  {
    id: '21274',
    name: 'Reduzir custo de energia',
    phase: 'L1',
    phaseLabel: 'L1(Identify)',
    weeklyStatus: 'progressing-smoothly',
    owner: 'Rafael Castro',
    responsibleWorkflow: 'Pipeline - Operations',
    recurringNetBenefit: 120.0,
    isAsset: 'no',
  },
  {
    id: '20765',
    name: "Lauren's Demo",
    phase: 'L3',
    phaseLabel: 'L3(Plan)',
    weeklyStatus: 'progressing-smoothly',
    owner: 'Lauren Hucker',
    responsibleWorkflow: 'Pipeline - Management',
    l4LatestEstimatedDate: new Date('2025-08-30'),
    recurringNetBenefit: 100.0,
    isAsset: 'yes-original',
  },
  {
    id: '19386',
    name: '[L3] Optimize the pricing of spare parts t...',
    phase: 'L3',
    phaseLabel: 'L3(Plan)',
    weeklyStatus: 'leadership-attention',
    owner: 'Antonio Fernandez',
    responsibleWorkflow: 'Pipeline - Operations',
    l4LatestEstimatedDate: new Date('2025-02-28'),
    recurringNetBenefit: 38.0,
    isAsset: 'yes-original',
  },
  // Add more sample initiatives
  {
    id: '20001',
    name: 'Production Efficiency Improvement',
    phase: 'L2',
    phaseLabel: 'L2(Assess)',
    weeklyStatus: 'progressing-smoothly',
    owner: 'Tony Bonaderon',
    responsibleWorkflow: 'Pipeline - Operations',
    l4LatestEstimatedDate: subDays(new Date(), 5), // Overdue
    recurringNetBenefit: 250.0,
    isAsset: 'yes-original',
  },
  {
    id: '20002',
    name: 'Supply Chain Optimization',
    phase: 'L3',
    phaseLabel: 'L3(Plan)',
    weeklyStatus: 'progressing-smoothly',
    owner: 'Jack Wang',
    responsibleWorkflow: 'Pipeline - Management',
    l4LatestEstimatedDate: addDays(new Date(), 5), // Due in 7 days
    recurringNetBenefit: 180.0,
    isAsset: 'no',
  },
  {
    id: '20003',
    name: 'Cost Reduction Initiative',
    phase: 'L1',
    phaseLabel: 'L1(Identify)',
    weeklyStatus: 'leadership-attention',
    owner: 'Jack Wang',
    responsibleWorkflow: 'Pipeline - Operations',
    l4LatestEstimatedDate: addDays(new Date(), 3), // Due in 7 days
    recurringNetBenefit: 95.0,
    isAsset: 'yes-new',
  },
  {
    id: '20004',
    name: 'Market Expansion Project',
    phase: 'L4',
    phaseLabel: 'L4(Implement)',
    weeklyStatus: 'progressing-smoothly',
    owner: 'Douglass Chen',
    responsibleWorkflow: 'Pipeline - Management',
    l4LatestEstimatedDate: addDays(new Date(), 20), // Due in 30 days
    recurringNetBenefit: 320.0,
    isAsset: 'yes-original',
  },
];

export const mockMilestones: Milestone[] = [
  {
    id: 'milestone-1',
    name: 'Complete Phase 1 Review',
    endDate: subDays(new Date(), 10), // Overdue
    owner: 'Peter Csepregi',
    initiativeId: '21151',
  },
  {
    id: 'milestone-2',
    name: 'Finalize Budget Approval',
    endDate: subDays(new Date(), 5), // Overdue
    owner: 'Rafael Castro',
    initiativeId: '21274',
  },
  {
    id: 'milestone-3',
    name: 'Team Kickoff Meeting',
    endDate: addDays(new Date(), 3), // Due in 7 days
    owner: 'Lauren Hucker',
    initiativeId: '20765',
  },
  {
    id: 'milestone-4',
    name: 'Stakeholder Presentation',
    endDate: addDays(new Date(), 6), // Due in 7 days
    owner: 'Antonio Fernandez',
    initiativeId: '19386',
  },
  {
    id: 'milestone-5',
    name: 'Pilot Program Launch',
    endDate: addDays(new Date(), 15), // Due in 30 days
    owner: 'Tony Bonaderon',
    initiativeId: '20001',
  },
];

// Helper function to group initiatives by workflow
export function groupInitiativesByWorkflow(
  initiatives: ExecutiveInitiative[]
): WorkflowGroup[] {
  const workflowMap = new Map<string, ExecutiveInitiative[]>();

  initiatives.forEach((initiative) => {
    const workflow = initiative.responsibleWorkflow;
    if (!workflowMap.has(workflow)) {
      workflowMap.set(workflow, []);
    }
    workflowMap.get(workflow)!.push(initiative);
  });

  return Array.from(workflowMap.entries()).map(([workflow, initiatives]) => ({
    workflow,
    count: initiatives.length,
    initiatives,
  }));
}

// Helper function to calculate summary statistics
export function calculateSummaryStatistics(
  initiatives: ExecutiveInitiative[],
  milestones: Milestone[]
): ExecutiveDashboardSummary {
  const now = new Date();
  const sevenDaysFromNow = addDays(now, 7);
  const thirtyDaysFromNow = addDays(now, 30);

  // Overdue initiatives (next phase date passed)
  const overdueInitiatives = initiatives.filter(
    (init) => init.l4LatestEstimatedDate && init.l4LatestEstimatedDate < now
  );

  // Initiatives due in 7 days
  const initiativesDueIn7Days = initiatives.filter(
    (init) =>
      init.l4LatestEstimatedDate &&
      init.l4LatestEstimatedDate >= now &&
      init.l4LatestEstimatedDate <= sevenDaysFromNow
  );

  // Initiatives due in 30 days
  const initiativesDueIn30Days = initiatives.filter(
    (init) =>
      init.l4LatestEstimatedDate &&
      init.l4LatestEstimatedDate > sevenDaysFromNow &&
      init.l4LatestEstimatedDate <= thirtyDaysFromNow
  );

  // Overdue milestones
  const overdueMilestones = milestones.filter(
    (milestone) => milestone.endDate < now
  );

  // Milestones due in 7 days
  const milestonesDueIn7Days = milestones.filter(
    (milestone) =>
      milestone.endDate >= now && milestone.endDate <= sevenDaysFromNow
  );

  // Milestones due in 30 days
  const milestonesDueIn30Days = milestones.filter(
    (milestone) =>
      milestone.endDate > sevenDaysFromNow &&
      milestone.endDate <= thirtyDaysFromNow
  );

  // Calculate unique owners for milestones
  const getUniqueOwnerCount = (milestones: Milestone[]): number => {
    const uniqueOwners = new Set(milestones.map((m) => m.owner));
    return uniqueOwners.size;
  };

  return {
    overdueInitiatives: {
      count: overdueInitiatives.length,
      netBenefit: overdueInitiatives.reduce(
        (sum, init) => sum + init.recurringNetBenefit,
        0
      ),
    },
    initiativesDueIn7Days: {
      count: initiativesDueIn7Days.length,
      netBenefit: initiativesDueIn7Days.reduce(
        (sum, init) => sum + init.recurringNetBenefit,
        0
      ),
    },
    initiativesDueIn30Days: {
      count: initiativesDueIn30Days.length,
      netBenefit: initiativesDueIn30Days.reduce(
        (sum, init) => sum + init.recurringNetBenefit,
        0
      ),
    },
    overdueMilestones: {
      count: overdueMilestones.length,
      ownerCount: getUniqueOwnerCount(overdueMilestones),
    },
    milestonesDueIn7Days: {
      count: milestonesDueIn7Days.length,
      ownerCount: getUniqueOwnerCount(milestonesDueIn7Days),
    },
    milestonesDueIn30Days: {
      count: milestonesDueIn30Days.length,
      ownerCount: getUniqueOwnerCount(milestonesDueIn30Days),
    },
  };
}

// Chart Mock Data
export const mockValueProgressData: ValueProgressData = {
  current: {
    value1: 985.0,
    value2: 445.6,
    date: 'June 8, 2019 5:00 AM',
  },
  target: {
    total: 4792.0,
    segments: [
      { value: 1290.5, color: '#3b82f6', label: '$M 1,290.5' },
      { value: 971.2, color: '#2563eb', label: '$M 971.2' },
      { value: 818.7, color: '#9333ea', label: '$M 818.7' },
      { value: 1053.7, color: '#ec4899', label: '$M 1,053.7' },
      { value: 463.0, color: '#10b981', label: '$M 463.0' },
    ],
  },
};

export const mockValueDeliveryTrackingData: ValueDeliveryTrackingData[] = [
  {
    month: 'Jan-20',
    target: 392.2,
    segments: [
      { value: 931.4, color: '#3b82f6' },
      { value: 694.5, color: '#2563eb' },
      { value: 767.1, color: '#10b981' },
    ],
    total: 2393.0,
  },
  {
    month: 'Feb-20',
    target: 425.8,
    segments: [
      { value: 950.2, color: '#3b82f6' },
      { value: 720.1, color: '#2563eb' },
      { value: 780.5, color: '#10b981' },
    ],
    total: 2476.6,
  },
  {
    month: 'Mar-20',
    target: 458.3,
    segments: [
      { value: 980.5, color: '#3b82f6' },
      { value: 745.8, color: '#2563eb' },
      { value: 795.2, color: '#10b981' },
    ],
    total: 2521.5,
  },
  {
    month: 'Apr-20',
    target: 512.7,
    segments: [
      { value: 1020.8, color: '#3b82f6' },
      { value: 780.3, color: '#2563eb' },
      { value: 820.1, color: '#10b981' },
    ],
    total: 2621.2,
  },
  {
    month: 'May-20',
    target: 568.2,
    segments: [
      { value: 1050.5, color: '#3b82f6' },
      { value: 810.7, color: '#2563eb' },
      { value: 845.3, color: '#10b981' },
    ],
    total: 2706.5,
  },
  {
    month: 'Jun-20',
    target: 625.4,
    segments: [
      { value: 1080.2, color: '#3b82f6' },
      { value: 835.5, color: '#2563eb' },
      { value: 870.8, color: '#10b981' },
    ],
    total: 2786.5,
  },
  {
    month: 'Jul-20',
    target: 682.9,
    segments: [
      { value: 1105.8, color: '#3b82f6' },
      { value: 860.2, color: '#2563eb' },
      { value: 895.5, color: '#10b981' },
    ],
    total: 2861.5,
  },
  {
    month: 'Aug-20',
    target: 740.3,
    segments: [
      { value: 1130.5, color: '#3b82f6' },
      { value: 885.7, color: '#2563eb' },
      { value: 920.2, color: '#10b981' },
    ],
    total: 2936.4,
  },
  {
    month: 'Sep-20',
    target: 798.1,
    segments: [
      { value: 1155.2, color: '#3b82f6' },
      { value: 910.5, color: '#2563eb' },
      { value: 945.8, color: '#10b981' },
    ],
    total: 3011.5,
  },
  {
    month: 'Oct-20',
    target: 855.6,
    segments: [
      { value: 1180.8, color: '#3b82f6' },
      { value: 935.3, color: '#2563eb' },
      { value: 970.5, color: '#10b981' },
    ],
    total: 3086.6,
  },
  {
    month: 'Nov-20',
    target: 922.5,
    segments: [
      { value: 1049.7, color: '#3b82f6' },
      { value: 817.7, color: '#2563eb' },
      { value: 911.2, color: '#9333ea' },
      { value: 1289.5, color: '#10b981' },
    ],
    total: 4068.1,
  },
  {
    month: 'Dec-20',
    target: 980.2,
    segments: [
      { value: 1075.5, color: '#3b82f6' },
      { value: 840.8, color: '#2563eb' },
      { value: 935.5, color: '#9333ea' },
      { value: 1310.2, color: '#10b981' },
    ],
    total: 4162.0,
  },
];

export const mockVarianceAnalysisData: VarianceAnalysisData[] = [
  { category: 'Accelerated', value: 125.5, type: 'positive' },
  { category: 'Over-delivered', value: 89.3, type: 'positive' },
  { category: 'Added to...', value: 156.7, type: 'positive' },
  { category: 'Delayed', value: -78.2, type: 'negative' },
  { category: 'Leakage Delivery', value: -45.8, type: 'negative' },
  { category: 'Moved to L3 to...', value: -32.5, type: 'negative' },
  { category: 'Cancelled/Paused', value: -28.9, type: 'negative' },
  { category: 'Total', value: 186.1, type: 'total' },
];

export const mockWorkflowValueDeliveryData: WorkflowValueDeliveryData[] = [
  { workflow: 'Water', value1: 1250.5, value2: 850.3, total: 2100.8 },
  { workflow: 'Juice', value1: 680.2, value2: 420.5, total: 1100.7 },
  { workflow: 'Carbonated...', value1: 520.8, value2: 380.2, total: 901.0 },
  { workflow: 'Company', value1: 450.3, value2: 320.7, total: 771.0 },
  { workflow: 'Finance', value1: 380.5, value2: 280.4, total: 660.9 },
  { workflow: 'Information...', value1: 320.2, value2: 240.8, total: 561.0 },
  {
    workflow: 'Human Resources...',
    value1: 280.7,
    value2: 210.5,
    total: 491.2,
  },
  { workflow: 'Legal', value1: 240.3, value2: 180.2, total: 420.5 },
  { workflow: 'Logistics...', value1: 200.5, value2: 150.8, total: 351.3 },
  { workflow: 'Procurement', value1: 180.2, value2: 135.5, total: 315.7 },
  { workflow: 'Sales', value1: 160.8, value2: 120.3, total: 281.1 },
  { workflow: 'Health...', value1: 140.5, value2: 105.2, total: 245.7 },
  { workflow: 'Training', value1: 120.3, value2: 90.5, total: 210.8 },
];
