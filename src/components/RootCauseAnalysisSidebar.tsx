import { useState, useEffect } from 'react';
import type { NewsItem, FinancialMetric } from '../types';
import {
  SparklesIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface RootCauseAnalysisSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedExternalItems: NewsItem[];
  selectedInternalItems: FinancialMetric[];
  activeTab: 'external' | 'internal' | 'actions';
  hasSelectedItems?: boolean;
}

interface ImpactAnalysis {
  affectedValueDrivers: Array<{
    driverName: string;
    metricName: string;
    financialCategory: string;
    impact: number; // in millions
    impactPercent: number;
    type: 'leading' | 'direct';
    explanation: string;
  }>;
  affectedFinancials: Array<{
    financialMetric: string;
    currentValue: number;
    projectedImpact: number;
    impactPercent: number;
    explanation: string;
  }>;
  summary: string;
}

export default function RootCauseAnalysisSidebar({
  isOpen,
  onToggle,
  selectedExternalItems,
  selectedInternalItems,
  hasSelectedItems: hasSelectedItemsProp,
}: RootCauseAnalysisSidebarProps) {
  const [messages, setMessages] = useState<
    Array<{
      type: 'user' | 'assistant';
      content: string;
      searchResults?: Array<{ title: string; snippet: string; url: string }>;
    }>
  >([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [impactAnalysis, setImpactAnalysis] = useState<ImpactAnalysis | null>(
    null
  );
  const [showToast, setShowToast] = useState(false);
  const [isCreatingAction, setIsCreatingAction] = useState(false);

  // Generate impact analysis when selections change
  useEffect(() => {
    generateImpactAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExternalItems, selectedInternalItems]);

  const handleCreateAction = () => {
    setIsCreatingAction(true);

    // Simulate API call/processing delay
    setTimeout(() => {
      setIsCreatingAction(false);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000); // Hide toast after 3 seconds
    }, 1500); // Simulate 1.5 second processing time
  };

  const generateImpactAnalysis = () => {
    if (
      selectedExternalItems.length === 0 &&
      selectedInternalItems.length === 0
    ) {
      setImpactAnalysis(null);
      return;
    }

    // Mock impact analysis - in real app, this would use AI to analyze
    const analysis: ImpactAnalysis = {
      affectedValueDrivers: [],
      affectedFinancials: [],
      summary: '',
    };

    // Analyze External Pulse items
    selectedExternalItems.forEach((news) => {
      if (
        news.title.includes('Tariff') ||
        news.title.includes('tariff')
      ) {
        analysis.affectedValueDrivers.push({
          driverName: 'Volume',
          metricName: 'Revenue',
          financialCategory: 'Revenue',
          impact: -10.0,
          impactPercent: -0.4,
          type: 'leading',
          explanation:
            'Tariff announcement may reduce customer orders for US market, affecting production volume',
        });
        analysis.affectedFinancials.push({
          financialMetric: 'Revenue',
          currentValue: 2305.0,
          projectedImpact: -10.0,
          impactPercent: -0.4,
          explanation:
            'Revenue may decrease due to reduced volume if production cannot be shifted quickly',
        });
        analysis.summary +=
          'US Tariff Impact: May reduce EV connector volume by ~20% for US market, leading to $10M revenue impact. ';
      }

      if (
        news.title.includes('Supply Disruption') ||
        news.title.includes('Material')
      ) {
        analysis.affectedValueDrivers.push({
          driverName: 'Index-Based Material Price',
          metricName: 'Material (BOM)',
          financialCategory: 'COGS',
          impact: 5.0,
          impactPercent: 0.5,
          type: 'leading',
          explanation:
            'Material cost increase is a leading parameter - once product is sold, price remains same but profit margin decreases',
        });
        analysis.affectedFinancials.push({
          financialMetric: 'Material (BOM)',
          currentValue: 1025.2,
          projectedImpact: 5.0,
          impactPercent: 0.5,
          explanation:
            'Material costs may increase by $5M, directly affecting COGS and reducing gross profit margin',
        });
        analysis.affectedFinancials.push({
          financialMetric: 'Gross Profit',
          currentValue: 589.2,
          projectedImpact: -5.0,
          impactPercent: -0.8,
          explanation:
            'Higher material costs reduce gross profit by $5M even if revenue stays the same',
        });
        analysis.summary +=
          'Supply Disruption Supply Disruption: Material costs may increase by 30-40%, leading to $5M COGS increase and $5M gross profit impact. ';
      }

      if (news.title.includes('Copper')) {
        analysis.affectedValueDrivers.push({
          driverName: 'Index-Based Material Price',
          metricName: 'Material (BOM)',
          financialCategory: 'COGS',
          impact: 7.0,
          impactPercent: 0.7,
          type: 'leading',
          explanation:
            "Copper price surge is a leading parameter - cost increase doesn't immediately affect profit, but will once products are sold",
        });
        analysis.affectedFinancials.push({
          financialMetric: 'Material (BOM)',
          currentValue: 1025.2,
          projectedImpact: 7.0,
          impactPercent: 0.7,
          explanation:
            'Copper accounts for 28% of material costs, potential $7M increase',
        });
        analysis.summary +=
          'Copper Price Surge: 15% price increase may lead to $7M material cost increase, affecting gross margins. ';
      }
    });

    // Analyze Internal Pulse items
    selectedInternalItems.forEach((metric) => {
      if (metric.name.includes('Material')) {
        analysis.affectedValueDrivers.push({
          driverName: 'Index-Based Material Price',
          metricName: metric.name,
          financialCategory: 'COGS',
          impact: metric.variance,
          impactPercent: metric.variancePercent,
          type: 'direct',
          explanation: `Current variance of ${metric.variancePercent.toFixed(
            1
          )}% already affecting this metric`,
        });
        analysis.affectedFinancials.push({
          financialMetric: 'Gross Profit',
          currentValue: 589.2,
          projectedImpact: -metric.variance,
          impactPercent: (-metric.variance / 589.2) * 100,
          explanation: `Material cost variance of ${metric.variance}M directly reduces gross profit`,
        });
      }

      if (metric.name.includes('Revenue')) {
        analysis.affectedFinancials.push({
          financialMetric: 'Gross Profit',
          currentValue: 589.2,
          projectedImpact: -metric.variance * 0.25, // Assuming 25% gross margin
          impactPercent: ((-metric.variance * 0.25) / 589.2) * 100,
          explanation: `Revenue variance of ${metric.variance}M affects gross profit proportionally`,
        });
      }
    });

    if (
      analysis.affectedValueDrivers.length > 0 ||
      analysis.affectedFinancials.length > 0
    ) {
      analysis.summary =
        'Impact Analysis Summary: ' +
        analysis.summary +
        'These changes show how leading parameters (like label cost increases) will affect financials once products are sold, even if immediate revenue impact is not visible.';
    } else {
      analysis.summary =
        'No significant impact detected from selected items. Select External Pulse news items or Internal Pulse metrics to see their impact on value drivers and financials.';
    }

    setImpactAnalysis(analysis);
  };

  const handleChatSubmit = async (query: string) => {
    if (!query.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { type: 'user', content: query }]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response with web search (mocked)
    setTimeout(() => {
      const mockSearchResults = [
        {
          title: 'Root Cause Analysis Best Practices',
          snippet:
            'Root cause analysis involves identifying the underlying factors that contribute to performance issues. Key steps include data collection, pattern identification, and impact assessment.',
          url: 'https://example.com/rca-best-practices',
        },
        {
          title: 'Financial Impact Analysis Framework',
          snippet:
            'Financial impact analysis helps organizations understand how external events and internal changes affect key metrics, value drivers, and overall financial performance.',
          url: 'https://example.com/financial-impact',
        },
      ];

      const mockResponse = `Based on my analysis and web search, here's what I found:

${mockSearchResults
  .map((r, i) => `${i + 1}. ${r.title}\n   ${r.snippet}`)
  .join('\n\n')}

Regarding your query about "${query}", I can help analyze the impact of selected items on your value drivers and financials. Would you like me to generate a detailed impact analysis?`;

      setMessages((prev) => [
        ...prev,
        {
          type: 'assistant',
          content: mockResponse,
          searchResults: mockSearchResults,
        },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  const hasSelectedItems =
    hasSelectedItemsProp ??
    (selectedExternalItems.length > 0 || selectedInternalItems.length > 0);

  const width = isOpen ? 'w-[80vw]' : 'w-0';
  const translateX = isOpen ? 'translate-x-0' : 'translate-x-full';

  return (
    <div
      className={`fixed right-0 top-0 h-full bg-white border-l border-gray-200 shadow-xl transition-all duration-300 z-40 ${width} ${translateX}`}>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`absolute -left-10 top-1/2 -translate-y-1/2 bg-primary-600 text-white p-2 rounded-l-lg hover:bg-primary-700 transition-all ${
          isOpen ? '' : 'shadow-lg'
        } ${
          !isOpen && hasSelectedItems
            ? 'ring-2 ring-primary-400 ring-offset-2'
            : ''
        }`}>
        <span className='relative inline-block'>
          {isOpen ? (
            <ChevronRightIcon className='w-5 h-5' />
          ) : (
            <ChevronLeftIcon className='w-5 h-5' />
          )}
          {/* Notification Badge when items are selected */}
          {!isOpen && hasSelectedItems && (
            <span className='absolute -top-1 -right-1 flex min-w-[16px] h-4 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white ring-2 ring-white px-0.5'>
              {(() => {
                const count =
                  selectedExternalItems.length + selectedInternalItems.length;
                return count > 99 ? '99+' : count.toString();
              })()}
            </span>
          )}
        </span>
      </button>

      {isOpen && (
        <div className='h-full flex flex-col'>
          {/* Header */}
          <div className='p-4 border-b border-gray-200'>
            <div className='flex items-center justify-between mb-3'>
              <h2 className='text-lg font-semibold text-gray-900 flex items-center'>
                <SparklesIcon className='w-5 h-5 mr-2 text-primary-600' />
                Analysis Assistant
              </h2>
              <div className='flex items-center gap-2'>
                <button
                  onClick={handleCreateAction}
                  disabled={isCreatingAction}
                  className='px-3 py-1.5 text-xs font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 flex items-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed'>
                  {isCreatingAction ? (
                    <>
                      <ArrowPathIcon className='w-4 h-4 mr-1.5 animate-spin' />
                      Creating...
                    </>
                  ) : (
                    <>
                      <PlusIcon className='w-4 h-4 mr-1.5' />
                      Create an Action
                    </>
                  )}
                </button>
                <button
                  onClick={onToggle}
                  className='p-1 text-gray-400 hover:text-gray-500 rounded'>
                  <XMarkIcon className='w-5 h-5' />
                </button>
              </div>
            </div>

            {/* Sources Reference - Show when items are selected */}
            {hasSelectedItems && (
              <div className='bg-blue-50 rounded-lg p-3 border border-blue-200'>
                <p className='text-xs font-semibold text-blue-900 mb-1'>
                  Referencing Selected Sources:
                </p>
                <div className='flex flex-wrap gap-1.5'>
                  {selectedExternalItems.length > 0 && (
                    <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200'>
                      External Pulse ({selectedExternalItems.length})
                    </span>
                  )}
                  {selectedInternalItems.length > 0 && (
                    <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200'>
                      Internal Pulse ({selectedInternalItems.length})
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className='flex-1 overflow-y-auto'>
            {hasSelectedItems ? (
              <div className='flex flex-col h-full'>
                {/* Analysis Section */}
                <div className='flex-1 overflow-y-auto'>
                  <ContextAwareAnalysis
                    selectedExternalItems={selectedExternalItems}
                    selectedInternalItems={selectedInternalItems}
                    impactAnalysis={impactAnalysis}
                  />
                </div>

                {/* Chat Section */}
                <div className='border-t border-gray-200 bg-white flex-shrink-0'>
                  <div className='p-4 pb-0'>
                    <p className='text-xs font-medium text-gray-700 mb-3'>
                      Ask questions about the selected items:
                    </p>
                  </div>
                  <ChatInterface
                    messages={messages}
                    inputValue={inputValue}
                    setInputValue={setInputValue}
                    onSubmit={handleChatSubmit}
                    isTyping={isTyping}
                    hasContext={true}
                  />
                </div>
              </div>
            ) : (
              <div className='flex flex-col h-full'>
                {/* Empty State Message */}
                <div className='flex-1 overflow-y-auto'>
                  <div className='text-center py-8 text-gray-500'>
                    <SparklesIcon className='w-12 h-12 mx-auto mb-3 text-gray-300' />
                    <p className='text-sm font-medium mb-1'>
                      Free-form Analysis
                    </p>
                    <p className='text-xs px-4'>
                      Ask questions about your business, KPIs, or market
                      conditions. I'll search the web and provide insights.
                      <br />
                      <span className='text-[10px] text-gray-400 mt-1 block'>
                        Select items from External Pulse or Internal Pulse to
                        analyze their impact
                      </span>
                    </p>
                  </div>
                </div>

                {/* Chat Section */}
                <div className='border-t border-gray-200 bg-white flex-shrink-0'>
                  <div className='p-4 pb-0'>
                    <p className='text-xs font-medium text-gray-700 mb-3'>
                      Ask questions:
                    </p>
                  </div>
                  <ChatInterface
                    messages={messages}
                    inputValue={inputValue}
                    setInputValue={setInputValue}
                    onSubmit={handleChatSubmit}
                    isTyping={isTyping}
                    hasContext={false}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className='fixed bottom-4 right-4 z-50 animate-fade-in'>
          <div className='bg-white rounded-lg shadow-lg border border-gray-200 p-4 flex items-center space-x-3 min-w-[300px] max-w-md'>
            <div className='flex-shrink-0'>
              <CheckCircleIcon className='w-6 h-6 text-green-600' />
            </div>
            <div className='flex-1'>
              <p className='text-sm font-medium text-gray-900'>
                Your Action is ready in Action Tracking
              </p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className='flex-shrink-0 text-gray-400 hover:text-gray-600'>
              <XMarkIcon className='w-5 h-5' />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface ContextAwareAnalysisProps {
  selectedExternalItems: NewsItem[];
  selectedInternalItems: FinancialMetric[];
  impactAnalysis: ImpactAnalysis | null;
}

function ContextAwareAnalysis({
  selectedExternalItems,
  selectedInternalItems,
  impactAnalysis,
}: ContextAwareAnalysisProps) {
  return (
    <div className='p-4 space-y-4'>
      {/* Selection Summary */}
      <div className='bg-gray-50 rounded-lg p-3 border border-gray-200'>
        <h3 className='text-sm font-semibold text-gray-900 mb-2'>
          Selected Items
        </h3>
        {selectedExternalItems.length > 0 && (
          <div className='mb-2'>
            <p className='text-xs text-gray-600 mb-1'>
              External Pulse ({selectedExternalItems.length})
            </p>
            <div className='space-y-1'>
              {selectedExternalItems.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className='text-xs text-gray-700 truncate px-2 py-1 bg-white rounded border border-gray-200'>
                  {item.title}
                </div>
              ))}
              {selectedExternalItems.length > 3 && (
                <p className='text-xs text-gray-500'>
                  +{selectedExternalItems.length - 3} more
                </p>
              )}
            </div>
          </div>
        )}
        {selectedInternalItems.length > 0 && (
          <div>
            <p className='text-xs text-gray-600 mb-1'>
              Internal Pulse ({selectedInternalItems.length})
            </p>
            <div className='space-y-1'>
              {selectedInternalItems.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className='text-xs text-gray-700 truncate px-2 py-1 bg-white rounded border border-gray-200'>
                  {item.name}
                </div>
              ))}
              {selectedInternalItems.length > 3 && (
                <p className='text-xs text-gray-500'>
                  +{selectedInternalItems.length - 3} more
                </p>
              )}
            </div>
          </div>
        )}
        {selectedExternalItems.length === 0 &&
          selectedInternalItems.length === 0 && (
            <p className='text-xs text-gray-500 italic'>
              Select items from External Pulse or Internal Pulse to analyze
              their impact
            </p>
          )}
      </div>

      {/* Impact Analysis */}
      {impactAnalysis && (
        <div className='space-y-4'>
          {/* Summary */}
          <div className='bg-blue-50 rounded-lg p-3 border border-blue-200'>
            <h3 className='text-sm font-semibold text-blue-900 mb-2'>
              Analysis Summary
            </h3>
            <p className='text-xs text-blue-800'>{impactAnalysis.summary}</p>
          </div>

          {/* Affected Value Drivers */}
          {impactAnalysis.affectedValueDrivers.length > 0 && (
            <div>
              <h3 className='text-sm font-semibold text-gray-900 mb-2'>
                Affected Value Drivers
              </h3>
              <div className='space-y-2'>
                {impactAnalysis.affectedValueDrivers.map((driver, idx) => (
                  <div
                    key={idx}
                    className='p-3 bg-white rounded-lg border border-gray-200'>
                    <div className='flex items-start justify-between mb-1'>
                      <div>
                        <p className='text-xs font-semibold text-gray-900'>
                          {driver.driverName}
                        </p>
                        <p className='text-xs text-gray-600'>
                          {driver.metricName} ({driver.financialCategory})
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-medium rounded ${
                          driver.type === 'leading'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                        {driver.type === 'leading'
                          ? 'Leading Parameter'
                          : 'Direct Impact'}
                      </span>
                    </div>
                    <div className='mt-2 flex items-center gap-2'>
                      <span
                        className={`text-xs font-semibold ${
                          driver.impact >= 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                        {driver.impact >= 0 ? '+' : ''}
                        {driver.impact.toFixed(1)}M (
                        {driver.impactPercent >= 0 ? '+' : ''}
                        {driver.impactPercent.toFixed(1)}%)
                      </span>
                    </div>
                    <p className='text-xs text-gray-600 mt-2'>
                      {driver.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Affected Financials */}
          {impactAnalysis.affectedFinancials.length > 0 && (
            <div>
              <h3 className='text-sm font-semibold text-gray-900 mb-2'>
                Affected Financials
              </h3>
              <div className='space-y-2'>
                {impactAnalysis.affectedFinancials.map((financial, idx) => (
                  <div
                    key={idx}
                    className='p-3 bg-white rounded-lg border border-gray-200'>
                    <p className='text-xs font-semibold text-gray-900 mb-2'>
                      {financial.financialMetric}
                    </p>
                    <div className='grid grid-cols-3 gap-2 text-xs'>
                      <div>
                        <p className='text-gray-500'>Current</p>
                        <p className='font-semibold text-gray-900'>
                          {financial.currentValue.toFixed(1)}M
                        </p>
                      </div>
                      <div>
                        <p className='text-gray-500'>Impact</p>
                        <p
                          className={`font-semibold ${
                            financial.projectedImpact >= 0
                              ? 'text-red-600'
                              : 'text-green-600'
                          }`}>
                          {financial.projectedImpact >= 0 ? '+' : ''}
                          {financial.projectedImpact.toFixed(1)}M
                        </p>
                      </div>
                      <div>
                        <p className='text-gray-500'>Impact %</p>
                        <p
                          className={`font-semibold ${
                            financial.impactPercent >= 0
                              ? 'text-red-600'
                              : 'text-green-600'
                          }`}>
                          {financial.impactPercent >= 0 ? '+' : ''}
                          {financial.impactPercent.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <p className='text-xs text-gray-600 mt-2'>
                      {financial.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visualization */}
          {impactAnalysis.affectedFinancials.length > 0 && (
            <div>
              <h3 className='text-sm font-semibold text-gray-900 mb-2'>
                Impact Visualization
              </h3>
              <div className='h-72 bg-gray-50 rounded-lg p-3'>
                <ResponsiveContainer
                  width='100%'
                  height='100%'>
                  <BarChart
                    data={impactAnalysis.affectedFinancials.map((f) => ({
                      name: f.financialMetric,
                      current: f.currentValue,
                      impact: f.projectedImpact,
                    }))}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis
                      dataKey='name'
                      style={{ fontSize: '10px' }}
                    />
                    <YAxis style={{ fontSize: '10px' }} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey='current'
                      fill='#3b82f6'
                      name='Current'
                    />
                    <Bar
                      dataKey='impact'
                      fill='#dc2626'
                      name='Impact'
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ChatInterfaceProps {
  messages: Array<{
    type: 'user' | 'assistant';
    content: string;
    searchResults?: Array<{ title: string; snippet: string; url: string }>;
  }>;
  inputValue: string;
  setInputValue: (value: string) => void;
  onSubmit: (query: string) => void;
  isTyping: boolean;
  hasContext?: boolean;
}

function ChatInterface({
  messages,
  inputValue,
  setInputValue,
  onSubmit,
  isTyping,
  hasContext = false,
}: ChatInterfaceProps) {
  // Define relevant questions based on context
  const predefinedQuestions = hasContext
    ? [
        'What is the combined impact of these selected items?',
        'How will this affect our revenue forecast?',
        'What actions should we take to mitigate these risks?',
        'Which value drivers are most affected?',
        'What are the potential financial implications?',
        'How do these items relate to our KPIs?',
      ]
    : [
        'What are the current market trends affecting our industry?',
        'How can we improve our financial performance?',
        'What external factors should we monitor?',
        'What are best practices for financial forecasting?',
        'How do value drivers impact our business?',
        'What strategies can help optimize our KPIs?',
      ];

  const handleQuestionClick = (question: string) => {
    setInputValue(question);
    onSubmit(question);
  };

  return (
    <div className='flex flex-col'>
      {/* Messages */}
      <div className='overflow-y-auto p-4 space-y-4 max-h-[250px]'>
        {messages.length === 0 && (
          <div className='text-center py-4 text-gray-500'>
            <ChatBubbleLeftRightIcon className='w-8 h-8 mx-auto mb-2 text-gray-300' />
            <p className='text-xs font-medium mb-1'>Ask questions</p>
            <p className='text-[10px]'>
              {hasContext
                ? 'Ask questions about the selected items and their impact'
                : 'Ask questions about your business, KPIs, or market conditions'}
            </p>
          </div>
        )}

        {messages.map((message, idx) => (
          <div
            key={idx}
            className='space-y-2'>
            {message.type === 'user' ? (
              <div className='flex justify-end'>
                <div className='max-w-[80%] px-3 py-2 bg-primary-600 text-white rounded-lg text-xs'>
                  {message.content}
                </div>
              </div>
            ) : (
              <div className='flex justify-start'>
                <div className='max-w-[80%] space-y-2'>
                  <div className='px-3 py-2 bg-gray-100 rounded-lg text-xs text-gray-700 whitespace-pre-wrap'>
                    {message.content}
                  </div>
                  {message.searchResults && (
                    <div className='mt-2 space-y-1'>
                      <p className='text-[10px] text-gray-500 flex items-center'>
                        <GlobeAltIcon className='w-3 h-3 mr-1' />
                        Web Search Results:
                      </p>
                      {message.searchResults.map((result, rIdx) => (
                        <div
                          key={rIdx}
                          className='text-[10px] bg-white p-2 rounded border border-gray-200'>
                          <p className='font-medium text-gray-900'>
                            {result.title}
                          </p>
                          <p className='text-gray-600 mt-0.5'>
                            {result.snippet}
                          </p>
                          <a
                            href={result.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-primary-600 hover:underline mt-1 inline-block'>
                            Learn more →
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className='flex justify-start'>
            <div className='px-3 py-2 bg-gray-100 rounded-lg text-xs text-gray-500'>
              <div className='flex items-center gap-1'>
                <span className='animate-pulse'>Thinking</span>
                <span className='animate-bounce'>...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className='p-4 border-t border-gray-200 bg-gray-50'>
        {/* Predefined Questions */}
        <div className='mb-3'>
          <div className='overflow-x-auto scrollbar-hide'>
            <div className='flex gap-2 pb-2'>
              {predefinedQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuestionClick(question)}
                  disabled={isTyping}
                  className='flex-shrink-0 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap'>
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className='flex gap-2'>
          <input
            type='text'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) =>
              e.key === 'Enter' && !e.shiftKey && onSubmit(inputValue)
            }
            placeholder={
              hasContext
                ? 'Ask a question about the selected items...'
                : 'Ask a question about your business, KPIs, or market conditions...'
            }
            className='flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white'
          />
          <button
            onClick={() => onSubmit(inputValue)}
            disabled={!inputValue.trim() || isTyping}
            className='px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center'>
            <PaperAirplaneIcon className='w-4 h-4' />
          </button>
        </div>
        <p className='text-[10px] text-gray-500 mt-2 flex items-center'>
          <GlobeAltIcon className='w-3 h-3 mr-1' />
          Web search enabled - I can search the internet for current information
        </p>
      </div>
    </div>
  );
}
