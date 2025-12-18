// News and External Pulse Check Types
// Backend enum values - now using dynamic categories from backend
export type NewsCategory = string; // Allow any category string from backend

export type UrgencyLevel = 'short_term' | 'mid_term' | 'long_term';
export type PriorityLevel = 'high' | 'medium' | 'low';
export type RiskOpportunity = 'risk' | 'opportunity';

// Legacy types for backward compatibility
export type ImpactLevel = PriorityLevel; // Alias for backward compatibility

export interface NewsItem {
  id: string;
  category: NewsCategory; // Now accepts any string from backend
  title: string;
  summary: string;
  reasoning: string;
  riskOrOpportunity?: RiskOpportunity;
  priority: PriorityLevel;
  urgency: UrgencyLevel;
  timestamp: Date;
  source: string;
  annotations?: Annotation[];
  analyzingBy?: string;
  hit_count?: number;
  // Backend API fields
  url?: string;
  dimension?: string | boolean;
  recommendation?: string;
  // New backend fields
  content?: string;
  keywords?: string[];
  reasons?: string[];
  importance_score?: number;
  importance_label?: string;
  urgency_score?: number;
  urgency_label?: string;
  overall_score?: number;
  impact_analysis?: string[];
}

export interface Annotation {
  id: string;
  text: string;
  createdBy: string;
  createdAt: Date;
}

// KPI Types
export type TrendDirection = 'up' | 'down' | 'flat';
export type PerformanceStatus = 'good' | 'warning' | 'concern';

export interface KPI {
  id: string;
  name: string;
  value: number;
  unit: string;
  previousValue: number;
  budget: number;
  variance: number;
  variancePercent: number;
  trend: TrendDirection;
  status: PerformanceStatus;
  lastUpdated: Date;
  history: KPIHistoryPoint[];
  description: string;
}

export interface KPIHistoryPoint {
  date: Date;
  value: number;
  budget?: number;
}

// Action Tracker Types
export type ActionStatus =
  | 'todo'
  | 'in-progress'
  | 'ready-for-review'
  | 'completed'
  | 'reopen';
export type ActionPriority = 'high' | 'medium' | 'low';

export interface ActionAttachment {
  id: string;
  name: string;
  url: string; // base64 数据 URL 或服务器 URL
  type: 'image' | 'file';
  uploadedAt: Date;
}

export interface Action {
  id: string;
  title: string;
  description: string;
  owner: string;
  status: ActionStatus;
  priority: ActionPriority;
  dueDate: Date;
  createdDate: Date;
  comments: Comment[];
  attachments?: ActionAttachment[];
}

export interface Comment {
  id: string;
  text: string;
  createdBy: string;
  createdAt: Date;
}

// Root Cause Analysis Types
export type DrillDownLevel = 'company' | 'bu' | 'product' | 'customer';

export interface AnalysisQuery {
  id: string;
  query: string;
  timestamp: Date;
}

export interface AnalysisResult {
  id: string;
  queryId: string;
  summary: string;
  drillDownData: DrillDownData;
  waterfallData?: WaterfallData[];
  timestamp: Date;
}

export interface DrillDownData {
  level: DrillDownLevel;
  data: DrillDownItem[];
}

export interface DrillDownItem {
  name: string;
  value: number;
  variance: number;
  variancePercent: number;
  children?: DrillDownItem[];
}

export interface WaterfallData {
  name: string;
  value: number;
  type: 'positive' | 'negative' | 'total';
}

// Root Cause Types
export interface RootCause {
  id: string;
  title: string;
  impact: number; // Impact in millions USD
  tags: string[]; // Tags like "IDL", "ID", etc.
  waveTicketNumber: string; // Wave ticket number like "nc-101"
}

// Business Assumptions Types
export type AssumptionCategory =
  | 'revenue'
  | 'volume'
  | 'labor_rate'
  | 'fx_rate'
  | 'material_price';
export type AssumptionSource = 'actuals' | 'predictions' | 'initiatives';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface BusinessAssumption {
  id: string;
  category: AssumptionCategory;
  description: string;
  value: number;
  unit: string;
  source: AssumptionSource;
  owner: string;
  lastUpdated: Date;
  approvalStatus: ApprovalStatus;
  approver?: string;
  history: AssumptionHistory[];
  annotations: Annotation[];
}

export interface AssumptionHistory {
  date: Date;
  value: number;
  changedBy: string;
  reason?: string;
}

// Conflict Types
export type ConflictType =
  | 'obvious_error'
  | 'inconsistent_insight'
  | 'duplication';
