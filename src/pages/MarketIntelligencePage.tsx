import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  NewspaperIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BudgetForecastActualWaterfall from '../components/BudgetForecastActualWaterfall';
import HeaderFilters from '../components/HeaderFilters';
import TimeframePicker, {
  type TimeframeOption,
  type TimeframeOptionItem,
} from '../components/TimeframePicker';
import { useBudgets } from '../contexts/BudgetContext';
import { getMainBusinessGroupOptions } from '../data/mockBusinessGroupPerformance';
import {
  mockAppliedAssumptions,
  mockOPWaterfallStages,
  mockSuggestedAssumptions,
  mockValueDriverHierarchy,
} from '../data/mockForecast';
import { mockNews } from '../data/mockNews';
import type {
  ActionProposal,
  AppliedAssumption,
  BudgetForecastStage,
  FinancialCategoryGroup,
  NewsItem,
  Proposal,
  ValueDriverChange,
} from '../types';
import { setStoredTimeframe } from '../utils/timeframeStorage';

const toMillions = (value: number) => value / 1_000;
const roundToOne = (value: number) => Math.round(value * 10) / 10;
const normalizeGroupId = (groupName: string) => {
  const key = groupName.trim().toLowerCase();
  return key === 'other' ? 'others' : key;
};

const getUnitId = (groupId: string, unitName: string) =>
  `${groupId}-${unitName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

export default function MarketIntelligencePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { businessGroups, budgetChanges, updateBudgets } = useBudgets();
  const [selectedTimeframe, setSelectedTimeframe] =
    useState<TimeframeOption>('full-year');
  const [selectedBu, setSelectedBu] = useState<string>(
    searchParams.get('bu') || 'all'
  );
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(
    new Set()
  );
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
  const [isReviseBudgetModalOpen, setIsReviseBudgetModalOpen] = useState(false);
  const [activePerformanceSection, setActivePerformanceSection] = useState<
    BudgetForecastStage['stage'] | null
  >(null);

  useEffect(() => {
    setStoredTimeframe(selectedTimeframe);
  }, [selectedTimeframe]);

  useEffect(() => {
    const buParam = searchParams.get('bu');
    if (buParam) {
      setSelectedBu(buParam);
    }
  }, [searchParams]);

  const mainBuOptions = getMainBusinessGroupOptions();
  const selectedGroup = useMemo(() => {
    if (selectedBu === 'all') {
      return null;
    }
    return (
      businessGroups.find(
        (group) => normalizeGroupId(group.group) === selectedBu
      ) ?? null
    );
  }, [businessGroups, selectedBu]);
  const selectedBgName =
    selectedBu === 'all'
      ? 'All BGs'
      : selectedGroup?.group ??
        mainBuOptions.find((bu) => bu.id === selectedBu)?.name ??
        selectedBu.toUpperCase();

  const handleBuChange = (buId: string) => {
    setSelectedBu(buId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('bu', buId);
      return next;
    });
  };

  useEffect(() => {
    if (!selectedGroup) {
      setSelectedGroupIds(new Set());
      return;
    }
    const groupId = normalizeGroupId(selectedGroup.group);
    const overallId = `${groupId}-overall`;
    setSelectedGroupIds(new Set([overallId]));
  }, [selectedGroup]);

  const forecastTimeframeOptions: TimeframeOptionItem[] = [
    { value: 'full-year', label: 'Full year' },
  ];

  const focusOptions = [
    {
      id: 'market-performance',
      label: 'Volume/mix change due to customer forecast update',
      subtitle:
        'Volume/mix change analysis - You are here. Toggle assumptions below to see impact.',
    },
    {
      id: 'l3-vs-target',
      label: 'Initiative deviation vs budget',
      subtitle:
        'Initiative deviation analysis - You are here. Toggle assumptions below to see impact.',
    },
    {
      id: 'one-off-adjustments',
      label: 'Other factors (impact realized in actuals)',
      subtitle:
        'Other factors analysis - You are here. Toggle assumptions below to see impact.',
    },
  ] as const;

  type FocusOptionId = (typeof focusOptions)[number]['id'];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const resolveFocus = useCallback((value: string | null): FocusOptionId => {
    const match = focusOptions.find((option) => option.id === value);
    return match?.id ?? 'market-performance';
  }, [focusOptions]);

  const [selectedFocusStage, setSelectedFocusStage] =
    useState<FocusOptionId | null>(() =>
      searchParams.get('focus')
        ? resolveFocus(searchParams.get('focus'))
        : null
    );

  const assumptionStageFilters = useMemo<
    Partial<Record<BudgetForecastStage['stage'], string[]>>
  >(
    () =>
      ({
        'market-performance': [
          'AI Data Center Acceleration',
          'Apple AirPods Launch Delay',
        ],
        'l3-vs-target': [
          'AI Data Center Acceleration',
          'Apple AirPods Launch Delay',
        ],
        'one-off-adjustments': ['Copper Price Surge'],
      }),
    []
  );

  const activeAssumptionFilterStage =
    activePerformanceSection as BudgetForecastStage['stage'] | null;
  const filteredAppliedAssumptions = useMemo(() => {
    if (!activeAssumptionFilterStage) {
      return appliedAssumptions;
    }
    const allowedNames = assumptionStageFilters[activeAssumptionFilterStage];
    if (!allowedNames) {
      return appliedAssumptions;
    }
    return appliedAssumptions.filter((assumption) =>
      allowedNames.includes(assumption.name)
    );
  }, [activeAssumptionFilterStage, appliedAssumptions, assumptionStageFilters]);

  const selectedUnits = useMemo(() => {
    if (selectedBu === 'all') {
      return businessGroups.flatMap((group) => group.businessUnits);
    return businessGroups.flatMap((group) => group.businessUnits);
    }
    if (!selectedGroup) {
      return [];
    }
    const groupId = normalizeGroupId(selectedGroup.group);
    const overallId = `${groupId}-overall`;
    const isAllSelected =
      selectedGroupIds.size === 0 || selectedGroupIds.has(overallId);
    return isAllSelected
      ? selectedGroup.businessUnits
      : selectedGroup.businessUnits.filter((unit) =>
          selectedGroupIds.has(getUnitId(groupId, unit.name))
        );
  }, [businessGroups, selectedBu, selectedGroup, selectedGroupIds]);

  const selectedUnitIds = useMemo(() => {
    if (selectedBu === 'all' || !selectedGroup) {
      return ['all'];
    }
    const groupId = normalizeGroupId(selectedGroup.group);
    const overallId = `${groupId}-overall`;
    const isAllSelected =
      selectedGroupIds.size === 0 || selectedGroupIds.has(overallId);
    if (isAllSelected) {
      return ['all'];
    }
    const unitIds = selectedGroup.businessUnits
      .map((unit) => getUnitId(groupId, unit.name))
      .filter((unitId) => selectedGroupIds.has(unitId));
    return unitIds.length > 0 ? unitIds : ['all'];
  }, [selectedBu, selectedGroup, selectedGroupIds]);

  const selectedBuLabel = useMemo(() => {
    if (selectedBu === 'all' || !selectedGroup) {
      return 'All BUs';
    }
    const groupId = normalizeGroupId(selectedGroup.group);
    const overallId = `${groupId}-overall`;
    const isAllSelected =
      selectedGroupIds.size === 0 || selectedGroupIds.has(overallId);
    if (isAllSelected) {
      return 'All BUs';
    }
    const selectedUnitNames = selectedGroup.businessUnits
      .filter((unit) => selectedGroupIds.has(getUnitId(groupId, unit.name)))
      .map((unit) => unit.name);
    if (selectedUnitNames.length === 1) {
      return selectedUnitNames[0];
    }
    if (selectedUnitNames.length === 0) {
      return 'All BUs';
    }
    return `${selectedUnitNames.length} BUs selected`;
  }, [selectedBu, selectedGroup, selectedGroupIds]);

  const selectedBuOptionId = useMemo(() => {
    if (selectedBu === 'all' || !selectedGroup) {
      return 'all';
    }
    const groupId = normalizeGroupId(selectedGroup.group);
    const overallId = `${groupId}-overall`;
    const isAllSelected =
      selectedGroupIds.size === 0 || selectedGroupIds.has(overallId);
    if (isAllSelected) {
      return 'all';
    }
    const selectedUnitIds = selectedGroup.businessUnits
      .map((unit) => getUnitId(groupId, unit.name))
      .filter((unitId) => selectedGroupIds.has(unitId));
    if (selectedUnitIds.length === 1) {
      return selectedUnitIds[0];
    }
    if (selectedUnitIds.length === 0) {
      return 'all';
    }
    return 'multiple';
  }, [selectedBu, selectedGroup, selectedGroupIds]);

  const isSpecificBuSelected =
    selectedBu !== 'all' &&
    selectedBuOptionId !== 'all' &&
    selectedBuOptionId !== 'multiple';

  const selectedBudgetTotals = useMemo(() => {
    const totals = selectedUnits.reduce(
      (acc, unit) => {
        acc.revenue += unit.revenueBudget;
        acc.gp += unit.grossProfitBudget;
        acc.op += unit.operatingProfitBudget;
        acc.np += unit.netProfitBudget;
        return acc;
      },
      { revenue: 0, gp: 0, op: 0, np: 0 }
    );
    return {
      revenue: roundToOne(toMillions(totals.revenue)),
      gp: roundToOne(toMillions(totals.gp)),
      op: roundToOne(toMillions(totals.op)),
      np: roundToOne(toMillions(totals.np)),
    };
  }, [selectedUnits]);

  const bgUnitOptions = useMemo(() => {
    const options: Record<string, Array<{ id: string; name: string }>> = {};
    businessGroups.forEach((group) => {
      const groupId = normalizeGroupId(group.group);
      options[groupId] = group.businessUnits.map((unit) => ({
        id: getUnitId(groupId, unit.name),
        name: unit.name,
      }));
    });
    return options;
  }, [businessGroups]);

  const selectedForecastTotals = useMemo(() => {
    const totals = selectedUnits.reduce(
      (acc, unit) => {
        acc.budgetOp += unit.operatingProfitBudget;
        acc.forecastOp += unit.forecastOperatingProfit;
        acc.actualOp += unit.operatingProfit;
        return acc;
      },
      { budgetOp: 0, forecastOp: 0, actualOp: 0 }
    );

    return {
      budget: roundToOne(toMillions(totals.budgetOp)),
      forecast: roundToOne(toMillions(totals.forecastOp)),
      actual: roundToOne(toMillions(totals.actualOp)),
    };
  }, [selectedUnits]);

  useEffect(() => {
    const focusParam = searchParams.get('focus');
    if (focusParam) {
      setSelectedFocusStage(resolveFocus(focusParam));
      return;
    }
    setSelectedFocusStage(null);
  }, [searchParams]);

  const forecastWaterfallStages = useMemo(() => {
    const budgetStageValue = selectedForecastTotals.budget;
    const forecastTargetValue = selectedForecastTotals.forecast;
    const enabledSuggested = suggestedAssumptions.filter((assumption) =>
      enabledSuggestedAssumptionIds.has(assumption.id)
    );
    const rawEarlySignals = enabledSuggested.reduce(
      (sum, assumption) => sum + assumption.impact,
      0
    );
    const minEarlySignals = 30;
    const earlySignalsDelta = roundToOne(
      rawEarlySignals === 0
        ? minEarlySignals
        : rawEarlySignals > 0
        ? Math.max(minEarlySignals, rawEarlySignals)
        : -Math.max(minEarlySignals, Math.abs(rawEarlySignals))
    );
    const baseForecastValue = roundToOne(forecastTargetValue - earlySignalsDelta);
    const totalDelta = roundToOne(baseForecastValue - budgetStageValue);

    const split = [0.5, 0.3, 0.2];
    const deltas = split.map((ratio) =>
      roundToOne(totalDelta * ratio)
    );
    const roundedDelta = deltas.reduce((sum, value) => sum + value, 0);
    deltas[deltas.length - 1] = roundToOne(
      totalDelta - (roundedDelta - deltas[deltas.length - 1])
    );
    const [marketDelta, initiativePerformanceDelta, otherFactorsDelta] = deltas;

    let running = budgetStageValue;
    const stages: BudgetForecastStage[] = [];

    stages.push({
      stage: 'budget',
      label: 'Budget',
      value: running,
      delta: running,
      type: 'baseline',
      description: 'Budget baseline',
      isClickable: false,
    });

    const addStage = (
      stage: BudgetForecastStage['stage'],
      label: string,
      delta: number,
      description: string,
      typeOverride?: BudgetForecastStage['type'],
      isClickable = true
    ) => {
      running += delta;
      stages.push({
        stage,
        label,
        value: running,
        delta,
        type:
          typeOverride ?? (delta >= 0 ? 'positive' : 'negative'),
        description,
        isClickable,
      });
    };

    addStage(
      'market-performance',
      'Volume/mix change due to customer forecast update',
      marketDelta,
      'Volume/mix change due to customer forecast update'
    );
    addStage(
      'l3-vs-target',
      'Initiative deviation vs budget',
      initiativePerformanceDelta,
      'Initiative deviation vs budget'
    );
    addStage(
      'one-off-adjustments',
      'Other factors (impact realized in actuals)',
      otherFactorsDelta,
      'Other factors (impact realized in actuals)'
    );

    stages.push({
      stage: 'forecast',
      label: 'Forecast',
      value: running,
      delta: running,
      type: 'baseline',
      description: 'Forecast value (sum of prior bars)',
      isClickable: false,
    });

    addStage(
      'early-signals',
      'Early signals (Unrealized impact, high uncertainty)',
      earlySignalsDelta,
      'Preliminary signals with high uncertainty',
      'preliminary',
      true
    );

    stages.push({
      stage: 'forecast-with-early',
      label: 'Forecast incl. early indicated opportunities/risks',
      value: running,
      delta: running,
      type: 'baseline',
      description: 'Forecast including early indicated opportunities/risks',
      isClickable: false,
    });

    return stages;
  }, [
    enabledSuggestedAssumptionIds,
    selectedForecastTotals,
    suggestedAssumptions,
  ]);

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

    // If this is the Vietnam Minimum Wage Hike assumption, create a proposal with AI-generated actions
    if (
      assumptionId === 'assum-suggested-1' ||
      assumption.name === 'Vietnam Minimum Wage Hike'
    ) {
      const proposal: Proposal = {
        id: `proposal-${assumptionId}`,
        assumptionId: assumption.id,
        description:
          'Proposal to mitigate Vietnam minimum wage hike impact through operational efficiency and pricing adjustments',
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
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                {`Financial Forecast (2026 Full Year) - ${selectedBgName} - ${selectedBuLabel}`}
              </h1>
            </div>
            <button
              onClick={() => setIsReviseBudgetModalOpen(true)}
              disabled={!isSpecificBuSelected}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isSpecificBuSelected
                  ? 'text-white bg-primary-600 hover:bg-primary-700'
                  : 'text-gray-400 bg-gray-200 cursor-not-allowed'
              }`}>
              <PlusIcon className='w-5 h-5' />
              Revise budget target
            </button>
          </div>
        </div>

        {/* Timeframe + BG Selector */}
        <div className='mb-6'>
          <HeaderFilters
            timeframeContent={
              <TimeframePicker
                selectedTimeframe={selectedTimeframe}
                onTimeframeChange={setSelectedTimeframe}
                options={forecastTimeframeOptions}
              />
            }
            buOptions={mainBuOptions}
            selectedBu={selectedBu}
            onBuChange={handleBuChange}
          />
        </div>
        {selectedBu !== 'all' && selectedGroup && (
          <div className='mb-6 flex items-center gap-4'>
            <span className='text-sm font-medium text-gray-600 w-32'>
              Select BU
            </span>
            <div className='flex flex-wrap bg-gray-100 rounded-lg p-1'>
              {(() => {
                const groupId = normalizeGroupId(selectedGroup.group);
                const overallId = `${groupId}-overall`;
                const isAllSelected = selectedGroupIds.has(overallId);
                const toggleUnit = (unitId: string | 'all') => {
                  setSelectedGroupIds((prev) => {
                    const next = new Set(prev);
                    if (unitId === 'all') {
                      next.clear();
                      next.add(overallId);
                      return next;
                    }
                    next.delete(overallId);
                    if (next.has(unitId)) {
                      next.delete(unitId);
                    } else {
                      next.add(unitId);
                    }
                    if (next.size === 0) {
                      next.add(overallId);
                    }
                    return next;
                  });
                };

                return (
                  <>
                    <button
                      onClick={() => toggleUnit('all')}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        isAllSelected
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}>
                      All BUs
                    </button>
                    {selectedGroup.businessUnits.map((unit) => {
                      const unitId = getUnitId(groupId, unit.name);
                      const isSelected =
                        !isAllSelected && selectedGroupIds.has(unitId);
                      return (
                        <button
                          key={unitId}
                          onClick={() => toggleUnit(unitId)}
                          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            isSelected
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}>
                          {unit.name}
                        </button>
                      );
                    })}
                  </>
                );
              })()}
            </div>
          </div>
        )}

        <div className='space-y-8'>
          {/* Forecast Waterfall Chart */}
          <div className='space-y-4'>
            <div className='flex flex-wrap items-center justify-between gap-4'>
              <div>
                <h2 className='text-2xl font-bold text-gray-900'>
                  Forecast - Performance Waterfall
                </h2>
                <p className='text-sm text-gray-500'>
                  {selectedBgName} - {selectedBuLabel}
                </p>
              </div>
              <div className='flex flex-wrap items-center gap-4 text-sm text-gray-700'>
                <div className='flex items-center gap-2'>
                  <span className='h-3 w-3 rounded-full bg-risk-500' />
                  <span>Adverse</span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='h-3 w-3 rounded-full bg-opportunity-500' />
                  <span>Favourable</span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='h-3 w-3 rounded border border-gray-900 border-dashed bg-white' />
                  <span>Preliminary</span>
                </div>
              </div>
            </div>
            <BudgetForecastActualWaterfall
              stages={forecastWaterfallStages}
              title=''
              subtitle=''
              highlightedStage={
                activePerformanceSection ?? selectedFocusStage ?? undefined
              }
              hideLegend
              onStageClick={(stage) => {
                setActivePerformanceSection(stage.stage);
                setSelectedFocusStage(null);
              }}
            />
          </div>

          {/* Assumptions Section - Side by Side Layout */}
          {activePerformanceSection === 'early-signals' && (
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
                  <p className='text-sm text-gray-500'>
                    {isDragOverApplied
                      ? 'Drop assumption here to apply it'
                      : 'Assumptions already baked into the waterfall forecast'}
                  </p>
                </div>
                <button
                  onClick={handleViewOverallValueDrivers}
                  className='px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-200 flex items-center'>
                  <ChartBarIcon className='w-4 h-4 mr-2' />
                  Value Drivers
                </button>
              </div>

              <div className='space-y-4'>
                {filteredAppliedAssumptions.map((assumption) => {
                  const isEnabled = enabledAssumptionIds.has(assumption.id);
                  const stageLabel =
                    mockOPWaterfallStages.find(
                      (s) => s.stage === assumption.targetStage
                    )?.label || assumption.targetStage;

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
                          <span>Affects: {stageLabel}</span>
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
                          onClick={(e) => {
                            e.stopPropagation();
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
            </div>
          )}

          {activePerformanceSection === 'market-performance' && (
            <div className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-8'>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                Applied Assumptions
              </h2>
              <div className='space-y-4'>
                {[
                  {
                    title: 'Customer A forecast revision',
                    description:
                      'Customer A revises shipment forecast downward due to weaker end-market demand; total shipment volume declines ~6-8% vs. budget.',
                  },
                  {
                    title: 'Product XYZ ramp delay',
                    description:
                      'Volume mix shifts from delay in ramp of Product XYZ (new model).',
                  },
                  {
                    title: 'Legacy mix pressure',
                    description:
                      'Higher proportion of Product ABC (legacy, lower-margin SKU) in shipments, causing negative gross profit by ~12.0M.',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className='flex items-start justify-between p-5 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200'>
                    <div className='flex-1'>
                      <h3 className='text-base font-semibold text-gray-900 mb-2'>
                        {item.title}
                      </h3>
                      <p className='text-sm text-gray-600'>
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePerformanceSection === 'one-off-adjustments' && (
            <div className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 p-8'>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                Applied Assumptions
              </h2>
              <div className='space-y-4'>
                {[
                  {
                    title: 'Asset impairment / tooling write-off',
                    description:
                      'Program-specific tooling is no longer recoverable.',
                  },
                  {
                    title: 'Inventory write-down',
                    description:
                      'Customer demand revision after component procurement.',
                  },
                  {
                    title: 'Customer chargebacks & penalties',
                    description: 'Chargebacks and penalty settlements.',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className='flex items-start justify-between p-5 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200'>
                    <div className='flex-1'>
                      <h3 className='text-base font-semibold text-gray-900 mb-2'>
                        {item.title}
                      </h3>
                      <p className='text-sm text-gray-600'>
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Initiative Proposals - hidden for now */}
          {false && (
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
                            Impact: {assumption.impact > 0 ? '+' : ''}$
                            {assumption.impact.toFixed(1)}M
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
                                      Expected Impact: $
                                      {action.expectedImpact.toFixed(1)}M
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
          )}
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

      {/* Revise Budget Target Modal */}
        <ReviseBudgetModal
        isOpen={isReviseBudgetModalOpen}
        onClose={() => setIsReviseBudgetModalOpen(false)}
        selectedBgId={selectedBu}
        selectedBuId={selectedBuOptionId}
        selectedBgName={selectedBgName}
        selectedBuLabel={selectedBuLabel}
        budgetTotals={selectedBudgetTotals}
        bgOptions={mainBuOptions}
          budgetChanges={budgetChanges}
          bgUnitOptions={bgUnitOptions}
          onSave={(payload) =>
            updateBudgets({
              groupId: payload.bgId,
              unitIds: payload.unitIds,
              updates: payload.updates,
              note: payload.note,
              source: 'MarketIntelligencePage',
            })
          }
          defaultUnitIds={selectedUnitIds}
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

  // Get related news for an assumption
  const getRelatedNews = (assumption: AppliedAssumption): NewsItem[] => {
    const newsIds: string[] = [];

    // Collect news IDs from both single and multiple properties
    if (assumption.sourceNewsId) {
      newsIds.push(assumption.sourceNewsId);
    }
    if (assumption.sourceNewsIds) {
      newsIds.push(...assumption.sourceNewsIds);
    }

    // Get unique news items
    const uniqueIds = [...new Set(newsIds)];
    return uniqueIds
      .map((id) => mockNews.find((news) => news.id === id))
      .filter((news): news is NewsItem => news !== undefined)
      .slice(0, 3); // Limit to 3 news items
  };

  // Format timestamp for display
  const formatTimeAgo = (timestamp: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
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
                {/* Summary Section */}
                {selectedAssumption && !isCumulativeView && (
                  <div className='bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-200 p-5'>
                    <h4 className='text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3'>
                      Assumption Summary
                    </h4>
                    <div className='flex items-start gap-4'>
                      <div
                        className={`p-3 rounded-full flex-shrink-0 ${
                          selectedAssumption.impactType === 'positive'
                            ? 'bg-opportunity-100'
                            : 'bg-risk-100'
                        }`}>
                        {selectedAssumption.impactType === 'positive' ? (
                          <ArrowTrendingUpIcon className='w-6 h-6 text-opportunity-600' />
                        ) : (
                          <ArrowTrendingDownIcon className='w-6 h-6 text-risk-600' />
                        )}
                      </div>
                      <div className='flex-1'>
                        <div className='flex items-center gap-3 mb-2'>
                          <h3 className='text-2xl font-bold text-gray-900'>
                            {selectedAssumption.name}
                          </h3>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              selectedAssumption.impactType === 'positive'
                                ? 'bg-opportunity-100 text-opportunity-700'
                                : 'bg-risk-100 text-risk-700'
                            }`}>
                            {selectedAssumption.impactType === 'positive'
                              ? 'Tailwind'
                              : 'Headwind'}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              selectedAssumption.impact >= 0
                                ? 'bg-opportunity-100 text-opportunity-700'
                                : 'bg-risk-100 text-risk-700'
                            }`}>
                            {selectedAssumption.impact > 0 ? '+' : ''}$
                            {selectedAssumption.impact.toFixed(1)}M
                          </span>
                        </div>
                        <p className='text-sm text-gray-600 leading-relaxed'>
                          {selectedAssumption.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reference News Section */}
                {selectedAssumption &&
                  !isCumulativeView &&
                  (() => {
                    const relatedNews = getRelatedNews(selectedAssumption);
                    if (relatedNews.length === 0) return null;

                    return (
                      <div className='bg-white rounded-xl border border-gray-200 p-5'>
                        <div className='flex items-center gap-2 mb-4'>
                          <NewspaperIcon className='w-5 h-5 text-primary-600' />
                          <h4 className='text-sm font-semibold text-gray-500 uppercase tracking-wider'>
                            Reference News ({relatedNews.length})
                          </h4>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                          {relatedNews.map((news) => (
                            <div
                              key={news.id}
                              className='bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200'>
                              <div className='flex items-start justify-between gap-2 mb-2'>
                                <span
                                  className={`px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${
                                    news.riskOrOpportunity === 'risk'
                                      ? 'bg-risk-100 text-risk-700'
                                      : 'bg-opportunity-100 text-opportunity-700'
                                  }`}>
                                  {news.riskOrOpportunity === 'risk' ? (
                                    <span className='flex items-center gap-1'>
                                      <ExclamationTriangleIcon className='w-3 h-3' />
                                      Risk
                                    </span>
                                  ) : (
                                    <span className='flex items-center gap-1'>
                                      <CheckCircleIcon className='w-3 h-3' />
                                      Opportunity
                                    </span>
                                  )}
                                </span>
                                <span className='text-xs text-gray-400'>
                                  {formatTimeAgo(news.timestamp)}
                                </span>
                              </div>
                              <h5 className='text-sm font-semibold text-gray-900 mb-2 line-clamp-2'>
                                {news.title}
                              </h5>
                              <p className='text-xs text-gray-600 line-clamp-2 mb-2'>
                                {news.summary}
                              </p>
                              <div className='flex items-center justify-between text-xs text-gray-500'>
                                <span className='font-medium'>
                                  {news.source}
                                </span>
                                <span className='px-1.5 py-0.5 bg-gray-100 rounded text-gray-600'>
                                  {news.category}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                {/* Value Drivers Section Header */}
                {selectedAssumption &&
                  !isCumulativeView &&
                  valueDriverChanges.size > 0 && (
                    <div className='flex items-center gap-2 pt-2'>
                      <ChartBarIcon className='w-5 h-5 text-primary-600' />
                      <h4 className='text-sm font-semibold text-gray-500 uppercase tracking-wider'>
                        Value Driver Changes
                      </h4>
                    </div>
                  )}

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
                            placeholder='e.g., FTE, USD/hour'
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
                                        {baseValue.toLocaleString()}
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
                                          {changeValue.toLocaleString()}
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
                                          {newValue.toLocaleString()}
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
                                            {(
                                              baseValue +
                                              (editingChanges.get(driver.id)
                                                ?.change || changeValue)
                                            ).toLocaleString()}
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
                                      {driver.value.toLocaleString()}
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
                Expected Impact (M USD) *
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

interface ReviseBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBgId: string;
  selectedBuId: string;
  selectedBgName: string;
  selectedBuLabel: string;
  budgetTotals: {
    revenue: number;
    gp: number;
    op: number;
    np: number;
  };
  bgOptions: Array<{ id: string; name: string }>;
  bgUnitOptions: Record<string, Array<{ id: string; name: string }>>;
  budgetChanges: Array<{
    id: string;
    timestamp: Date;
    group: string;
    unit: string;
    changes: Array<{
      field: string;
      before: number;
      after: number;
    }>;
    note?: string;
    source?: string;
  }>;
  onSave: (payload: {
    bgId: string;
    unitIds: string[] | 'all';
    updates: {
      revenueBudget?: number;
      grossProfitBudget?: number;
      operatingProfitBudget?: number;
      netProfitBudget?: number;
    };
    note?: string;
  }) => void;
  defaultUnitIds: string[];
}

function ReviseBudgetModal({
  isOpen,
  onClose,
  selectedBgId,
  selectedBuId,
  selectedBgName,
  selectedBuLabel,
  budgetTotals,
  bgOptions,
  bgUnitOptions,
  budgetChanges,
  onSave,
  defaultUnitIds,
}: ReviseBudgetModalProps) {
  const [bgId, setBgId] = useState(selectedBgId);
  const [buId, setBuId] = useState(selectedBuId);
  const [revenue, setRevenue] = useState(budgetTotals.revenue.toFixed(1));
  const [gp, setGp] = useState(budgetTotals.gp.toFixed(1));
  const [op, setOp] = useState(budgetTotals.op.toFixed(1));
  const [np, setNp] = useState(budgetTotals.np.toFixed(1));
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setBgId(selectedBgId);
    setBuId(selectedBuId);
    setRevenue(budgetTotals.revenue.toFixed(1));
    setGp(budgetTotals.gp.toFixed(1));
    setOp(budgetTotals.op.toFixed(1));
    setNp(budgetTotals.np.toFixed(1));
    setNote('');
  }, [isOpen, selectedBgId, selectedBuId, budgetTotals]);

  const availableBuOptions = useMemo(
    () => (bgId ? bgUnitOptions[bgId] ?? [] : []),
    [bgId, bgUnitOptions]
  );

  useEffect(() => {
    if (!isOpen) return;
    if (!bgId || bgId === 'all') {
      setBuId('');
      return;
    }
    if (availableBuOptions.length === 0) {
      setBuId('');
      return;
    }
    const validIds = new Set(availableBuOptions.map((option) => option.id));
    if (buId && validIds.has(buId)) {
      return;
    }
    setBuId(availableBuOptions[0].id);
  }, [availableBuOptions, bgId, buId, isOpen]);

  if (!isOpen) return null;

  const buildUpdates = () => {
    const baseline = {
      revenue: budgetTotals.revenue,
      gp: budgetTotals.gp,
      op: budgetTotals.op,
      np: budgetTotals.np,
    };
    const parsed = {
      revenue: parseFloat(revenue),
      gp: parseFloat(gp),
      op: parseFloat(op),
      np: parseFloat(np),
    };
    const toRaw = (value: number) => value * 1_000;
    const updates: {
      revenueBudget?: number;
      grossProfitBudget?: number;
      operatingProfitBudget?: number;
      netProfitBudget?: number;
    } = {};
    if (!Number.isNaN(parsed.revenue) && parsed.revenue !== baseline.revenue) {
      updates.revenueBudget = toRaw(parsed.revenue);
    }
    if (!Number.isNaN(parsed.gp) && parsed.gp !== baseline.gp) {
      updates.grossProfitBudget = toRaw(parsed.gp);
    }
    if (!Number.isNaN(parsed.op) && parsed.op !== baseline.op) {
      updates.operatingProfitBudget = toRaw(parsed.op);
    }
    if (!Number.isNaN(parsed.np) && parsed.np !== baseline.np) {
      updates.netProfitBudget = toRaw(parsed.np);
    }
    return updates;
  };

  const hasSelectedBg = Boolean(bgId) && bgId !== 'all';
  const hasSelectedBu =
    Boolean(buId) && buId !== 'all' && buId !== 'multiple';
  const pendingUpdates = buildUpdates();
  const canUpdate =
    hasSelectedBg && hasSelectedBu && Object.keys(pendingUpdates).length > 0;

  const handleSave = () => {
    if (!canUpdate) {
      onClose();
      return;
    }
    const unitIds =
      buId === 'all'
        ? 'all'
        : buId === 'multiple'
        ? defaultUnitIds
        : [buId];

    onSave({
      bgId,
      unitIds,
      updates: pendingUpdates,
      note: note.trim() || undefined,
    });
    onClose();
  };

  const recentChanges = budgetChanges.slice(0, 6);

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div
        className='fixed inset-0 bg-black bg-opacity-50 transition-opacity'
        onClick={onClose}></div>

      <div className='flex items-center justify-center min-h-screen p-4'>
        <div className='relative bg-white rounded-lg shadow-xl w-full max-w-3xl'>
          <div className='flex items-center justify-between p-6 border-b border-gray-200'>
            <div>
              <h3 className='text-xl font-semibold text-gray-900'>
                Revise budget target
              </h3>
              <p className='mt-1 text-sm text-gray-500'>
                {selectedBgName} - {selectedBuLabel}
              </p>
            </div>
            <button
              onClick={onClose}
              className='p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors'>
              <XMarkIcon className='w-6 h-6' />
            </button>
          </div>

          <div className='p-6 space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Business Group
                </label>
                <select
                  value={bgId}
                  onChange={(e) => setBgId(e.target.value)}
                  className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500'>
                  <option value='all'>All BGs</option>
                  {bgOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Business Unit
                </label>
                <select
                  value={buId}
                  onChange={(e) => setBuId(e.target.value)}
                  className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500'>
                  <option value='all' disabled>
                    All BUs
                  </option>
                  {selectedBuId === 'multiple' && bgId === selectedBgId && (
                    <option value='multiple'>Multiple BUs selected</option>
                  )}
                  {availableBuOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className='overflow-hidden rounded-lg border border-gray-200'>
              <table className='min-w-full text-sm'>
                <thead className='bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                  <tr>
                    <th className='px-4 py-3'>Metric</th>
                    <th className='px-4 py-3'>Budget (M USD)</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200 bg-white text-gray-700'>
                  <tr>
                    <td className='px-4 py-3 font-medium text-gray-900'>
                      Revenue
                    </td>
                    <td className='px-4 py-3'>
                      <input
                        type='number'
                        step='0.1'
                        value={revenue}
                        onChange={(e) => setRevenue(e.target.value)}
                        className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500'
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className='px-4 py-3 font-medium text-gray-900'>
                      Gross Profit
                    </td>
                    <td className='px-4 py-3'>
                      <input
                        type='number'
                        step='0.1'
                        value={gp}
                        onChange={(e) => setGp(e.target.value)}
                        className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500'
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className='px-4 py-3 font-medium text-gray-900'>
                      Operating Profit
                    </td>
                    <td className='px-4 py-3'>
                      <input
                        type='number'
                        step='0.1'
                        value={op}
                        onChange={(e) => setOp(e.target.value)}
                        className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500'
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className='px-4 py-3 font-medium text-gray-900'>
                      Net Profit
                    </td>
                    <td className='px-4 py-3'>
                      <input
                        type='number'
                        step='0.1'
                        value={np}
                        onChange={(e) => setNp(e.target.value)}
                        className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500'
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Change note (optional)
              </label>
              <input
                type='text'
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder='Add a reason for this update...'
                className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500'
              />
            </div>

            <div className='rounded-lg border border-gray-200'>
              <div className='px-4 py-3 border-b border-gray-200 bg-gray-50'>
                <h4 className='text-sm font-semibold text-gray-700'>
                  Recent budget changes
                </h4>
              </div>
              <div className='max-h-56 overflow-y-auto'>
                {recentChanges.length === 0 ? (
                  <div className='px-4 py-4 text-sm text-gray-500'>
                    No budget updates yet.
                  </div>
                ) : (
                  <ul className='divide-y divide-gray-200 text-sm text-gray-700'>
                    {recentChanges.map((change) => (
                      <li key={change.id} className='px-4 py-3'>
                        <div className='flex items-center justify-between'>
                          <span className='font-medium text-gray-900'>
                            {change.group} - {change.unit}
                          </span>
                          <span className='text-xs text-gray-500'>
                            {change.timestamp.toLocaleString()}
                          </span>
                        </div>
                        <div className='mt-1 text-xs text-gray-500'>
                          {change.changes
                            .map(
                              (item) =>
                                `${item.field.replace('Budget', '')}: ${
                                  item.before
                                } → ${item.after}`
                            )
                            .join(', ')}
                        </div>
                        {change.note && (
                          <div className='mt-1 text-xs text-gray-400'>
                            Note: {change.note}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
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
              onClick={handleSave}
              disabled={!canUpdate}
              className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                canUpdate
                  ? 'text-white bg-primary-600 hover:bg-primary-700'
                  : 'text-gray-400 bg-gray-200 cursor-not-allowed'
              }`}>
              Update targets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
