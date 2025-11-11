import { useState, useEffect } from 'react';
import { mockNews } from '../data/mockNews';
import type { NewsCategory, NewsItem } from '../types';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChatBubbleLeftIcon,
  SparklesIcon,
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
  onGenerateInsights?: () => void;
  onSelectionChange?: (items: NewsItem[]) => void;
  selectedItems?: NewsItem[];
}

export default function ExternalPulseCheck({
  onGenerateInsights,
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
    <div className='bg-white rounded-xl border border-gray-200 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-shadow duration-300'>
      <div className='p-8 border-b border-gray-200 bg-gradient-to-r from-white to-purple-50/30'>
        <div className='flex items-center justify-between mb-6'>
          {/* Insights Button - Show when items are selected */}
          {selectedNewsIds.length > 0 && (
            <div className='flex items-center space-x-4'>
              <div className='text-sm text-gray-600'>
                {selectedNewsIds.length} item
                {selectedNewsIds.length > 1 ? 's' : ''} selected
              </div>
              <button
                onClick={onGenerateInsights}
                className='group relative flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95 overflow-hidden'>
                {/* Animated gradient overlay */}
                <div className='absolute inset-0 bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse'></div>

                {/* Shimmer effect */}
                <div className='absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent'></div>

                {/* Content */}
                <span className='relative flex items-center z-10'>
                  <SparklesIcon className='w-5 h-5 mr-2 group-hover:animate-spin transition-transform duration-300' />
                  <span className='text-base'>Generate AI Insights</span>
                </span>

                {/* Glow effect */}
                <div className='absolute -inset-1 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300 -z-10'></div>
              </button>
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className='flex flex-wrap gap-3'>
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                selectedCategory === cat.value
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-200'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
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
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('materialType', 'external-pulse');
    e.dataTransfer.setData('itemId', news.id);
    e.dataTransfer.effectAllowed = 'move';
    // Add visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Restore visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  return (
    <div
      className='p-6 hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50/30 transition-all duration-200 cursor-move border-b border-gray-100 last:border-b-0'
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}>
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
            <div className='mt-5 p-5 bg-gradient-to-br from-primary-50 to-purple-50 rounded-xl border-2 border-primary-200 shadow-sm'>
              <div className='flex items-center mb-3'>
                <SparklesIcon className='w-5 h-5 text-primary-600 mr-2' />
                <span className='text-sm font-bold text-primary-900'>
                  AI Analysis
                </span>
              </div>
              <p className='text-sm text-gray-700 whitespace-pre-line leading-relaxed'>
                {news.aiAnalysis}
              </p>
              <div className='mt-3 text-xs text-gray-500 font-medium'>
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