export type ConflictSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface Conflict {
  id: string;
  type: ConflictType;
  severity: ConflictSeverity;
  description: string;
  affectedAssumptions: string[];
  suggestedResolution: string;
  stakeholders: string[];
  status: 'open' | 'resolved' | 'dismissed';
}

// Forecast Types
export interface ForecastDriver {
  id: string;
  name: string;
  category: 'volume' | 'productivity' | 'cost' | 'price';
  latestActual: number;
  forecastValue: number;
  unit: string;
  changePercent: number;
  impactOnPL: number;
  relatedAssumptions: string[];
}

// Hierarchical Value Driver Structure
export interface ValueDriverItem {
  id: string;
  name: string;
  value?: number;
  unit?: string;
  changePercent?: number;
}

export interface ForecastMetric {
  id: string;
  name: string;
  valueDrivers: ValueDriverItem[];
}

export interface FinancialCategoryGroup {
  id: string;
  name: string;
  metrics: ForecastMetric[];
}

export interface OperationalKPI {
  id: string;
  name: string;
  actual: number;
  forecast: number;
  unit: string;
  impactDescription: string;
}

export interface IncomeStatement {
  revenue: number;
  cogs: number;
  grossProfit: number;
  opex: number;
  operatingProfit: number;
  netProfit: number;
  breakdown: {
    momentum: number;
    pipeline: number;
    risk: number;
    opportunity: number;
  };
}

export interface BusinessEvent {
  id: string;
  name: string;
  impact: number;
  type: 'risk' | 'opportunity' | 'initiative' | 'baseline';
  implications: string[];
  actionProposals?: ActionProposal[];
}

export interface ActionProposal {
  id: string;
  description: string;
  expectedImpact: number;
  feasibility: 'high' | 'medium' | 'low';
  priority: 'high' | 'medium' | 'low';
  stage?: 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5'; // Stage level for ready-in-wave actions
  progress?: number; // Progress percentage (0-100) for ready-in-wave actions
  status?:
    | 'On Track'
    | 'At Risk'
    | 'On Hold'
    | 'Completed'
    | 'Delayed'
    | 'Suspended'
    | 'Archived'; // Status for ready-in-wave actions
  isAIGenerated?: boolean; // Indicates if the action was generated by AI
}

// Scenario Types
export interface Scenario {
  id: string;
  name: string;
  createdDate: Date;
  createdBy: string;
  drivers: ForecastDriver[];
  forecast: IncomeStatement;
  isBaseline: boolean;
}

// OP Waterfall Types
export type OPWaterfallStageType =
  | 'ytm-actual'
  | 'momentum'
  | 'pipeline-improvement'
  | 'headwinds-tailwinds'
  | 'additional-risk'
  | 'assumed-leakage'
  | 'leakage-recovery'
  | 'full-year-fcst';

export interface OPWaterfallStage {
  stage: OPWaterfallStageType;
  label: string;
  value: number; // Cumulative OP value in millions
  delta?: number; // Change from previous stage in millions
  type: 'baseline' | 'positive' | 'negative'; // For color coding
  description?: string;
}

// NP Deviation Waterfall Types
export type NPDeviationStageType =
  | 'budget-np'
  | 'vol-impact'
  | 'price-impact'
  | 'cost-impact'
  | 'mix-impact'
  | 'mva-deviation'
  | 'opex-deviation'
  | 'other-cogs'
  | 'gap-non-op-tax'
  | 'actual-np';

export interface NPDeviationStage {
  stage: NPDeviationStageType;
  label: string;
  value: number; // Cumulative NP value in millions
  delta?: number; // Change from previous stage in millions
  type: 'baseline' | 'positive' | 'negative'; // For color coding
  description?: string;
  isClickable?: boolean; // First 4 stages are clickable for deep dive
}

// Key Call Out Types
export interface KeyCallOut {
  id: string;
  bulletPoints: string[];
  rootCauseAnalysis: string;
  generatedAt: Date;
}

// Layer Navigation Types
export type NavigationLayer = 1 | 2 | 3 | 4;

export interface NavigationState {
  currentLayer: NavigationLayer;
  breadcrumbs: BreadcrumbItem[];
  selectedStage?: string;
  selectedMetric?: string;
}

export interface BreadcrumbItem {
  label: string;
  layer: NavigationLayer;
  onClick: () => void;
}

