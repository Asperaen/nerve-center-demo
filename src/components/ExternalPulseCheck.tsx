import { useState, useEffect } from 'react';
import { mockNews } from '../data/mockNews';
import type { NewsCategory, NewsItem } from '../types';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChatBubbleLeftIcon,
  SparklesIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const categories: { value: NewsCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All News' },
  { value: 'macro', label: 'Macro & Geopolitics' },
  { value: 'competitors', label: 'Competitors & Industry' },
  { value: 'customers', label: 'Customers & End Market' },
  { value: 'suppliers', label: 'Suppliers & Supply Chain' },
];

interface ExternalPulseCheckProps {
  onScheduleMeeting?: () => void;
  onSelectionChange?: (items: NewsItem[]) => void;
  selectedItems?: NewsItem[];
}

export default function ExternalPulseCheck({
  onScheduleMeeting,
  onSelectionChange,
  selectedItems = [],
}: ExternalPulseCheckProps = {}) {
  const [selectedCategory, setSelectedCategory] = useState<
    NewsCategory | 'all'
  >('all');
  const [expandedNews, setExpandedNews] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<Record<string, string>>({});
  const [showAnnotationInput, setShowAnnotationInput] = useState<string | null>(
    null
  );
  const [selectedNewsIds, setSelectedNewsIds] = useState<string[]>(
    selectedItems.map((item) => item.id)
  );

  // Sync with parent selection
  useEffect(() => {
    setSelectedNewsIds(selectedItems.map((item) => item.id));
  }, [selectedItems]);

  const filteredNews =
    selectedCategory === 'all'
      ? mockNews
      : mockNews.filter((n) => n.category === selectedCategory);

  const toggleExpanded = (newsId: string) => {
    setExpandedNews(expandedNews === newsId ? null : newsId);
  };

  const handleAddAnnotation = (newsId: string) => {
    if (annotations[newsId]?.trim()) {
      // In a real app, save to backend
      alert(`Annotation saved for news item: ${annotations[newsId]}`);
      setShowAnnotationInput(null);
      setAnnotations({ ...annotations, [newsId]: '' });
    }
  };

  const toggleNewsSelection = (news: NewsItem) => {
    setSelectedNewsIds((prev) => {
      const newSelection = prev.includes(news.id)
        ? prev.filter((id) => id !== news.id)
        : [...prev, news.id];

      // Notify parent of selection change
      if (onSelectionChange) {
        const selectedNewsItems = mockNews.filter((n) =>
          newSelection.includes(n.id)
        );
        onSelectionChange(selectedNewsItems);
      }

      return newSelection;
    });
  };

  return (
    <div className='bg-white rounded-lg border border-gray-200'>
      <div className='p-6 border-b border-gray-200'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-semibold text-gray-900 flex items-center'>
              <SparklesIcon className='w-6 h-6 mr-2 text-primary-600' />
              External Pulse Check
            </h2>
            <p className='mt-1 text-sm text-gray-500'>
              AI-powered analysis of market news and external events
            </p>
          </div>

          {/* Schedule Meeting Button - Show when items are selected */}
          {selectedNewsIds.length > 0 && (
            <div className='flex items-center space-x-4'>
              <div className='text-sm text-gray-600'>
                {selectedNewsIds.length} item
                {selectedNewsIds.length > 1 ? 's' : ''} selected
              </div>
              <button
                onClick={onScheduleMeeting}
                className='flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors'>
                <CalendarDaysIcon className='w-4 h-4 mr-2' />
                Schedule Meeting
              </button>
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className='mt-4 flex space-x-2'>
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* News Feed */}
      <div className='divide-y divide-gray-200'>
        {filteredNews.map((news) => (
          <NewsCard
            key={news.id}
            news={news}
            isExpanded={expandedNews === news.id}
            onToggleExpand={() => toggleExpanded(news.id)}
            annotation={annotations[news.id] || ''}
            onAnnotationChange={(value) =>
              setAnnotations({ ...annotations, [news.id]: value })
            }
            showAnnotationInput={showAnnotationInput === news.id}
            onShowAnnotationInput={() => setShowAnnotationInput(news.id)}
            onSaveAnnotation={() => handleAddAnnotation(news.id)}
            onCancelAnnotation={() => {
              setShowAnnotationInput(null);
              setAnnotations({ ...annotations, [news.id]: '' });
            }}
            isSelected={selectedNewsIds.includes(news.id)}
            onToggleSelection={() => toggleNewsSelection(news)}
          />
        ))}
      </div>
    </div>
  );
}

interface NewsCardProps {
  news: NewsItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  annotation: string;
  onAnnotationChange: (value: string) => void;
  showAnnotationInput: boolean;
  onShowAnnotationInput: () => void;
  onSaveAnnotation: () => void;
  onCancelAnnotation: () => void;
  isSelected: boolean;
  onToggleSelection: () => void;
}

function NewsCard({
  news,
  isExpanded,
  onToggleExpand,
  annotation,
  onAnnotationChange,
  showAnnotationInput,
  onShowAnnotationInput,
  onSaveAnnotation,
  onCancelAnnotation,
  isSelected,
  onToggleSelection,
}: NewsCardProps) {
  return (
    <div className='p-6 hover:bg-gray-50 transition-colors'>
      <div className='flex items-start space-x-4'>
        {/* Checkbox */}
        <div className='flex-shrink-0 pt-1'>
          <input
            type='checkbox'
            checked={isSelected}
            onChange={onToggleSelection}
            className='w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2'
          />
        </div>

        {/* Risk/Opportunity Icon */}
        <div
          className={`flex-shrink-0 p-2 rounded-full ${
            news.riskOrOpportunity === 'risk'
              ? 'bg-risk-100'
              : 'bg-opportunity-100'
          }`}>
          {news.riskOrOpportunity === 'risk' ? (
            <ExclamationTriangleIcon className='w-6 h-6 text-risk-600' />
          ) : (
            <CheckCircleIcon className='w-6 h-6 text-opportunity-600' />
          )}
        </div>

        <div className='flex-1 min-w-0'>
          {/* Header */}
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <h3 className='text-lg font-semibold text-gray-900'>
                {news.headline}
              </h3>
              <div className='mt-2 flex items-center space-x-3'>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    news.riskOrOpportunity === 'risk'
                      ? 'bg-risk-100 text-risk-800'
                      : 'bg-opportunity-100 text-opportunity-800'
                  }`}>
                  {news.riskOrOpportunity.toUpperCase()}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    news.impactLevel === 'high'
                      ? 'bg-red-100 text-red-800'
                      : news.impactLevel === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                  {news.impactLevel.toUpperCase()} IMPACT
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    news.urgencyLevel === 'urgent'
                      ? 'bg-red-100 text-red-800'
                      : news.urgencyLevel === 'important'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                  {news.urgencyLevel.toUpperCase()}
                </span>
              </div>
            </div>
            <div className='ml-4 flex-shrink-0 text-sm text-gray-500'>
              {format(news.timestamp, 'PPp')}
            </div>
          </div>

          {/* Summary */}
          <p className='mt-3 text-sm text-gray-700'>{news.summary}</p>

          {/* AI Analysis */}
          {isExpanded && (
            <div className='mt-4 p-4 bg-primary-50 rounded-lg border border-primary-100'>
              <div className='flex items-center mb-2'>
                <SparklesIcon className='w-4 h-4 text-primary-600 mr-2' />
                <span className='text-sm font-medium text-primary-900'>
                  AI Analysis
                </span>
              </div>
              <p className='text-sm text-gray-700 whitespace-pre-line'>
                {news.aiAnalysis}
              </p>
              <div className='mt-2 text-xs text-gray-500'>
                Source: {news.source}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className='mt-4 flex items-center space-x-4'>
            <button
              onClick={onToggleExpand}
              className='text-sm text-primary-600 hover:text-primary-700 font-medium'>
              {isExpanded ? 'Hide Analysis' : 'Show AI Analysis'}
            </button>
            <button
              onClick={onShowAnnotationInput}
              className='flex items-center text-sm text-gray-600 hover:text-gray-700'>
              <ChatBubbleLeftIcon className='w-4 h-4 mr-1' />
              Add Note
            </button>
            {news.annotations.length > 0 && (
              <span className='text-sm text-gray-500'>
                {news.annotations.length} note
                {news.annotations.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Annotation Input */}
          {showAnnotationInput && (
            <div className='mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200'>
              <textarea
                value={annotation}
                onChange={(e) => onAnnotationChange(e.target.value)}
                placeholder='Add your notes or comments...'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none'
                rows={3}
              />
              <div className='mt-2 flex justify-end space-x-2'>
                <button
                  onClick={onCancelAnnotation}
                  className='px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700'>
                  Cancel
                </button>
                <button
                  onClick={onSaveAnnotation}
                  className='px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700'>
                  Save Note
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
