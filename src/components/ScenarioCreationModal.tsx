import { useState, useEffect } from 'react';
import {
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import type {
  FinancialCategoryGroup,
  ValueDriverScenario,
  ValueDriverScenarioValue,
} from '../types';
import {
  extractValueDrivers,
  createScenario,
  updateScenarioValues,
  isScenarioNameUnique,
} from '../utils/scenarioUtils';
import { useCurrency } from '../contexts/CurrencyContext';

interface ScenarioCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (scenario: ValueDriverScenario) => void;
  valueDriverHierarchy: FinancialCategoryGroup[];
  existingScenarios: ValueDriverScenario[];
  editingScenario?: ValueDriverScenario | null;
}

export default function ScenarioCreationModal({
  isOpen,
  onClose,
  onSave,
  valueDriverHierarchy,
  existingScenarios,
  editingScenario,
}: ScenarioCreationModalProps) {
  const [scenarioName, setScenarioName] = useState('');
  const { formatAmount } = useCurrency();
  const [valueDriverValues, setValueDriverValues] = useState<
    Map<string, number>
  >(new Map());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [nameError, setNameError] = useState<string | null>(null);

  // Initialize with default values or editing scenario values
  useEffect(() => {
    if (isOpen) {
      const allDrivers = extractValueDrivers(valueDriverHierarchy);
      const initialValues = new Map<string, number>();

      if (editingScenario) {
        setScenarioName(editingScenario.name);
        editingScenario.valueDriverValues.forEach((v) => {
          initialValues.set(v.valueDriverId, v.value);
        });
      } else {
        setScenarioName('');
        allDrivers.forEach((driver) => {
          initialValues.set(driver.valueDriverId, driver.baseValue);
        });
      }

      setValueDriverValues(initialValues);
      setExpandedCategories(new Set(valueDriverHierarchy.map((c) => c.id)));
      setNameError(null);
    }
  }, [isOpen, editingScenario, valueDriverHierarchy]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const updateValueDriver = (valueDriverId: string, value: number) => {
    setValueDriverValues((prev) => {
      const next = new Map(prev);
      next.set(valueDriverId, value);
      return next;
    });
  };

  const handleSimulate = () => {
    // Validate name
    if (!scenarioName.trim()) {
      setNameError('Scenario name is required');
      return;
    }

    if (
      !isScenarioNameUnique(
        scenarioName.trim(),
        existingScenarios,
        editingScenario?.id
      )
    ) {
      setNameError('Scenario name must be unique');
      return;
    }

    setNameError(null);

    // Build scenario value driver values array
    const scenarioValues: ValueDriverScenarioValue[] = Array.from(
      valueDriverValues.entries()
    ).map(([valueDriverId, value]) => ({
      valueDriverId,
      value,
    }));

    let scenario: ValueDriverScenario;
    if (editingScenario) {
      scenario = updateScenarioValues(editingScenario, scenarioValues);
      scenario.name = scenarioName.trim();
    } else {
      scenario = createScenario(
        scenarioName.trim(),
        'Current User', // TODO: Get from auth context
        valueDriverHierarchy
      );
      scenario.valueDriverValues = scenarioValues;
    }

    onSave(scenario);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div
        className='fixed inset-0 bg-black bg-opacity-50 transition-opacity'
        onClick={onClose}
      />

      <div className='flex items-center justify-center min-h-screen p-4'>
        <div className='relative bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col'>
          {/* Header */}
          <div className='flex items-center justify-between p-6 border-b border-gray-200'>
            <div>
              <h3 className='text-xl font-semibold text-gray-900'>
                {editingScenario ? 'Edit Scenario' : 'Create Scenario'}
              </h3>
              <p className='mt-1 text-sm text-gray-500'>
                Adjust Value Driver values to simulate impact on OP Waterfall
              </p>
            </div>
            <button
              onClick={onClose}
              className='p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors'>
              <XMarkIcon className='w-6 h-6' />
            </button>
          </div>

          {/* Content */}
          <div className='flex-1 p-6 overflow-y-auto'>
            {/* Scenario Name Input */}
            <div className='mb-6'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Scenario Name *
              </label>
              <input
                type='text'
                value={scenarioName}
                onChange={(e) => {
                  setScenarioName(e.target.value);
                  setNameError(null);
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  nameError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='e.g., Lucky case, BAU, Worst case'
              />
              {nameError && (
                <p className='mt-1 text-sm text-red-600'>{nameError}</p>
              )}
            </div>

            {/* Value Drivers by Category */}
            <div className='space-y-4'>
              {valueDriverHierarchy.map((category) => {
                const isExpanded = expandedCategories.has(category.id);
                return (
                  <div
                    key={category.id}
                    className='border border-gray-200 rounded-lg overflow-hidden'>
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className='w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors'>
                      <h4 className='text-sm font-semibold text-gray-900'>
                        {category.name}
                      </h4>
                      {isExpanded ? (
                        <ChevronUpIcon className='w-5 h-5 text-gray-500' />
                      ) : (
                        <ChevronDownIcon className='w-5 h-5 text-gray-500' />
                      )}
                    </button>

                    {/* Category Content */}
                    {isExpanded && (
                      <div className='divide-y divide-gray-100'>
                        {category.metrics.map((metric) => (
                          <div
                            key={metric.id}
                            className='bg-white'>
                            {/* Metric Header */}
                            {metric.name && (
                              <div className='px-4 py-2 bg-gray-50/50 border-b border-gray-100'>
                                <h5 className='text-xs font-medium text-gray-700'>
                                  {metric.name}
                                </h5>
                              </div>
                            )}

                            {/* Value Drivers */}
                            <div className='p-4 space-y-3'>
                              {metric.valueDrivers.map((driver) => {
                                if (driver.value === undefined) return null;

                                const currentValue =
                                  valueDriverValues.get(driver.id) ??
                                  driver.value;
                                const baseValue = driver.value;
                                const changePercent =
                                  ((currentValue - baseValue) / baseValue) *
                                  100;

                                return (
                                  <div
                                    key={driver.id}
                                    className='flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-md'>
                                    <div className='flex-1'>
                                      <label className='block text-xs font-medium text-gray-700 mb-1'>
                                        {driver.name}
                                      </label>
                                      <div className='flex items-center gap-2'>
                                        <span className='text-xs text-gray-500'>
                                          Base: {formatAmount(baseValue)}{' '}
                                          {driver.unit}
                                        </span>
                                        {Math.abs(changePercent) > 0.01 && (
                                          <span
                                            className={`text-xs font-semibold ${
                                              changePercent >= 0
                                                ? 'text-opportunity-600'
                                                : 'text-risk-600'
                                            }`}>
                                            ({changePercent > 0 ? '+' : ''}
                                            {changePercent.toFixed(1)}%)
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className='w-32'>
                                      <input
                                        type='number'
                                        step='any'
                                        value={currentValue}
                                        onChange={(e) => {
                                          const newValue = parseFloat(
                                            e.target.value
                                          );
                                          if (!isNaN(newValue)) {
                                            updateValueDriver(
                                              driver.id,
                                              newValue
                                            );
                                          }
                                        }}
                                        className='w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                                      />
                                      <span className='text-xs text-gray-500 mt-1 block'>
                                        {driver.unit}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className='flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50'>
            <button
              onClick={onClose}
              className='px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'>
              Cancel
            </button>
            <button
              onClick={handleSimulate}
              className='px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors'>
              {editingScenario ? 'Update Scenario' : 'Simulate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