// Product Analysis Types (Layer 2)
export interface ProductFamilyData {
  id: string;
  productFamily: string;
  gpActual: number;
  gpBudget: number;
  gpGapToBudget: number;
  volImpact: number;
  priceImpact: number;
  costImpact: number;
  mixImpact: number;
}

// Cost Impact Breakdown Types (Layer 3)
export interface CostImpactData {
  id: string;
  productFamily: string;
  costImpact: number; // in thousands
  volActual: number; // in thousands of pieces
  unitCostActual: number;
  unitCostBudget: number;
  unitCostGap: number;
  unitCostMaterialGap: number;
  unitCostLaborGap: number;
  unitCostMOHGap: number;
  unitCostOutsourceGap: number;
}

export interface CostComponentTotals {
  material: number;
  labor: number;
  moh: number;
  outsource: number;
}

// MVA Breakdown Types (Layer 4)
export type MVABreakdownStageType =
  | 'budget-mva-cost'
  | 'fix-impact'
  | 'mva-exclu-fx-impact'
  | 'vol-mix-variance'
  | 'dl-hourly-rate-impact'
  | 'idl-hourly-rate-impact'
  | 'mva-exclu-external-impact'
  | 'dl-efficiency-gap'
  | 'idl-efficiency-gap'
  | 'fixed-moh-efficiency-gap'
  | 'variable-moh-efficiency-gap'
  | 'actual-mva-cost';

export interface MVABreakdownStage {
  stage: MVABreakdownStageType;
  label: string;
  value: number; // Cumulative MVA cost value
  delta?: number; // Change from previous stage
  type: 'baseline' | 'positive' | 'negative'; // For color coding
  description?: string;
}

// Proposal Types
export interface Proposal {
  id: string;
  assumptionId: string; // Links to AppliedAssumption
  description?: string; // Optional proposal description
  actions: ActionProposal[]; // Multiple actions within the proposal
  createdDate?: Date;
  lastUpdated?: Date;
}

// Applied Assumption Types
export interface AppliedAssumption {
  id: string;
  name: string;
  description: string;
  impact: number; // Impact in millions USD
  targetStage: OPWaterfallStageType; // Which waterfall stage it affects
  impactType: 'positive' | 'negative'; // tailwind vs headwind
  isApplied?: boolean; // Default true, since these are "already baked in"
  color: string; // Color for visualization in waterfall chart
  sourceNewsId?: string; // ID of the news item this assumption was derived from
  isSuggested?: boolean; // true if this is a suggested assumption from Pulse, false if applied
  valueDriverChanges?: ValueDriverChange[]; // Value driver changes specific to this assumption
  proposal?: Proposal; // 1-to-1 relationship with Proposal
}

// Value Driver Change for Assumptions
export interface ValueDriverChange {
  valueDriverId: string; // ID of the value driver being changed
  change: number; // Absolute change (e.g., -5 for -5 FTE, or -0.5 for -0.5 USD/hour)
  unit?: string; // Unit of the change (e.g., 'FTE', 'USD/hour', 'M units')
  changePercent?: number; // Percentage change if applicable
}

// Initiative Types
export type InitiativeStatus =
  | 'draft'
  | 'submitted'
  | 'in-progress'
  | 'completed';

export interface Initiative {
  id: string;
  title: string;
  description: string;
  estimatedImpact: number;
  actualImpact?: number;
  owner: string;
  status: InitiativeStatus;
  resourceRequirements: string;
  createdDate: Date;
  dueDate: Date;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

// Internal Pulse Value Driver Framework Types
export type FinancialCategory =
  | 'revenue'
  | 'cogs'
  | 'opex'
  | 'operating-profit';
export type AffectingFactorTag =
  | 'internal-kpi'
  | 'internal-information'
  | 'external-information'
  | 'derived';

export interface AffectingFactor {
  id: string;
  name: string;
  tag: AffectingFactorTag;
  description?: string;
}

export interface ValueDriver {
  id: string;
  name: string;
  description?: string;
  affectingFactors: AffectingFactor[];
}

export interface FinancialMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  budget: number;
  variance: number;
  variancePercent: number;
  status: PerformanceStatus;
  trend: TrendDirection;
  lastUpdated: Date;
  valueDrivers: ValueDriver[];
  history: KPIHistoryPoint[];
}

export interface FinancialCategoryData {
  category: FinancialCategory;
  categoryName: string;
  metrics: FinancialMetric[];
}

// Value Driver Simulation Types
export interface ValueDriverAssumption {
  valueDriverId: string;
  valueDriverName: string;
  metricId: string;
  metricName: string;
  category: FinancialCategory;
  baseValue: number;
  assumptionValue: number;
  assumptionPercent: number;
  unit: string;
}

