// News and External Pulse Check Types
export type NewsCategory = 'macro' | 'competitors' | 'customers' | 'suppliers';
export type ImpactLevel = 'high' | 'medium' | 'low';
export type UrgencyLevel = 'urgent' | 'important' | 'normal';
export type RiskOpportunity = 'risk' | 'opportunity';

export interface NewsItem {
  id: string;
  category: NewsCategory;
  headline: string;
  summary: string;
  aiAnalysis: string;
  riskOrOpportunity: RiskOpportunity;
  impactLevel: ImpactLevel;
  urgencyLevel: UrgencyLevel;
  timestamp: Date;
  source: string;
  annotations: Annotation[];
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
