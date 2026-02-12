import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import BUSINESS_GROUP_DATA from '../data/mockBgData';

export type BusinessGroup = (typeof BUSINESS_GROUP_DATA)[number];
export type BusinessUnit = BusinessGroup['businessUnits'][number];
type BudgetField =
  | 'revenueBudget'
  | 'grossProfitBudget'
  | 'operatingProfitBudget'
  | 'netProfitBudget';

type BudgetUpdate = Partial<Record<BudgetField, number>>;

export type BudgetChange = {
  id: string;
  timestamp: Date;
  group: string;
  unit: string;
  changes: Array<{ field: BudgetField; before: number; after: number }>;
  note?: string;
  source?: string;
};

type BudgetUpdatePayload = {
  groupId: string;
  unitIds?: string[] | 'all';
  updates: BudgetUpdate;
  note?: string;
  source?: string;
};

interface BudgetContextValue {
  businessGroups: BusinessGroup[];
  budgetChanges: BudgetChange[];
  updateBudgets: (payload: BudgetUpdatePayload) => void;
}

const BudgetContext = createContext<BudgetContextValue | undefined>(undefined);

const normalizeGroupId = (groupName: string) => {
  const key = groupName.trim().toLowerCase().replace(/\s*\(parent\)\s*$/i, '');
  return key === 'other' ? 'others' : key;
};

const getUnitId = (groupId: string, unitName: string) =>
  `${groupId}-${unitName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

const applyBudgetUpdates = (
  unit: BusinessUnit,
  updates: BudgetUpdate
): { next: BusinessUnit; changes: BudgetChange['changes'] } => {
  const fields: BudgetField[] = [
    'revenueBudget',
    'grossProfitBudget',
    'operatingProfitBudget',
    'netProfitBudget',
  ];
  const changes: BudgetChange['changes'] = [];
  const next = { ...unit };

  fields.forEach((field) => {
    const value = updates[field];
    if (value === undefined || Number.isNaN(value)) {
      return;
    }
    if (next[field] !== value) {
      changes.push({ field, before: next[field], after: value });
      next[field] = value;
    }
  });

  return { next, changes };
};

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [businessGroups, setBusinessGroups] = useState<BusinessGroup[]>(
    BUSINESS_GROUP_DATA
  );
  const [budgetChanges, setBudgetChanges] = useState<BudgetChange[]>([]);

  const updateBudgets = useCallback(
    ({ groupId, unitIds, updates, note, source }: BudgetUpdatePayload) => {
      if (!Object.values(updates).some((value) => value !== undefined)) {
        return;
      }
      const normalizedGroupId = groupId === 'all' ? 'all' : normalizeGroupId(groupId);

      setBusinessGroups((prev) => {
        const changesToLog: BudgetChange[] = [];
        const nextGroups = prev.map((group) => {
          const groupKey = normalizeGroupId(group.group);
          if (normalizedGroupId !== 'all' && groupKey !== normalizedGroupId) {
            return group;
          }
          const groupUnitIds = group.businessUnits.map((unit) =>
            getUnitId(groupKey, unit.name)
          );
          const selectedUnitIds =
            unitIds === 'all' || unitIds === undefined
              ? new Set(groupUnitIds)
              : new Set(unitIds);

          const nextUnits = group.businessUnits.map((unit) => {
            const unitId = getUnitId(groupKey, unit.name);
            if (!selectedUnitIds.has(unitId)) {
              return unit;
            }
            const { next, changes } = applyBudgetUpdates(unit, updates);
            if (changes.length > 0) {
              changesToLog.push({
                id: `budget-change-${Date.now()}-${Math.random()
                  .toString(36)
                  .slice(2, 7)}`,
                timestamp: new Date(),
                group: group.group,
                unit: unit.name,
                changes,
                note,
                source,
              });
            }
            return next;
          });

          return { ...group, businessUnits: nextUnits };
        });

        if (changesToLog.length > 0) {
          setBudgetChanges((prevChanges) => [
            ...changesToLog,
            ...prevChanges,
          ]);
        }

        return nextGroups;
      });
    },
    []
  );

  const value = useMemo(
    () => ({ businessGroups, budgetChanges, updateBudgets }),
    [businessGroups, budgetChanges, updateBudgets]
  );

  return (
    <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
  );
}

export function useBudgets() {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudgets must be used within a BudgetProvider');
  }
  return context;
}