export interface SimulatedWaterfallStage extends OPWaterfallStage {
  simulatedValue: number;
  simulatedDelta?: number;
  baselineValue: number;
  baselineDelta?: number;
  impact: number; // Difference between simulated and baseline
}

// Value Driver Scenario Types
export interface ValueDriverScenarioValue {
  valueDriverId: string;
  value: number;
}

export interface ValueDriverScenario {
  id: string;
  name: string;
  createdDate: Date;
  createdBy: string;
  valueDriverValues: ValueDriverScenarioValue[]; // Map of valueDriverId -> adjusted value
  simulatedWaterfall?: SimulatedWaterfallStage[];
  totalOPImpact?: number; // Impact at Full Year FCST stage
  color?: string; // Color for visualization
}

export interface ScenarioComparisonState {
  scenarios: ValueDriverScenario[];
  visibleScenarioIds: Set<string>; // Which scenarios to show on chart
  baselineScenarioId?: string; // ID of baseline scenario (if any)
}

// Internal Pulse Dashboard Types (Three-Column Layout)
export interface MetricComparison {
  vsHHtarget?: { percent: number; percentagePoints?: number };
  vsInternalTarget?: { percent: number; percentagePoints?: number };
  vsLastRefresh?: { percent: number; percentagePoints?: number };
  vsLastYear?: { percent: number; percentagePoints?: number };
  vsTarget?: { percent: number };
  vsCurrentYearAverage?: { percent: number };
}

export interface SubMetric {
  name: string;
  value: number;
  unit: string;
  percentOfTotal?: number;
}

export interface PulseMetric {
  id: string;
  name: string;
  value?: number;
  valuePercent?: number;
  unit?: string;
  comparisons?: MetricComparison;
  subMetrics?: SubMetric[];
  hasWarning?: boolean; // For red wavy underline
}

export interface PulseSection {
  title: string;
  metrics: PulseMetric[];
}

export type PulseColumnType = 'financial' | 'topline' | 'operation';

export interface PulseColumn {
  type: PulseColumnType;
  title: string;
  sections: PulseSection[];
}

// Calendar and Meeting Types
export interface MeetingAttendee {
  name: string;
  email: string;
  role?: string;
  isRequired: boolean;
  avatar?: string;
}

export type MeetingMaterialType = 'external-pulse' | 'internal-pulse';

export interface MeetingMaterial {
  id: string;
  type: MeetingMaterialType;
  itemId: string; // ID of the NewsItem or FinancialMetric
  addedAt: Date;
}

export type MeetingType =
  | 'finance-review'
  | 'general'
  | 'interview'
  | 'travel'
  | 'check-in';

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  organizer: string;
  attendees: MeetingAttendee[];
  description?: string;
}

export interface Meeting extends CalendarEvent {
  meetingType: MeetingType;
  materials: MeetingMaterial[];
  isCritical?: boolean; // Mark critical/important meetings for visual highlighting
}

// Wave Executive Dashboard Types
export type InitiativePhase = 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
export type WeeklyStatus = 'progressing-smoothly' | 'leadership-attention';
export type AssetType = 'yes-original' | 'yes-new' | 'no';

export interface ExecutiveInitiative {
  id: string;
  name: string;
  phase: InitiativePhase;
  phaseLabel: string; // e.g., "L0(概念)", "L1(识别)", "L3(规划)"
  weeklyStatus: WeeklyStatus;
  owner: string;
  responsibleWorkflow: string;
  l4LatestEstimatedDate?: Date;
  recurringNetBenefit: number; // in millions USD
  isAsset: AssetType;
  compareBP?: string;
  exception?: boolean;
}

export interface Milestone {
  id: string;
  name: string;
  endDate: Date;
  owner: string;
  initiativeId: string;
}

export interface WorkflowGroup {
  workflow: string;
  count: number;
  initiatives: ExecutiveInitiative[];
}

export interface ExecutiveDashboardSummary {
  overdueInitiatives: {
    count: number;
    netBenefit: number;
  };
  initiativesDueIn7Days: {
    count: number;
    netBenefit: number;
  };
  initiativesDueIn30Days: {
    count: number;
    netBenefit: number;
  };
  overdueMilestones: {
    count: number;
    ownerCount: number;
  };
  milestonesDueIn7Days: {
    count: number;
    ownerCount: number;
  };
  milestonesDueIn30Days: {
    count: number;
    ownerCount: number;
  };
}
