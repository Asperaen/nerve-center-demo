import {
  ArrowLeftIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import CreateActionModalGlobal from '../components/CreateActionModal';
import ScenarioCreationModal from '../components/ScenarioCreationModal';
import { useCurrency } from '../contexts/CurrencyContext';
import {
  mockAppliedAssumptions,
  mockOPWaterfallStages,
  mockSuggestedAssumptions,
  mockValueDriverHierarchy,
} from '../data/mockForecast';
import type {
  ActionProposal,
  AppliedAssumption,
  FinancialCategoryGroup,
  Proposal,
  ValueDriverChange,
  ValueDriverScenario,
} from '../types';
import {
  getBestScenario,
  getWorstScenario,
  sortScenariosByImpact,
} from '../utils/scenarioComparison';
import {
  calculateScenarioWaterfall,
  getNextScenarioColor,
} from '../utils/scenarioUtils';

export default function FinancePage() {
  const [scenarios, setScenarios] = useState<ValueDriverScenario[]>([]);
  const [visibleScenarioIds, setVisibleScenarioIds] = useState<Set<string>>(
    new Set()
  );
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [editingScenario, setEditingScenario] =
    useState<ValueDriverScenario | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ActionProposal | null>(
    null
  );
  const [enabledAssumptionIds, setEnabledAssumptionIds] = useState<Set<string>>(
    new Set(mockAppliedAssumptions.map((a) => a.id))
  );
  const [suggestedAssumptions, setSuggestedAssumptions] = useState(
    mockSuggestedAssumptions
  );
  const [appliedAssumptions, setAppliedAssumptions] = useState(
    mockAppliedAssumptions
  );
  const [enabledSuggestedAssumptionIds, setEnabledSuggestedAssumptionIds] =
    useState<Set<string>>(new Set());
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    assumptionId: string;
    isSuggested: boolean;
    assumptionName: string;
  } | null>(null);
  const { formatAmount, currencyLabel } = useCurrency();
  const formatAmountM = (value: number) =>
    `${formatAmount(value, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}M`;
  const [draggedAssumptionId, setDraggedAssumptionId] = useState<string | null>(
    null
  );
  const [isDragOverApplied, setIsDragOverApplied] = useState(false);
  const [isValueDriverModalOpen, setIsValueDriverModalOpen] = useState(false);
  const [selectedAssumption, setSelectedAssumption] =
    useState<AppliedAssumption | null>(null);
  const [isCumulativeView, setIsCumulativeView] = useState(false);
  // Proposals state - Map of assumptionId to Proposal
  const [proposals, setProposals] = useState<Map<string, Proposal>>(() => {
    const initialProposals = new Map<string, Proposal>();
    mockAppliedAssumptions.forEach((assumption) => {
      if (assumption.proposal) {
        initialProposals.set(assumption.id, assumption.proposal);
      }
    });
    return initialProposals;
  });
  const [isCreateProposalModalOpen, setIsCreateProposalModalOpen] =
    useState(false);
  const [selectedAssumptionForProposal, setSelectedAssumptionForProposal] =
    useState<AppliedAssumption | null>(null);
  const [isCreateActionModalOpen, setIsCreateActionModalOpen] = useState(false);
  const [selectedProposalForAction, setSelectedProposalForAction] =
    useState<Proposal | null>(null);
  const [isCreateActionGlobalModalOpen, setIsCreateActionGlobalModalOpen] =
    useState(false);

  // Calculate simulated waterfalls for visible scenarios and update scenarios
  useEffect(() => {
    const visibleScenarios = scenarios.filter((s) =>
      visibleScenarioIds.has(s.id)
    );

    visibleScenarios.forEach((scenario) => {
      if (!scenario.simulatedWaterfall) {
        const simulated = calculateScenarioWaterfall(
          scenario,
          mockOPWaterfallStages,
          mockValueDriverHierarchy
        );
        const totalOPImpact =
          simulated[simulated.length - 1].simulatedValue -
          mockOPWaterfallStages[mockOPWaterfallStages.length - 1].value;

        // Update scenario with calculated waterfall
        const updatedScenario = {
          ...scenario,
          simulatedWaterfall: simulated,
          totalOPImpact,
        };
        setScenarios((prev) =>
          prev.map((s) => (s.id === scenario.id ? updatedScenario : s))
        );
      }
    });
  }, [scenarios, visibleScenarioIds]);

  const handleEditScenario = (scenario: ValueDriverScenario) => {
    setEditingScenario(scenario);
    setIsScenarioModalOpen(true);
  };

  const handleSaveScenario = (scenario: ValueDriverScenario) => {
    if (editingScenario) {
      // Update existing scenario
      setScenarios((prev) =>
        prev.map((s) => (s.id === scenario.id ? scenario : s))
      );
    } else {
      // Add new scenario
      if (!scenario.color) {
        scenario.color = getNextScenarioColor();
      }
      setScenarios((prev) => [...prev, scenario]);
      // Auto-show new scenario
      setVisibleScenarioIds((prev) => new Set(prev).add(scenario.id));
    }
    setIsScenarioModalOpen(false);
    setEditingScenario(null);
  };

  const handleDeleteScenario = (scenarioId: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== scenarioId));
    setVisibleScenarioIds((prev) => {
      const next = new Set(prev);
      next.delete(scenarioId);
      return next;
    });
  };

  const handleToggleScenario = (scenarioId: string) => {
    setVisibleScenarioIds((prev) => {
      const next = new Set(prev);
      if (next.has(scenarioId)) {
        next.delete(scenarioId);
      } else {
        next.add(scenarioId);
      }
      return next;
    });
  };

  const handleCompareBestWorst = () => {
    const best = getBestScenario(scenarios);
    const worst = getWorstScenario(scenarios);
    const ids = new Set<string>();
    if (best) ids.add(best.id);
    if (worst) ids.add(worst.id);
    setVisibleScenarioIds(ids);
  };

  const handleToggleAssumption = (assumptionId: string) => {
    setEnabledAssumptionIds((prev) => {
      const next = new Set(prev);
      if (next.has(assumptionId)) {
        next.delete(assumptionId);
      } else {
        next.add(assumptionId);
      }
      return next;
    });
  };

  const handleToggleSuggestedAssumption = (assumptionId: string) => {
    setEnabledSuggestedAssumptionIds((prev) => {
      const next = new Set(prev);
      if (next.has(assumptionId)) {
        next.delete(assumptionId);
      } else {
        next.add(assumptionId);
      }
      return next;
    });
  };

  const handleMoveToApplied = (assumptionId: string) => {
    const assumption = suggestedAssumptions.find((a) => a.id === assumptionId);
    if (!assumption) return;

    // Create new applied assumption
    const newAppliedAssumption = {
      ...assumption,
      isSuggested: false,
      isApplied: true,
    };

    // Remove from suggested
    setSuggestedAssumptions((prev) =>
      prev.filter((a) => a.id !== assumptionId)
    );

    // Add to applied
    setAppliedAssumptions((prev) => [...prev, newAppliedAssumption]);

    // Remove from enabled suggested if it was checked
    setEnabledSuggestedAssumptionIds((prev) => {
      const next = new Set(prev);
      next.delete(assumptionId);
      return next;
    });

    // Add to enabled applied (checked by default)
    setEnabledAssumptionIds((prev) => new Set(prev).add(assumptionId));

    // If this is the Regional Minimum Wage Hike assumption, create a proposal with AI-generated actions
    if (
      assumptionId === 'assum-suggested-1' ||
      assumption.name === 'Regional Minimum Wage Hike'
    ) {
      const proposal: Proposal = {
        id: `proposal-${assumptionId}`,
        assumptionId: assumption.id,
        description:
          'Proposal to mitigate regional minimum wage hike impact through operational efficiency and pricing adjustments',
        actions: [
          {
            id: `action-${assumptionId}-1`,
            description:
              'Improve UPPH by 2–3% through line balancing, micro-motion fixes, refreshed standard work, and smarter labor allocation. To offsets around 2.5 million dollars of the impact',
            expectedImpact: 2.5,
            feasibility: 'high',
            priority: 'high',
            isAIGenerated: true,
          },
          {
            id: `action-${assumptionId}-2`,
            description:
              'Push a 1.5–2% ASP adjustment with key accounts, anchored on the mandatory wage increase, to recover the remaining 4.5 million dollars through shared cost pressure',
            expectedImpact: 4.5,
            feasibility: 'medium',
            priority: 'high',
            isAIGenerated: true,
          },
        ],
        createdDate: new Date(),
        lastUpdated: new Date(),
      };
      setProposals((prev) => {
        const next = new Map(prev);
        next.set(assumption.id, proposal);
        return next;
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, assumptionId: string) => {
    // Don't start drag if clicking on checkbox or delete button
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'BUTTON' ||
      target.closest('button') ||
      target.closest('input')
    ) {
      e.preventDefault();
      return;
    }

    setDraggedAssumptionId(assumptionId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', assumptionId);
  };

  const handleDragEnd = () => {
    setDraggedAssumptionId(null);
    setIsDragOverApplied(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOverApplied(true);
  };

  const handleDragLeave = () => {
    setIsDragOverApplied(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverApplied(false);

    const assumptionId = e.dataTransfer.getData('text/plain');
    if (assumptionId && draggedAssumptionId) {
      handleMoveToApplied(assumptionId);
    }
    setDraggedAssumptionId(null);
  };

  const handleDeleteAssumption = (
    assumptionId: string,
    isSuggested: boolean
  ) => {
    // Find the assumption to get its name
    const assumption = isSuggested
      ? suggestedAssumptions.find((a) => a.id === assumptionId)
      : appliedAssumptions.find((a) => a.id === assumptionId);

    if (assumption) {
      setDeleteConfirmation({
        assumptionId,
        isSuggested,
        assumptionName: assumption.name,
      });
    }
  };

  const confirmDeleteAssumption = () => {
    if (!deleteConfirmation) return;

    const { assumptionId, isSuggested } = deleteConfirmation;

    if (isSuggested) {
      // Remove from suggested
      setSuggestedAssumptions((prev) =>
        prev.filter((a) => a.id !== assumptionId)
      );
      // Remove from enabled suggested
      setEnabledSuggestedAssumptionIds((prev) => {
        const next = new Set(prev);
        next.delete(assumptionId);
        return next;
      });
    } else {
      // Remove from applied
      setAppliedAssumptions((prev) =>
        prev.filter((a) => a.id !== assumptionId)
      );
      // Remove from enabled applied
      setEnabledAssumptionIds((prev) => {
        const next = new Set(prev);
        next.delete(assumptionId);
        return next;
      });
    }

    // Close the confirmation modal
    setDeleteConfirmation(null);
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    // Calculate assumption impacts per stage
    // Note: Baseline waterfall already has applied assumptions baked in
    // When an applied assumption is disabled, we subtract its impact
    const disabledAssumptions = appliedAssumptions.filter(
      (a) => !enabledAssumptionIds.has(a.id)
    );

    // Calculate total impact to subtract for each stage (from disabled applied assumptions)
    const stageImpacts = new Map<string, number>();
    disabledAssumptions.forEach((assumption) => {
      const currentImpact = stageImpacts.get(assumption.targetStage) || 0;
      // Subtract the impact since assumption is disabled
      stageImpacts.set(
        assumption.targetStage,
        currentImpact - assumption.impact
      );
    });

    // Add enabled suggested assumptions to stage impacts
    const enabledSuggested = suggestedAssumptions.filter((a) =>
      enabledSuggestedAssumptionIds.has(a.id)
    );
    enabledSuggested.forEach((assumption) => {
      const currentImpact = stageImpacts.get(assumption.targetStage) || 0;
      // Add the impact since suggested assumption is enabled
      stageImpacts.set(
        assumption.targetStage,
        currentImpact + assumption.impact
      );
    });

    // Build adjusted waterfall stages with assumption impacts
    const adjustedStages: Array<{
      adjustedValue: number;
      adjustedDelta: number;
      assumptionImpact: number;
      baselineValue: number;
      baselineDelta: number;
      stage: string;
      label: string;
      type: 'baseline' | 'positive' | 'negative' | 'preliminary';
      description?: string;
    }> = [];

    mockOPWaterfallStages.forEach((stage, index) => {
      const assumptionImpact = stageImpacts.get(stage.stage) || 0;
      const prevAdjustedValue =
        index > 0 ? adjustedStages[index - 1].adjustedValue : 0;
      const prevBaselineValue =
        index > 0 ? mockOPWaterfallStages[index - 1].value : 0;

      // Adjust delta based on assumption impact
      const baselineDelta =
        stage.delta ??
        (index === 0 ? stage.value : stage.value - prevBaselineValue);
      const adjustedDelta = baselineDelta + assumptionImpact;

      // Calculate adjusted cumulative value
      const adjustedValue = prevAdjustedValue + adjustedDelta;

      adjustedStages.push({
        ...stage,
        adjustedValue,
        adjustedDelta,
        assumptionImpact,
        baselineValue: stage.value,
        baselineDelta,
      });
    });

    // Build chart data points
    const baselineData = adjustedStages.map((stage, index) => {
      const prevAdjustedValue =
        index > 0 ? adjustedStages[index - 1].adjustedValue : 0;

      const isBaseline = stage.type === 'baseline';
      // Use baselineDelta (without assumptions) for the main bar
      // Assumption impacts will be stacked separately
      const baselineBarValue = isBaseline
        ? stage.baselineValue
        : stage.baselineDelta;
      const adjustedBarValue = isBaseline
        ? stage.adjustedValue
        : stage.adjustedDelta;
      const baselineValue = isBaseline ? 0 : prevAdjustedValue;

      interface ChartDataPoint {
        [key: string]: string | number | boolean | undefined;
        name: string;
        label: string;
        cumulativeValue: number;
        delta: number;
        baselineValue: number;
        barValue: number;
        isPositive: boolean;
      }

      const dataPoint: ChartDataPoint = {
        ...stage,
        name: stage.label,
        label: stage.label,
        cumulativeValue: stage.adjustedValue,
        delta: stage.adjustedDelta,
        baselineValue,
        barValue: baselineBarValue, // Use baseline (without assumptions) for main bar
        adjustedBarValue, // Keep adjusted value for reference
        isPositive: stage.adjustedDelta >= 0,
      };

      // Add applied assumption impact values for each enabled assumption
      const enabledAppliedAssumptions = appliedAssumptions.filter((a) =>
        enabledAssumptionIds.has(a.id)
      );
      enabledAppliedAssumptions.forEach((assumption) => {
        if (stage.stage === assumption.targetStage) {
          // Add the assumption impact as a separate data key
          dataPoint[`assumption_${assumption.id}_impact`] = assumption.impact;
        } else {
          // Set to 0 for stages not affected by this assumption
          dataPoint[`assumption_${assumption.id}_impact`] = 0;
        }
      });

      // Add suggested assumption impact values for each enabled suggested assumption
      const enabledSuggestedAssumptions = suggestedAssumptions.filter((a) =>
        enabledSuggestedAssumptionIds.has(a.id)
      );
      enabledSuggestedAssumptions.forEach((assumption) => {
        if (stage.stage === assumption.targetStage) {
          // Add the suggested assumption impact as a separate data key
          dataPoint[`suggested_${assumption.id}_impact`] = assumption.impact;
        } else {
          // Set to 0 for stages not affected by this assumption
          dataPoint[`suggested_${assumption.id}_impact`] = 0;
        }
      });

      // Add scenario simulated values
      const visibleScenarios = scenarios.filter((s) =>
        visibleScenarioIds.has(s.id)
      );
      visibleScenarios.forEach((scenario) => {
        const simulated = scenario.simulatedWaterfall;
        if (simulated && simulated[index]) {
          const simStage = simulated[index];
          dataPoint[`scenario_${scenario.id}_value`] = simStage.simulatedValue;
          dataPoint[`scenario_${scenario.id}_delta`] = simStage.simulatedDelta;
        }
      });

      return dataPoint;
    });

    return baselineData;
  }, [
    scenarios,
    visibleScenarioIds,
    enabledAssumptionIds,
    enabledSuggestedAssumptionIds,
    appliedAssumptions,
    suggestedAssumptions,
  ]);

  const visibleScenarios = scenarios.filter((s) =>
    visibleScenarioIds.has(s.id)
  );

  // Calculate cumulative value driver changes for all enabled applied assumptions
  const getCumulativeValueDriverChanges = (): Map<
    string,
    { change: number; unit?: string; changePercent?: number }
  > => {
    const cumulative = new Map<
      string,
      { change: number; unit?: string; changePercent?: number }
    >();

    appliedAssumptions
      .filter((a) => enabledAssumptionIds.has(a.id))
      .forEach((assumption) => {
        assumption.valueDriverChanges?.forEach((vdChange) => {
          const existing = cumulative.get(vdChange.valueDriverId);
          if (existing) {
            cumulative.set(vdChange.valueDriverId, {
              change: existing.change + vdChange.change,
              unit: vdChange.unit || existing.unit,
              changePercent: existing.changePercent
                ? existing.changePercent + (vdChange.changePercent || 0)
                : vdChange.changePercent,
            });
          } else {
            cumulative.set(vdChange.valueDriverId, {
              change: vdChange.change,
              unit: vdChange.unit,
              changePercent: vdChange.changePercent,
            });
          }
        });
      });

    return cumulative;
  };

  // Handle opening value driver modal for a specific assumption
  const handleViewAssumptionValueDrivers = (assumption: AppliedAssumption) => {
    setSelectedAssumption(assumption);
    setIsCumulativeView(false);
    setIsValueDriverModalOpen(true);
  };

  // Handle opening overall value drivers modal
  const handleViewOverallValueDrivers = () => {
    setSelectedAssumption(null);
    setIsCumulativeView(false);
    setIsValueDriverModalOpen(true);
  };

  // Handle creating a new proposal for an assumption
  const handleCreateProposal = (assumption: AppliedAssumption) => {
    setSelectedAssumptionForProposal(assumption);
    setIsCreateProposalModalOpen(true);
  };

  // Handle saving a new proposal
  const handleSaveProposal = (proposal: Proposal) => {
    setProposals((prev) => {
      const next = new Map(prev);
      next.set(proposal.assumptionId, proposal);
      return next;
    });
    setIsCreateProposalModalOpen(false);
    setSelectedAssumptionForProposal(null);
  };

  // Handle creating a new action for a proposal
  const handleCreateAction = (proposal: Proposal) => {
    setSelectedProposalForAction(proposal);
    setIsCreateActionModalOpen(true);
  };

  // Handle saving a new action
  const handleSaveAction = (proposalId: string, action: ActionProposal) => {
    setProposals((prev) => {
      const next = new Map(prev);
      const proposal = next.get(proposalId);
      if (proposal) {
        const updatedProposal: Proposal = {
          ...proposal,
          actions: [...proposal.actions, action],
          lastUpdated: new Date(),
        };
        next.set(proposalId, updatedProposal);
      }
      return next;
    });
    setIsCreateActionModalOpen(false);
    setSelectedProposalForAction(null);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 relative'>
      <div className='p-8 max-w-[1920px] mx-auto'>
        {/* Page Title */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-2'>
            <h1 className='text-3xl font-bold text-gray-900'>
              Finance Forecast - 2026 Week 45
            </h1>
            <button
              onClick={() => setIsCreateActionGlobalModalOpen(true)}
              className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors'>
              <PlusIcon className='w-5 h-5' />
              Create Action
            </button>
          </div>
        </div>

        <div className='space-y-8'>
          {/* OP Waterfall Chart */}
          <div className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-8 hover:shadow-xl transition-shadow duration-300'>
            <div className='flex items-center justify-end mb-8'>
              <div className='flex items-center gap-2'>
                <div className='flex items-center gap-3'>
                  {scenarios.length >= 2 && (
                    <button
                      onClick={handleCompareBestWorst}
                      className='px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-200 flex items-center'>
                      <ChartBarIcon className='w-4 h-4 mr-2' />
                      Compare Best/Worst
                    </button>
                  )}
                  {scenarios.length > 0 && (
                    <button
                      onClick={() => {}}
                      className='px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-200 flex items-center'>
                      <ChartBarIcon className='w-4 h-4 mr-2' />
                      Comparison Panel
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Scenario Management Panel */}
            {scenarios.length > 0 &&
              (() => {
                const bestScenario = getBestScenario(scenarios);
                const worstScenario = getWorstScenario(scenarios);
                const sortedScenarios = sortScenariosByImpact(scenarios);

                return (
                  <div className='mb-6 p-5 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-200 shadow-sm'>
                    <div className='flex items-center justify-between mb-4'>
                      <h3 className='text-base font-bold text-gray-900'>
                        Scenarios ({scenarios.length})
                      </h3>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2'>
                      {sortedScenarios.map((scenario, index) => {
                        const isVisible = visibleScenarioIds.has(scenario.id);
                        const impact = scenario.totalOPImpact ?? 0;
                        const simulated = scenario.simulatedWaterfall;
                        const finalValue = simulated
                          ? simulated[simulated.length - 1].simulatedValue
                          : null;
                        const isBest = bestScenario?.id === scenario.id;
                        const isWorst = worstScenario?.id === scenario.id;

                        return (
                          <div
                            key={scenario.id}
                            className={`relative flex items-center justify-between p-4 bg-white rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                              isVisible
                                ? 'border-primary-400 shadow-md shadow-primary-100'
                                : 'border-gray-200 hover:border-gray-300'
                            } ${
                              isBest
                                ? 'ring-2 ring-opportunity-300 ring-offset-1'
                                : ''
                            } ${
                              isWorst
                                ? 'ring-2 ring-risk-300 ring-offset-1'
                                : ''
                            }`}>
                            {/* Rank Badge */}
                            <div className='absolute top-1 right-1'>
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                  isBest
                                    ? 'bg-opportunity-100 text-opportunity-700'
                                    : isWorst
                                    ? 'bg-risk-100 text-risk-700'
                                    : 'bg-gray-200 text-gray-600'
                                }`}>
                                {index + 1}
                              </div>
                            </div>

                            <div className='flex items-center gap-2 flex-1 pr-6'>
                              <input
                                type='checkbox'
                                checked={isVisible}
                                onChange={() =>
                                  handleToggleScenario(scenario.id)
                                }
                                className='w-4 h-4 text-primary-600 rounded focus:ring-primary-500'
                              />
                              <div
                                className='w-3 h-3 rounded-full'
                                style={{
                                  backgroundColor: scenario.color || '#3b82f6',
                                }}
                              />
                              <div className='flex-1 min-w-0'>
                                <div className='flex items-center gap-2'>
                                  <div className='text-sm font-medium text-gray-900 truncate'>
                                    {scenario.name}
                                  </div>
                                  {isBest && (
                                    <span className='text-xs px-1.5 py-0.5 bg-opportunity-100 text-opportunity-700 rounded font-semibold'>
                                      Best
                                    </span>
                                  )}
                                  {isWorst && (
                                    <span className='text-xs px-1.5 py-0.5 bg-risk-100 text-risk-700 rounded font-semibold'>
                                      Worst
                                    </span>
                                  )}
                                </div>
                                {finalValue !== null && (
                                  <div className='text-xs text-gray-500'>
                                    Final OP: {formatAmountM(finalValue)}
                                    {impact !== 0 && (
                                      <span
                                        className={`ml-2 ${
                                          impact >= 0
                                            ? 'text-opportunity-600'
                                            : 'text-risk-600'
                                        }`}>
                                        ({impact > 0 ? '+' : ''}
                                        {formatAmountM(impact)})
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className='flex items-center gap-1'>
                              <button
                                onClick={() => handleEditScenario(scenario)}
                                className='p-1 text-gray-400 hover:text-gray-600 transition-colors'>
                                <PencilIcon className='w-4 h-4' />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteScenario(scenario.id)
                                }
                                className='p-1 text-gray-400 hover:text-red-600 transition-colors'>
                                <TrashIcon className='w-4 h-4' />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

            <div className='h-96'>
              <ResponsiveContainer
                width='100%'
                height='100%'>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis
                    dataKey='label'
                    angle={-15}
                    textAnchor='end'
                    height={120}
                    style={{ fontSize: '11px' }}
                  />
                  <YAxis
                    style={{ fontSize: '12px' }}
                    label={{
                      value: `Operating Profit (M ${currencyLabel})`,
                      angle: -90,
                      position: 'insideLeft',
                      style: { fontSize: '12px' },
                    }}
                  />
                  <Tooltip
                    formatter={(value, _name, props) => {
                      const payload = props.payload as
                        | {
                            [key: string]: string | number | undefined;
                            cumulativeValue?: number;
                            delta?: number;
                            label?: string;
                          }
                        | undefined;
                      const numericValue =
                        typeof value === 'number'
                          ? value
                          : Number(
                              Array.isArray(value) ? value[0] : value ?? 0
                            );
                      const cumulative =
                        payload?.cumulativeValue ?? numericValue;
                      const delta = payload?.delta;

                      const tooltipLines: string[] = [
                        `${payload?.label ?? 'Stage'}: ${formatAmountM(
                          cumulative
                        )} ${currencyLabel}`,
                      ];

                      if (delta !== undefined && delta !== cumulative) {
                        tooltipLines.push(
                          `Change: ${delta > 0 ? '+' : ''}${formatAmountM(
                            delta
                          )} ${currencyLabel}`
                        );
                      }

                      // Add scenario values if present
                      visibleScenarios.forEach((scenario) => {
                        const scenarioValue = payload?.[
                          `scenario_${scenario.id}_value`
                        ] as number | undefined;
                        if (scenarioValue !== undefined) {
                          const scenarioDelta = payload?.[
                            `scenario_${scenario.id}_delta`
                          ] as number | undefined;
                          tooltipLines.push(
                            `${scenario.name}: ${formatAmountM(
                              scenarioValue
                            )} ${currencyLabel}` +
                              (scenarioDelta !== undefined
                                ? ` (${
                                    scenarioDelta > 0 ? '+' : ''
                                  }${formatAmountM(scenarioDelta)} ${currencyLabel})`
                                : '')
                          );
                        }
                      });

                      return tooltipLines.join('\n');
                    }}
                  />
                  <Legend />
                  {/* Baseline bars - transparent spacer to position subsequent bars */}
                  <Bar
                    dataKey='baselineValue'
                    stackId='a'
                    fill='transparent'
                  />
                  {/* Change bars - shows the baseline delta (without assumptions) */}
                  <Bar
                    dataKey='barValue'
                    stackId='a'
                    name='Baseline'>
                    {mockOPWaterfallStages.map((stage, index) => {
                      const isBaseline = stage.type === 'baseline';
                      const isPositive = stage.type === 'positive';

                      let fillColor = '#6b7280'; // grey for baseline
                      if (!isBaseline) {
                        fillColor = isPositive
                          ? '#60a5fa' // light blue for positive
                          : '#fb923c'; // orange/pink for negative
                      }

                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={fillColor}
                        />
                      );
                    })}
                  </Bar>
                  {/* Applied assumption impact bars - show individual assumption contributions */}
                  {appliedAssumptions
                    .filter((a) => enabledAssumptionIds.has(a.id))
                    .map((assumption) => (
                      <Bar
                        key={`assumption-${assumption.id}`}
                        dataKey={`assumption_${assumption.id}_impact`}
                        stackId='a'
                        name={assumption.name}
                        fill={assumption.color}
                        opacity={0.85}
                      />
                    ))}
                  {/* Suggested assumption impact bars - show individual suggested assumption contributions */}
                  {suggestedAssumptions
                    .filter((a) => enabledSuggestedAssumptionIds.has(a.id))
                    .map((assumption) => (
                      <Bar
                        key={`suggested-${assumption.id}`}
                        dataKey={`suggested_${assumption.id}_impact`}
                        stackId='a'
                        name={`${assumption.name} (Suggested)`}
                        fill={assumption.color}
                        opacity={0.65}
                      />
                    ))}
                  {/* Scenario lines */}
                  {visibleScenarios.map((scenario) => {
                    const color = scenario.color || '#3b82f6';
                    return (
                      <Line
                        key={`scenario-line-${scenario.id}`}
                        type='monotone'
                        dataKey={`scenario_${scenario.id}_value`}
                        stroke={color}
                        strokeWidth={2}
                        dot={{ r: 4, fill: color }}
                        name={scenario.name}
                        connectNulls
                      />
                    );
                  })}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Scenario Creation Modal */}
          {isScenarioModalOpen && (
            <ScenarioCreationModal
              isOpen={isScenarioModalOpen}
              onClose={() => {
                setIsScenarioModalOpen(false);
                setEditingScenario(null);
              }}
              onSave={handleSaveScenario}
              valueDriverHierarchy={mockValueDriverHierarchy}
              existingScenarios={scenarios}
              editingScenario={editingScenario}
            />
          )}

          {/* Assumptions Section - Side by Side Layout */}
          <div className='flex items-start justify-center gap-8'>
            {/* Applied Assumptions Panel */}
            <div
              className={`flex-1 bg-white rounded-xl border-2 shadow-lg shadow-gray-200/50 p-8 hover:shadow-xl transition-all duration-300 ${
                isDragOverApplied
                  ? 'border-primary-400 bg-primary-50/30'
                  : 'border-gray-200'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900 mb-1'>
                    Applied Assumptions
                  </h2>
                </div>
                <button
                  onClick={handleViewOverallValueDrivers}
                  className='px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-200 flex items-center'>
                  <ChartBarIcon className='w-4 h-4 mr-2' />
                  Value Drivers
                </button>
              </div>

              <div className='space-y-4'>
                {appliedAssumptions.map((assumption) => {
                  const isEnabled = enabledAssumptionIds.has(assumption.id);
                  const stageLabel =
                    mockOPWaterfallStages.find(
                      (s) => s.stage === assumption.targetStage
                    )?.label || assumption.targetStage;
                  const displayLabel =
                    assumption.targetStage === 'early-signals'
                      ? 'early signal'
                      : stageLabel;

                  return (
                    <div
                      key={assumption.id}
                      className={`flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 ${
                        assumption.valueDriverChanges &&
                        assumption.valueDriverChanges.length > 0
                          ? 'cursor-pointer'
                          : ''
                      }`}
                      onClick={() => {
                        if (
                          assumption.valueDriverChanges &&
                          assumption.valueDriverChanges.length > 0
                        ) {
                          handleViewAssumptionValueDrivers(assumption);
                        }
                      }}>
                      <div className='flex-1 pr-4'>
                        <div className='flex items-center gap-3 mb-2'>
                          <div
                            className='w-4 h-4 rounded border-2 border-white shadow-sm'
                            style={{ backgroundColor: assumption.color }}
                          />
                          <h3 className='text-base font-semibold text-gray-900'>
                            {assumption.name}
                          </h3>
                          <span
                            className={`text-xs px-2 py-1 rounded font-semibold ${
                              assumption.impactType === 'positive'
                                ? 'bg-opportunity-100 text-opportunity-700'
                                : 'bg-risk-100 text-risk-700'
                            }`}>
                            {assumption.impactType === 'positive'
                              ? 'Tailwind'
                              : 'Headwind'}
                          </span>
                        </div>
                        <p className='text-sm text-gray-600 mb-2'>
                          {assumption.description}
                        </p>
                        <div className='flex items-center gap-4 text-xs text-gray-500'>
                          <span>
                            Impact:{' '}
                            <span
                              className={`font-semibold ${
                                assumption.impact >= 0
                                  ? 'text-opportunity-600'
                                  : 'text-risk-600'
                              }`}>
                              {assumption.impact > 0 ? '+' : ''}
                              {assumption.impact.toFixed(1)}M
                            </span>
                          </span>
                          <span>•</span>
                          <span>Affects: {displayLabel}</span>
                        </div>
                      </div>
                      <div className='flex items-center gap-3'>
                        <input
                          type='checkbox'
                          checked={isEnabled}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleToggleAssumption(assumption.id);
                          }}
                          className='w-5 h-5 text-primary-600 rounded focus:ring-primary-500 cursor-pointer'
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAssumption(assumption.id, false);
                          }}
                          className='p-1 text-gray-400 hover:text-red-600 transition-colors'>
                          <TrashIcon className='w-5 h-5' />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Arrow Indicator */}
            {suggestedAssumptions.length > 0 && (
              <div className='flex items-center justify-center py-8'>
                <div className='flex flex-col items-center gap-2'>
                  <ArrowLeftIcon className='w-12 h-12 text-primary-500' />
                  <span className='text-xs font-medium text-gray-600'>
                    Drag here
                  </span>
                </div>
              </div>
            )}

            {/* Pulse Suggested Assumptions Panel */}
            {suggestedAssumptions.length > 0 && (
              <div className='flex-1 bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-8 hover:shadow-xl transition-shadow duration-300'>
                <div className='flex items-center justify-between mb-6'>
                  <div>
                    <h2 className='text-2xl font-bold text-gray-900 mb-1'>
                      Pulse Suggested Assumptions
                    </h2>
                    <p className='text-sm text-gray-500'>
                      Pulse AI suggested assumptions - drag to Applied
                      Assumptions or check to see impact on waterfall
                    </p>
                  </div>
                </div>

                <div className='space-y-4'>
                  {suggestedAssumptions.map((assumption) => {
                    const isEnabled = enabledSuggestedAssumptionIds.has(
                      assumption.id
                    );
                    const stageLabel =
                      mockOPWaterfallStages.find(
                        (s) => s.stage === assumption.targetStage
                      )?.label || assumption.targetStage;
                    const displayLabel =
                      assumption.targetStage === 'early-signals'
                        ? 'early signal'
                        : stageLabel;

                    const isDragging = draggedAssumptionId === assumption.id;

                    return (
                      <div
                        key={assumption.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, assumption.id)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 ${
                          isDragging
                            ? 'opacity-50 cursor-grabbing'
                            : assumption.valueDriverChanges &&
                              assumption.valueDriverChanges.length > 0
                            ? 'cursor-grab active:cursor-grabbing'
                            : 'cursor-grab active:cursor-grabbing'
                        }`}
                        onClick={(e) => {
                          // Only handle click if not dragging and has value drivers
                          if (
                            !isDragging &&
                            assumption.valueDriverChanges &&
                            assumption.valueDriverChanges.length > 0 &&
                            !(e.target as HTMLElement).closest('input') &&
                            !(e.target as HTMLElement).closest('button')
                          ) {
                            handleViewAssumptionValueDrivers(assumption);
                          }
                        }}>
                        <div className='flex-1 pr-4'>
                          <div className='flex items-center gap-3 mb-2'>
                            <div
                              className='w-4 h-4 rounded border-2 border-white shadow-sm'
                              style={{ backgroundColor: assumption.color }}
                            />
                            <h3 className='text-base font-semibold text-gray-900'>
                              {assumption.name}
                            </h3>
                            <span
                              className={`text-xs px-2 py-1 rounded font-semibold ${
                                assumption.impactType === 'positive'
                                  ? 'bg-opportunity-100 text-opportunity-700'
                                  : 'bg-risk-100 text-risk-700'
                              }`}>
                              {assumption.impactType === 'positive'
                                ? 'Tailwind'
                                : 'Headwind'}
                            </span>
                          </div>
                          <p className='text-sm text-gray-600 mb-2'>
                            {assumption.description}
                          </p>
                          <div className='flex items-center gap-4 text-xs text-gray-500'>
                            <span>
                              Impact:{' '}
                              <span
                                className={`font-semibold ${
                                  assumption.impact >= 0
                                    ? 'text-opportunity-600'
                                    : 'text-risk-600'
                                }`}>
                                {assumption.impact > 0 ? '+' : ''}
                                {assumption.impact.toFixed(1)}M
                              </span>
                            </span>
                            <span>•</span>
                            <span>Affects: {displayLabel}</span>
                          </div>
                        </div>
                        <div className='flex items-center gap-3'>
                          <input
                            type='checkbox'
                            checked={isEnabled}
                            onChange={() =>
                              handleToggleSuggestedAssumption(assumption.id)
                            }
                            onClick={(e) => e.stopPropagation()}
                            className='w-5 h-5 text-primary-600 rounded focus:ring-primary-500 cursor-pointer'
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAssumption(assumption.id, true);
                            }}
                            className='p-1 text-gray-400 hover:text-red-600 transition-colors'>
                            <TrashIcon className='w-5 h-5' />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Initiative Proposals - Based on Applied Assumptions */}
          <div className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-8 hover:shadow-xl transition-shadow duration-300'>
            <div className='flex items-center justify-between mb-8'>
              <div>
                <h2 className='text-2xl font-bold text-gray-900 mb-1'>
                  Initiative Proposals
                </h2>
                <p className='text-sm text-gray-500'>
                  Proposals and initiatives to recover risks or boost tailwinds
                  from applied assumptions
                </p>
              </div>
            </div>
            <div className='space-y-6'>
              {appliedAssumptions.map((assumption) => {
                const proposal = proposals.get(assumption.id);
                const isPositive = assumption.impactType === 'positive';

                return (
                  <div
                    key={assumption.id}
                    className={`p-6 rounded-xl border-2 shadow-md hover:shadow-lg transition-all duration-200 ${
                      isPositive
                        ? 'bg-gradient-to-br from-opportunity-50 to-opportunity-100/50 border-opportunity-300'
                        : 'bg-gradient-to-br from-risk-50 to-risk-100/50 border-risk-300'
                    }`}>
                    <div className='flex items-start justify-between mb-3'>
                      <div className='flex items-center space-x-3'>
                        <div
                          className={`p-2 rounded-full ${
                            isPositive ? 'bg-opportunity-100' : 'bg-risk-100'
                          }`}>
                          {isPositive ? (
                            <ArrowTrendingUpIcon className='w-5 h-5 text-opportunity-600' />
                          ) : (
                            <ArrowTrendingDownIcon className='w-5 h-5 text-risk-600' />
                          )}
                        </div>
                        <div>
                          <h3 className='text-lg font-semibold text-gray-900'>
                            {assumption.name}
                          </h3>
                          <p
                            className={`text-sm font-bold ${
                              isPositive
                                ? 'text-opportunity-700'
                                : 'text-risk-700'
                            }`}>
                            Impact: {assumption.impact > 0 ? '+' : ''}
                            {formatAmountM(assumption.impact)} {currencyLabel}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Assumption Description */}
                    <div className='mb-3'>
                      <p className='text-sm text-gray-600'>
                        {assumption.description}
                      </p>
                    </div>

                    {/* Proposal Section */}
                    {proposal ? (
                      <div className='mt-5 p-5 bg-white rounded-xl border border-gray-200 shadow-sm'>
                        {proposal.description && (
                          <p className='text-sm font-medium text-gray-900 mb-3'>
                            {proposal.description}
                          </p>
                        )}
                        <div className='flex items-center justify-between mb-3'>
                          <p className='text-sm font-medium text-gray-700'>
                            Initiatives ({proposal.actions.length}):
                          </p>
                          <button
                            onClick={() => handleCreateAction(proposal)}
                            className='px-3 py-1.5 text-xs font-medium text-white bg-primary-600 rounded hover:bg-primary-700 transition-colors flex items-center'>
                            <PlusIcon className='w-3 h-3 mr-1' />
                            Add Initiative
                          </button>
                        </div>
                        <div className='space-y-2'>
                          {proposal.actions.map((action: ActionProposal) => {
                            const isReadyInWave = action.stage !== undefined;

                            // Get L-gate stage color
                            const getStageColor = (stage?: string) => {
                              switch (stage) {
                                case 'L0':
                                  return 'bg-gray-500 text-white';
                                case 'L1':
                                  return 'bg-blue-500 text-white';
                                case 'L2':
                                  return 'bg-green-500 text-white';
                                case 'L3':
                                  return 'bg-yellow-500 text-white';
                                case 'L4':
                                  return 'bg-orange-500 text-white';
                                case 'L5':
                                  return 'bg-red-500 text-white';
                                default:
                                  return 'bg-gray-400 text-white';
                              }
                            };

                            return (
                              <div
                                key={action.id}
                                className={`flex items-start justify-between p-4 rounded-lg transition-all duration-200 ${
                                  isReadyInWave
                                    ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 shadow-sm'
                                    : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                                }`}>
                                <div className='flex-1'>
                                  <div className='flex items-center gap-2 mb-1'>
                                    <p className='text-sm font-medium text-gray-900'>
                                      {action.description}
                                    </p>
                                    {action.isAIGenerated && !action.stage && (
                                      <span className='px-3 py-1 text-xs font-bold bg-gradient-to-r from-purple-200 via-indigo-200 to-purple-300 text-purple-800 rounded-full border-2 border-purple-400 shadow-md shadow-purple-200/50 flex items-center gap-1.5'>
                                        <span className='text-sm'>✨</span>
                                        <span>AI</span>
                                      </span>
                                    )}
                                  </div>
                                  <div className='mt-2 flex items-center flex-wrap gap-2'>
                                    <span className='text-xs text-gray-500'>
                                      Expected Impact:{' '}
                                      {formatAmountM(action.expectedImpact)}{' '}
                                      {currencyLabel}
                                    </span>
                                    <span className='text-xs text-gray-400'>
                                      •
                                    </span>
                                    {action.feasibility === 'high' ? (
                                      <span className='px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full border border-green-300'>
                                        High Feasibility
                                      </span>
                                    ) : (
                                      <span className='text-xs text-gray-500 capitalize'>
                                        Feasibility: {action.feasibility}
                                      </span>
                                    )}
                                    <span className='text-xs text-gray-400'>
                                      •
                                    </span>
                                    {action.priority === 'high' ? (
                                      <span className='px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-full border border-red-300'>
                                        High Priority
                                      </span>
                                    ) : (
                                      <span className='text-xs text-gray-500 capitalize'>
                                        Priority: {action.priority}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className='ml-4 flex flex-col items-end gap-2'>
                                  {isReadyInWave && action.stage ? (
                                    <div
                                      className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm ${getStageColor(
                                        action.stage
                                      )}`}>
                                      {action.stage}
                                    </div>
                                  ) : isReadyInWave ? (
                                    <div className='px-3 py-1 text-xs font-medium text-yellow-800 bg-gradient-to-r from-yellow-200 to-yellow-300 rounded-full border border-yellow-400 shadow-sm'>
                                      ✨ Ready in Wave
                                    </div>
                                  ) : null}
                                  {!isReadyInWave && (
                                    <button
                                      onClick={() => {
                                        setSelectedAction(action);
                                        setIsModalOpen(true);
                                      }}
                                      className='px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 rounded-lg shadow-lg hover:shadow-xl hover:from-orange-600 hover:via-orange-700 hover:to-red-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-1.5 border-2 border-orange-400'>
                                      <span>✨</span>
                                      <span>Wave It!</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className='mt-5 p-5 bg-white rounded-xl border border-gray-200 shadow-sm'>
                        <div className='flex items-center justify-between'>
                          <p className='text-sm text-gray-600'>
                            No proposal created yet for this assumption
                          </p>
                          <button
                            onClick={() => handleCreateProposal(assumption)}
                            className='px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded hover:bg-primary-700 transition-colors flex items-center'>
                            <PlusIcon className='w-4 h-4 mr-2' />
                            Create Proposal
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Wave Initiative Modal */}
      {isModalOpen && selectedAction && (
        <WaveInitiativeModal
          action={selectedAction}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedAction(null);
          }}
          onSuccess={() => {
            if (selectedAction) {
              // Find the proposal containing this action and update it to L0
              setProposals((prev) => {
                const next = new Map(prev);
                for (const [proposalId, proposal] of next.entries()) {
                  const actionIndex = proposal.actions.findIndex(
                    (a) => a.id === selectedAction.id
                  );
                  if (actionIndex !== -1) {
                    const updatedActions = [...proposal.actions];
                    updatedActions[actionIndex] = {
                      ...updatedActions[actionIndex],
                      stage: 'L0',
                    };
                    next.set(proposalId, {
                      ...proposal,
                      actions: updatedActions,
                      lastUpdated: new Date(),
                    });
                    break;
                  }
                }
                return next;
              });
            }
            setIsModalOpen(false);
            setSelectedAction(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <DeleteConfirmationModal
          assumptionName={deleteConfirmation.assumptionName}
          isSuggested={deleteConfirmation.isSuggested}
          onClose={() => setDeleteConfirmation(null)}
          onConfirm={confirmDeleteAssumption}
        />
      )}

      {/* Value Driver Modal */}
      {isValueDriverModalOpen && (
        <ValueDriverModal
          isOpen={isValueDriverModalOpen}
          onClose={() => {
            setIsValueDriverModalOpen(false);
            setSelectedAssumption(null);
            setIsCumulativeView(false);
          }}
          valueDriverHierarchy={mockValueDriverHierarchy}
          selectedAssumption={selectedAssumption}
          isCumulativeView={isCumulativeView}
          cumulativeChanges={
            isCumulativeView ? getCumulativeValueDriverChanges() : undefined
          }
          onUpdateAssumption={(assumptionId, valueDriverChanges) => {
            // Update the assumption in the appropriate list
            if (selectedAssumption?.isSuggested) {
              setSuggestedAssumptions((prev) =>
                prev.map((a) =>
                  a.id === assumptionId ? { ...a, valueDriverChanges } : a
                )
              );
            } else {
              setAppliedAssumptions((prev) =>
                prev.map((a) =>
                  a.id === assumptionId ? { ...a, valueDriverChanges } : a
                )
              );
            }
            // Update selected assumption to reflect changes
            setSelectedAssumption((prev) =>
              prev ? { ...prev, valueDriverChanges } : null
            );
          }}
        />
      )}

      {/* Create Proposal Modal */}
      {isCreateProposalModalOpen && selectedAssumptionForProposal && (
        <CreateProposalModal
          assumption={selectedAssumptionForProposal}
          onClose={() => {
            setIsCreateProposalModalOpen(false);
            setSelectedAssumptionForProposal(null);
          }}
          onSave={handleSaveProposal}
        />
      )}

      {/* Create Initiative Modal */}
      {isCreateActionModalOpen && selectedProposalForAction && (
        <CreateActionModal
          proposal={selectedProposalForAction}
          onClose={() => {
            setIsCreateActionModalOpen(false);
            setSelectedProposalForAction(null);
          }}
          onSave={handleSaveAction}
        />
      )}

      {/* Global Create Action Modal */}
      <CreateActionModalGlobal
        isOpen={isCreateActionGlobalModalOpen}
        onClose={() => setIsCreateActionGlobalModalOpen(false)}
      />
    </div>
  );
}

interface WaveInitiativeModalProps {
  action: ActionProposal;
  onClose: () => void;
  onSuccess: () => void;
}

function WaveInitiativeModal({
  action,
  onClose,
  onSuccess,
}: WaveInitiativeModalProps) {
  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div
        className='fixed inset-0 bg-black bg-opacity-50 transition-opacity'
        onClick={onClose}></div>

      <div className='flex items-center justify-center min-h-screen p-4'>
        <div className='relative bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col'>
          <div className='flex items-center justify-between p-6 border-b border-gray-200'>
            <div>
              <h3 className='text-xl font-semibold text-gray-900'>Wave It!</h3>
              <p className='mt-1 text-sm text-gray-500'>{action.description}</p>
            </div>
            <button
              onClick={onClose}
              className='p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors'>
              <XMarkIcon className='w-6 h-6' />
            </button>
          </div>

          <div className='flex-1 p-6 overflow-y-auto'>
            <p className='text-gray-600'>
              Wave initiative creation form would go here...
            </p>
          </div>

          <div className='flex items-center justify-center gap-3 p-6 border-t border-gray-200 bg-gray-50'>
            <button
              onClick={onSuccess}
              className='px-8 py-3 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors'>
              Create
            </button>
            <button
              onClick={onClose}
              className='px-8 py-3 text-sm font-medium text-white bg-blue-400 rounded-lg hover:bg-blue-500 transition-colors'>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DeleteConfirmationModalProps {
  assumptionName: string;
  isSuggested: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteConfirmationModal({
  assumptionName,
  isSuggested,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) {
  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div
        className='fixed inset-0 bg-black bg-opacity-50 transition-opacity'
        onClick={onClose}></div>

      <div className='flex items-center justify-center min-h-screen p-4'>
        <div className='relative bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden'>
          <div className='flex items-center justify-between p-6 border-b border-gray-200'>
            <h3 className='text-xl font-semibold text-gray-900'>
              Delete Assumption
            </h3>
            <button
              onClick={onClose}
              className='p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors'>
              <XMarkIcon className='w-6 h-6' />
            </button>
          </div>

          <div className='p-6'>
            <p className='text-gray-700 mb-4'>
              Are you sure you want to delete the assumption{' '}
              <span className='font-semibold text-gray-900'>
                "{assumptionName}"
              </span>
              ?
            </p>
            <p className='text-sm text-gray-500'>
              {isSuggested
                ? 'This will remove it from the Pulse Suggested Assumptions list.'
                : 'This will remove it from the Applied Assumptions list and it will no longer affect the waterfall forecast.'}
            </p>
          </div>

          <div className='flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg'>
            <button
              onClick={onClose}
              className='px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'>
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className='px-6 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors'>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ValueDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  valueDriverHierarchy: FinancialCategoryGroup[];
  selectedAssumption: AppliedAssumption | null;
  isCumulativeView: boolean;
  cumulativeChanges?: Map<
    string,
    { change: number; unit?: string; changePercent?: number }
  >;
  onUpdateAssumption?: (
    assumptionId: string,
    valueDriverChanges: ValueDriverChange[]
  ) => void;
}

function ValueDriverModal({
  isOpen,
  onClose,
  valueDriverHierarchy,
  selectedAssumption,
  isCumulativeView,
  cumulativeChanges,
  onUpdateAssumption,
}: ValueDriverModalProps) {
  const { formatAmount, currencyLabel } = useCurrency();
  const [editingChanges, setEditingChanges] = useState<
    Map<string, { change: number; unit?: string; changePercent?: number }>
  >(new Map());
  const [isEditing, setIsEditing] = useState(false);
  const [newDriverId, setNewDriverId] = useState<string>('');
  const [newDriverChange, setNewDriverChange] = useState<string>('');
  const [newDriverUnit, setNewDriverUnit] = useState<string>('');
  const [newDriverPercent, setNewDriverPercent] = useState<string>('');

  // Initialize editing changes when assumption changes
  useEffect(() => {
    if (selectedAssumption && !isCumulativeView) {
      const changes = new Map<
        string,
        { change: number; unit?: string; changePercent?: number }
      >();
      selectedAssumption.valueDriverChanges?.forEach((vdChange) => {
        changes.set(vdChange.valueDriverId, {
          change: vdChange.change,
          unit: vdChange.unit,
          changePercent: vdChange.changePercent,
        });
      });
      setEditingChanges(changes);
      setIsEditing(false);
    }
  }, [selectedAssumption, isCumulativeView]);

  if (!isOpen) return null;

  const getModalTitle = () => {
    if (isCumulativeView) {
      return 'Cumulative Value Drivers - Applied Assumptions';
    }
    if (selectedAssumption) {
      return `Value Drivers - ${selectedAssumption.name}`;
    }
    return 'Value Drivers';
  };

  const getModalDescription = () => {
    if (isCumulativeView) {
      return 'Aggregated value driver changes from all enabled applied assumptions';
    }
    if (selectedAssumption) {
      return `Value driver changes specific to this assumption (deviations from overall values)`;
    }
    return 'Key metrics driving financial performance';
  };

  // Get value driver changes to display
  const getValueDriverChanges = (): Map<
    string,
    { change: number; unit?: string; changePercent?: number }
  > => {
    if (isCumulativeView && cumulativeChanges) {
      return cumulativeChanges;
    }
    if (selectedAssumption && isEditing && editingChanges.size > 0) {
      return editingChanges;
    }
    if (selectedAssumption?.valueDriverChanges) {
      const changes = new Map<
        string,
        { change: number; unit?: string; changePercent?: number }
      >();
      selectedAssumption.valueDriverChanges.forEach((vdChange) => {
        changes.set(vdChange.valueDriverId, {
          change: vdChange.change,
          unit: vdChange.unit,
          changePercent: vdChange.changePercent,
        });
      });
      return changes;
    }
    return new Map();
  };

  const valueDriverChanges = getValueDriverChanges();

  // Get all available value drivers for adding new ones
  const getAllValueDrivers = () => {
    const allDrivers: Array<{
      id: string;
      name: string;
      category: string;
      metric: string;
      unit?: string;
    }> = [];
    valueDriverHierarchy.forEach((financial) => {
      financial.metrics.forEach((metric) => {
        metric.valueDrivers.forEach((driver) => {
          allDrivers.push({
            id: driver.id,
            name: driver.name,
            category: financial.name,
            metric: metric.name,
            unit: driver.unit,
          });
        });
      });
    });
    return allDrivers;
  };

  const availableDrivers = getAllValueDrivers();
  const unusedDrivers = availableDrivers.filter(
    (d) => !editingChanges.has(d.id)
  );

  const handleSaveChanges = () => {
    if (!selectedAssumption || !onUpdateAssumption) return;

    const changes: ValueDriverChange[] = Array.from(
      editingChanges.entries()
    ).map(([valueDriverId, change]) => ({
      valueDriverId,
      change: change.change,
      unit: change.unit,
      changePercent: change.changePercent,
    }));

    onUpdateAssumption(selectedAssumption.id, changes);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    // Reset to original values
    if (selectedAssumption?.valueDriverChanges) {
      const changes = new Map<
        string,
        { change: number; unit?: string; changePercent?: number }
      >();
      selectedAssumption.valueDriverChanges.forEach((vdChange) => {
        changes.set(vdChange.valueDriverId, {
          change: vdChange.change,
          unit: vdChange.unit,
          changePercent: vdChange.changePercent,
        });
      });
      setEditingChanges(changes);
    } else {
      setEditingChanges(new Map());
    }
    setIsEditing(false);
    setNewDriverId('');
    setNewDriverChange('');
    setNewDriverUnit('');
    setNewDriverPercent('');
  };

  const handleAddNewDriver = () => {
    if (!newDriverId || !newDriverChange) return;

    const change = parseFloat(newDriverChange);
    if (isNaN(change)) return;

    const driver = availableDrivers.find((d) => d.id === newDriverId);
    if (!driver) return;

    const newChange = {
      change,
      unit: newDriverUnit || driver.unit,
      changePercent: newDriverPercent
        ? parseFloat(newDriverPercent)
        : undefined,
    };

    setEditingChanges((prev) => {
      const next = new Map(prev);
      next.set(newDriverId, newChange);
      return next;
    });

    setNewDriverId('');
    setNewDriverChange('');
    setNewDriverUnit('');
    setNewDriverPercent('');
  };

  const handleRemoveDriver = (driverId: string) => {
    setEditingChanges((prev) => {
      const next = new Map(prev);
      next.delete(driverId);
      return next;
    });
  };

  const handleUpdateChange = (
    driverId: string,
    field: 'change' | 'unit' | 'changePercent',
    value: string | number | undefined
  ) => {
    setEditingChanges((prev) => {
      const next = new Map(prev);
      const existing = next.get(driverId) || { change: 0 };
      next.set(driverId, {
        ...existing,
        [field]: value,
      });
      return next;
    });
  };

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div
        className='fixed inset-0 bg-black bg-opacity-50 transition-opacity'
        onClick={onClose}></div>

      <div className='flex items-center justify-center min-h-screen p-4'>
        <div className='relative bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] flex flex-col'>
          <div className='flex items-center justify-between p-6 border-b border-gray-200'>
            <div>
              <h3 className='text-2xl font-semibold text-gray-900'>
                {getModalTitle()}
              </h3>
              <p className='mt-1 text-sm text-gray-500'>
                {getModalDescription()}
              </p>
            </div>
            <div className='flex items-center gap-2'>
              {selectedAssumption &&
                !isCumulativeView &&
                onUpdateAssumption && (
                  <button
                    onClick={() => {
                      if (isEditing) {
                        handleCancelEdit();
                      } else {
                        setIsEditing(true);
                      }
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isEditing
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}>
                    {isEditing ? 'Cancel Edit' : 'Edit'}
                  </button>
                )}
              <button
                onClick={onClose}
                className='p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors'>
                <XMarkIcon className='w-6 h-6' />
              </button>
            </div>
          </div>

          <div className='flex-1 p-6 overflow-y-auto'>
            {selectedAssumption || isCumulativeView ? (
              // Show assumption-specific or cumulative changes
              <div className='space-y-6'>
                {/* Add Value Driver Section */}
                {isEditing &&
                  selectedAssumption &&
                  !isCumulativeView &&
                  onUpdateAssumption && (
                    <div className='bg-blue-50 border-2 border-blue-200 rounded-xl p-6'>
                      <h4 className='text-lg font-semibold text-gray-900 mb-4'>
                        Add Value Driver
                      </h4>
                      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                        <div>
                          <label className='block text-xs font-medium text-gray-700 mb-1'>
                            Value Driver
                          </label>
                          <select
                            value={newDriverId}
                            onChange={(e) => setNewDriverId(e.target.value)}
                            className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500'>
                            <option value=''>Select a value driver</option>
                            {unusedDrivers.map((driver) => (
                              <option
                                key={driver.id}
                                value={driver.id}>
                                {driver.category} - {driver.metric} -{' '}
                                {driver.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className='block text-xs font-medium text-gray-700 mb-1'>
                            Change
                          </label>
                          <input
                            type='number'
                            step='any'
                            value={newDriverChange}
                            onChange={(e) => setNewDriverChange(e.target.value)}
                            placeholder='e.g., -5'
                            className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500'
                          />
                        </div>
                        <div>
                          <label className='block text-xs font-medium text-gray-700 mb-1'>
                            Unit
                          </label>
                          <input
                            type='text'
                            value={newDriverUnit}
                            onChange={(e) => setNewDriverUnit(e.target.value)}
                            placeholder={`e.g., FTE, ${currencyLabel}/hour`}
                            className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500'
                          />
                        </div>
                        <div className='flex items-end'>
                          <button
                            onClick={handleAddNewDriver}
                            disabled={!newDriverId || !newDriverChange}
                            className='w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors'>
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                {valueDriverHierarchy.map((financial) => (
                  <div
                    key={financial.id}
                    className='border border-gray-200 rounded-xl overflow-hidden shadow-md'>
                    <div className='bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-b border-gray-200'>
                      <h4 className='text-base font-bold text-gray-900'>
                        {financial.name}
                      </h4>
                    </div>

                    <div className='divide-y divide-gray-100'>
                      {financial.metrics.map((metric) => {
                        // Filter value drivers that have changes
                        const driversWithChanges = metric.valueDrivers.filter(
                          (driver) => valueDriverChanges.has(driver.id)
                        );

                        if (driversWithChanges.length === 0) return null;

                        return (
                          <div
                            key={metric.id}
                            className='bg-white'>
                            {metric.name && (
                              <div className='px-6 py-3 bg-gray-50/70 border-b border-gray-100'>
                                <h5 className='text-sm font-semibold text-gray-800'>
                                  {metric.name}
                                </h5>
                              </div>
                            )}

                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4'>
                              {driversWithChanges.map((driver) => {
                                const change = valueDriverChanges.get(
                                  driver.id
                                );
                                const baseValue = driver.value || 0;
                                const changeValue = change?.change || 0;
                                const newValue = baseValue + changeValue;

                                return (
                                  <div
                                    key={driver.id}
                                    className='bg-gradient-to-br from-white to-gray-50 rounded-lg p-4 border-2 border-primary-200 hover:border-primary-300 hover:shadow-md transition-all duration-200'>
                                    <div className='flex items-start justify-between mb-2'>
                                      <span className='text-sm font-medium text-gray-700 flex-1'>
                                        {driver.name}
                                      </span>
                                      {isEditing &&
                                        selectedAssumption &&
                                        !isCumulativeView && (
                                          <button
                                            onClick={() =>
                                              handleRemoveDriver(driver.id)
                                            }
                                            className='p-1 text-red-400 hover:text-red-600 transition-colors'>
                                            <XMarkIcon className='w-4 h-4' />
                                          </button>
                                        )}
                                    </div>

                                    {/* Base Value */}
                                    <div className='mb-2'>
                                      <div className='text-xs text-gray-500 mb-1'>
                                        Base Value:
                                      </div>
                                      <div className='text-sm font-semibold text-gray-900'>
                                        {formatAmount(baseValue)}
                                        {driver.unit && (
                                          <span className='text-gray-600 ml-1'>
                                            {driver.unit}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Change */}
                                    <div className='mb-2'>
                                      <div className='text-xs text-gray-500 mb-1'>
                                        Change:
                                      </div>
                                      {isEditing &&
                                      selectedAssumption &&
                                      !isCumulativeView ? (
                                        <div className='space-y-2'>
                                          <input
                                            type='number'
                                            step='any'
                                            value={
                                              editingChanges.get(driver.id)
                                                ?.change || changeValue
                                            }
                                            onChange={(e) =>
                                              handleUpdateChange(
                                                driver.id,
                                                'change',
                                                parseFloat(e.target.value) || 0
                                              )
                                            }
                                            className='w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500'
                                          />
                                          <input
                                            type='text'
                                            placeholder='Unit'
                                            value={
                                              editingChanges.get(driver.id)
                                                ?.unit ||
                                              change?.unit ||
                                              ''
                                            }
                                            onChange={(e) =>
                                              handleUpdateChange(
                                                driver.id,
                                                'unit',
                                                e.target.value
                                              )
                                            }
                                            className='w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500'
                                          />
                                          <input
                                            type='number'
                                            step='any'
                                            placeholder='Change % (optional)'
                                            value={
                                              editingChanges.get(driver.id)
                                                ?.changePercent !== undefined
                                                ? editingChanges.get(driver.id)
                                                    ?.changePercent
                                                : change?.changePercent !==
                                                  undefined
                                                ? change.changePercent
                                                : ''
                                            }
                                            onChange={(e) =>
                                              handleUpdateChange(
                                                driver.id,
                                                'changePercent',
                                                e.target.value
                                                  ? parseFloat(e.target.value)
                                                  : undefined
                                              )
                                            }
                                            className='w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500'
                                          />
                                        </div>
                                      ) : (
                                        <div
                                          className={`text-sm font-semibold ${
                                            changeValue >= 0
                                              ? 'text-opportunity-600'
                                              : 'text-risk-600'
                                          }`}>
                                          {changeValue > 0 ? '+' : ''}
                                          {formatAmount(changeValue)}
                                          {change?.unit && (
                                            <span className='ml-1'>
                                              {change.unit}
                                            </span>
                                          )}
                                          {change?.changePercent !==
                                            undefined && (
                                            <span className='ml-2 text-xs'>
                                              (
                                              {change.changePercent > 0
                                                ? '+'
                                                : ''}
                                              {change.changePercent.toFixed(1)}
                                              %)
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    {/* New Value */}
                                    {!isEditing && (
                                      <div className='pt-2 border-t border-gray-200'>
                                        <div className='text-xs text-gray-500 mb-1'>
                                          New Value:
                                        </div>
                                        <div className='text-base font-bold text-gray-900'>
                                          {formatAmount(newValue)}
                                          {change?.unit || driver.unit ? (
                                            <span className='text-gray-600 ml-1 text-sm'>
                                              {change?.unit || driver.unit}
                                            </span>
                                          ) : null}
                                        </div>
                                      </div>
                                    )}
                                    {isEditing &&
                                      selectedAssumption &&
                                      !isCumulativeView && (
                                        <div className='pt-2 border-t border-gray-200'>
                                          <div className='text-xs text-gray-500 mb-1'>
                                            New Value:
                                          </div>
                                          <div className='text-base font-bold text-gray-900'>
                                            {formatAmount(
                                              baseValue +
                                                (editingChanges.get(driver.id)
                                                  ?.change || changeValue)
                                            )}
                                            {editingChanges.get(driver.id)
                                              ?.unit ||
                                            change?.unit ||
                                            driver.unit ? (
                                              <span className='text-gray-600 ml-1 text-sm'>
                                                {editingChanges.get(driver.id)
                                                  ?.unit ||
                                                  change?.unit ||
                                                  driver.unit}
                                              </span>
                                            ) : null}
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Show overall value drivers (no changes highlighted)
              <div className='space-y-4'>
                {valueDriverHierarchy.map((financial) => (
                  <div
                    key={financial.id}
                    className='border border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200'>
                    <div className='bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-b border-gray-200'>
                      <h3 className='text-base font-bold text-gray-900'>
                        {financial.name}
                      </h3>
                    </div>

                    <div className='divide-y divide-gray-100'>
                      {financial.metrics.map((metric) => (
                        <div
                          key={metric.id}
                          className='bg-white'>
                          {metric.name && (
                            <div className='px-6 py-3 bg-gray-50/70 border-b border-gray-100'>
                              <h4 className='text-sm font-semibold text-gray-800'>
                                {metric.name}
                              </h4>
                            </div>
                          )}

                          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4'>
                            {metric.valueDrivers.map((driver) => (
                              <div
                                key={driver.id}
                                className='bg-gradient-to-br from-white to-gray-50 rounded-lg p-4 hover:from-gray-50 hover:to-gray-100 hover:shadow-md transition-all duration-200 border border-gray-100'>
                                <div className='flex items-start justify-between mb-2'>
                                  <span className='text-xs font-medium text-gray-700 flex-1'>
                                    {driver.name}
                                  </span>
                                  {driver.changePercent !== undefined && (
                                    <span
                                      className={`text-xs font-semibold ml-2 ${
                                        driver.changePercent >= 0
                                          ? 'text-opportunity-600'
                                          : 'text-risk-600'
                                      }`}>
                                      {driver.changePercent > 0 ? '+' : ''}
                                      {driver.changePercent.toFixed(1)}%
                                    </span>
                                  )}
                                </div>
                                {driver.value !== undefined && (
                                  <div className='text-sm'>
                                    <span className='font-semibold text-gray-900'>
                                      {formatAmount(driver.value)}
                                    </span>
                                    {driver.unit && (
                                      <span className='text-gray-600 ml-1'>
                                        {driver.unit}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className='flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg'>
            {isEditing &&
            selectedAssumption &&
            !isCumulativeView &&
            onUpdateAssumption ? (
              <>
                <button
                  onClick={handleCancelEdit}
                  className='px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'>
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  className='px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors'>
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className='px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'>
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface CreateProposalModalProps {
  assumption: AppliedAssumption;
  onClose: () => void;
  onSave: (proposal: Proposal) => void;
}

function CreateProposalModal({
  assumption,
  onClose,
  onSave,
}: CreateProposalModalProps) {
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    const newProposal: Proposal = {
      id: `proposal-${Date.now()}`,
      assumptionId: assumption.id,
      description: description.trim() || undefined,
      actions: [],
      createdDate: new Date(),
      lastUpdated: new Date(),
    };
    onSave(newProposal);
  };

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div
        className='fixed inset-0 bg-black bg-opacity-50 transition-opacity'
        onClick={onClose}></div>

      <div className='flex items-center justify-center min-h-screen p-4'>
        <div className='relative bg-white rounded-lg shadow-xl w-full max-w-2xl'>
          <div className='flex items-center justify-between p-6 border-b border-gray-200'>
            <div>
              <h3 className='text-xl font-semibold text-gray-900'>
                Create Proposal
              </h3>
              <p className='mt-1 text-sm text-gray-500'>
                For assumption: {assumption.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className='p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors'>
              <XMarkIcon className='w-6 h-6' />
            </button>
          </div>

          <div className='p-6'>
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Proposal Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='Enter a description for this proposal...'
                className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500'
                rows={4}
              />
            </div>
          </div>

          <div className='flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50'>
            <button
              onClick={onClose}
              className='px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'>
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className='px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors'>
              Create Proposal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CreateActionModalProps {
  proposal: Proposal;
  onClose: () => void;
  onSave: (proposalId: string, action: ActionProposal) => void;
}

function CreateActionModal({
  proposal,
  onClose,
  onSave,
}: CreateActionModalProps) {
  const { currencyLabel } = useCurrency();
  const [description, setDescription] = useState('');
  const [expectedImpact, setExpectedImpact] = useState('');
  const [feasibility, setFeasibility] = useState<'high' | 'medium' | 'low'>(
    'medium'
  );
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const handleSubmit = () => {
    if (!description.trim() || !expectedImpact) return;

    const impact = parseFloat(expectedImpact);
    if (isNaN(impact)) return;

    const newAction: ActionProposal = {
      id: `action-${Date.now()}`,
      description: description.trim(),
      expectedImpact: impact,
      feasibility,
      priority,
    };
    onSave(proposal.id, newAction);
  };

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div
        className='fixed inset-0 bg-black bg-opacity-50 transition-opacity'
        onClick={onClose}></div>

      <div className='flex items-center justify-center min-h-screen p-4'>
        <div className='relative bg-white rounded-lg shadow-xl w-full max-w-2xl'>
          <div className='flex items-center justify-between p-6 border-b border-gray-200'>
            <div>
              <h3 className='text-xl font-semibold text-gray-900'>
                Add Initiative
              </h3>
              <p className='mt-1 text-sm text-gray-500'>
                Add a new initiative to this proposal
              </p>
            </div>
            <button
              onClick={onClose}
              className='p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors'>
              <XMarkIcon className='w-6 h-6' />
            </button>
          </div>

          <div className='p-6 space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Initiative Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='Describe the initiative...'
                className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500'
                rows={3}
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Expected Impact (M {currencyLabel}) *
              </label>
              <input
                type='number'
                step='0.1'
                value={expectedImpact}
                onChange={(e) => setExpectedImpact(e.target.value)}
                placeholder='e.g., 2.5'
                className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500'
                required
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Feasibility
                </label>
                <select
                  value={feasibility}
                  onChange={(e) =>
                    setFeasibility(e.target.value as 'high' | 'medium' | 'low')
                  }
                  className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500'>
                  <option value='high'>High</option>
                  <option value='medium'>Medium</option>
                  <option value='low'>Low</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as 'high' | 'medium' | 'low')
                  }
                  className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500'>
                  <option value='high'>High</option>
                  <option value='medium'>Medium</option>
                  <option value='low'>Low</option>
                </select>
              </div>
            </div>
          </div>

          <div className='flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50'>
            <button
              onClick={onClose}
              className='px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'>
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!description.trim() || !expectedImpact}
              className='px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors'>
              Add Initiative
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
