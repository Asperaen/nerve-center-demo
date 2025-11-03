import { useState } from 'react';
import { mockAnalysisResults, examplePrompts } from '../data/mockAnalysis';
import type { AnalysisResult } from '../types';
import {
  PaperAirplaneIcon,
  SparklesIcon,
  ChevronRightIcon,
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
  Cell,
} from 'recharts';

export default function RootCauseAnalysis() {
  const [messages, setMessages] = useState<
    Array<{
      type: 'user' | 'assistant';
      content: string;
      analysis?: AnalysisResult;
    }>
  >([]);
  const [inputValue, setInputValue] = useState('');
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>(['Company']);

  const handleSubmit = (prompt: string) => {
    if (!prompt.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { type: 'user', content: prompt }]);
    setInputValue('');

    // Simulate typing delay
    setTimeout(() => {
      // Map prompts to analysis results
      let analysisResult: AnalysisResult | undefined;
      if (
        prompt.toLowerCase().includes('net profit') ||
        prompt.toLowerCase().includes('bu')
      ) {
        analysisResult = mockAnalysisResults['net-profit-by-bu'];
      } else if (
        prompt.toLowerCase().includes('procurement') ||
        prompt.toLowerCase().includes('cost down')
      ) {
        analysisResult = mockAnalysisResults['procurement-cost-down'];
      } else if (
        prompt.toLowerCase().includes('revenue') ||
        prompt.toLowerCase().includes('customer')
      ) {
        analysisResult = mockAnalysisResults['revenue-by-customer'];
      } else {
        analysisResult = mockAnalysisResults['net-profit-by-bu'];
      }

      setMessages((prev) => [
        ...prev,
        {
          type: 'assistant',
          content: analysisResult.summary,
          analysis: analysisResult,
        },
      ]);
    }, 500);
  };

  return (
    <div className='bg-white rounded-lg border border-gray-200'>
      <div className='p-6 border-b border-gray-200'>
        <h2 className='text-xl font-semibold text-gray-900 flex items-center'>
          <SparklesIcon className='w-6 h-6 mr-2 text-primary-600' />
          Root Cause Analysis
        </h2>
        <p className='mt-1 text-sm text-gray-500'>
          Ask questions about KPI performance and get AI-powered drill-down
          analysis
        </p>
      </div>

      {/* Example Prompts */}
      {messages.length === 0 && (
        <div className='p-6 border-b border-gray-200'>
          <p className='text-sm font-medium text-gray-700 mb-3'>
            Example questions:
          </p>
          <div className='grid grid-cols-2 gap-3'>
            {examplePrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleSubmit(prompt)}
                className='text-left px-4 py-3 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200'>
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Breadcrumbs */}
      {breadcrumbs.length > 1 && (
        <div className='px-6 py-3 bg-gray-50 border-b border-gray-200'>
          <div className='flex items-center space-x-2 text-sm'>
            {breadcrumbs.map((crumb, index) => (
              <div
                key={index}
                className='flex items-center'>
                {index > 0 && (
                  <ChevronRightIcon className='w-4 h-4 mx-2 text-gray-400' />
                )}
                <button
                  onClick={() =>
                    setBreadcrumbs(breadcrumbs.slice(0, index + 1))
                  }
                  className={`${
                    index === breadcrumbs.length - 1
                      ? 'text-primary-600 font-medium'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}>
                  {crumb}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className='p-6 space-y-6 max-h-[600px] overflow-y-auto'>
        {messages.map((message, index) => (
          <div key={index}>
            {message.type === 'user' ? (
              <div className='flex justify-end'>
                <div className='max-w-3xl px-4 py-3 bg-primary-600 text-white rounded-lg'>
                  <p className='text-sm'>{message.content}</p>
                </div>
              </div>
            ) : (
              <div className='flex justify-start'>
                <div className='max-w-full w-full'>
                  <div className='flex items-start space-x-3'>
                    <div className='flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center'>
                      <SparklesIcon className='w-5 h-5 text-primary-600' />
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm text-gray-700 mb-4'>
                        {message.content}
                      </p>
                      {message.analysis && (
                        <AnalysisVisualization
                          analysis={message.analysis}
                          onDrillDown={(name) =>
                            setBreadcrumbs([...breadcrumbs, name])
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className='p-6 border-t border-gray-200'>
        <div className='flex space-x-3'>
          <input
            type='text'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit(inputValue)}
            placeholder='Ask a question about KPI performance...'
            className='flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
          />
          <button
            onClick={() => handleSubmit(inputValue)}
            disabled={!inputValue.trim()}
            className='px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center'>
            <PaperAirplaneIcon className='w-5 h-5' />
          </button>
        </div>
      </div>
    </div>
  );
}

interface AnalysisVisualizationProps {
  analysis: AnalysisResult;
  onDrillDown: (name: string) => void;
}

function AnalysisVisualization({
  analysis,
  onDrillDown,
}: AnalysisVisualizationProps) {
  const [selectedView, setSelectedView] = useState<'breakdown' | 'waterfall'>(
    'breakdown'
  );

  const breakdownData = analysis.drillDownData.data.map((item) => ({
    name: item.name,
    value: item.value,
    variance: item.variance,
    variancePercent: item.variancePercent,
  }));

  return (
    <div className='space-y-4'>
      {/* View Selector */}
      <div className='flex space-x-2'>
        <button
          onClick={() => setSelectedView('breakdown')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            selectedView === 'breakdown'
              ? 'bg-primary-100 text-primary-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}>
          Breakdown by {analysis.drillDownData.level.toUpperCase()}
        </button>
        {analysis.waterfallData && (
          <button
            onClick={() => setSelectedView('waterfall')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              selectedView === 'waterfall'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            Waterfall Analysis
          </button>
        )}
      </div>

      {/* Breakdown Chart */}
      {selectedView === 'breakdown' && (
        <div className='p-4 bg-gray-50 rounded-lg'>
          <div className='h-80'>
            <ResponsiveContainer
              width='100%'
              height='100%'>
              <BarChart data={breakdownData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis
                  dataKey='name'
                  style={{ fontSize: '12px' }}
                  angle={-15}
                  textAnchor='end'
                  height={80}
                />
                <YAxis style={{ fontSize: '12px' }} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey='value'
                  fill='#3b82f6'
                  name='Actual Value'>
                  {breakdownData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.variance >= 0 ? '#16a34a' : '#dc2626'}
                      style={{ cursor: 'pointer' }}
                      onClick={() => onDrillDown(entry.name)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className='mt-3 text-xs text-gray-500 text-center'>
            Click on bars to drill down further
          </p>
        </div>
      )}

      {/* Waterfall Chart */}
      {selectedView === 'waterfall' && analysis.waterfallData && (
        <div className='p-4 bg-gray-50 rounded-lg'>
          <div className='space-y-2'>
            {analysis.waterfallData.map((item, index) => (
              <div
                key={index}
                className='flex items-center space-x-3'>
                <div className='w-32 text-sm text-gray-700 font-medium'>
                  {item.name}
                </div>
                <div className='flex-1 flex items-center'>
                  <div
                    className={`h-8 rounded ${
                      item.type === 'total'
                        ? 'bg-blue-500'
                        : item.type === 'positive'
                        ? 'bg-opportunity-500'
                        : 'bg-risk-500'
                    }`}
                    style={{
                      width: `${Math.abs(item.value) * 3}px`,
                      minWidth: '40px',
                    }}
                  />
                  <span className='ml-3 text-sm font-semibold text-gray-900'>
                    {item.value > 0 && item.type !== 'total' ? '+' : ''}
                    {item.value.toFixed(1)}M
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                Name
              </th>
              <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                Value
              </th>
              <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                Variance
              </th>
              <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                Variance %
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {analysis.drillDownData.data.map((item, index) => (
              <tr
                key={index}
                className='hover:bg-gray-50 cursor-pointer'
                onClick={() => onDrillDown(item.name)}>
                <td className='px-4 py-3 text-sm font-medium text-gray-900'>
                  {item.name}
                </td>
                <td className='px-4 py-3 text-sm text-right text-gray-700'>
                  {item.value.toFixed(1)}M
                </td>
                <td
                  className={`px-4 py-3 text-sm text-right font-medium ${
                    item.variance >= 0
                      ? 'text-opportunity-600'
                      : 'text-risk-600'
                  }`}>
                  {item.variance > 0 ? '+' : ''}
                  {item.variance.toFixed(1)}M
                </td>
                <td
                  className={`px-4 py-3 text-sm text-right font-medium ${
                    item.variancePercent >= 0
                      ? 'text-opportunity-600'
                      : 'text-risk-600'
                  }`}>
                  {item.variancePercent > 0 ? '+' : ''}
                  {item.variancePercent.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
