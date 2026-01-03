import { useState, useEffect } from 'react';
import { mockNews } from '../data/mockNews';
import type { NewsItem, MeetingMaterial } from '../types';
import {
  CheckCircleIcon,
  ChatBubbleLeftIcon,
  SparklesIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { getMeetingsForNewsItem } from '../utils/meetingUtils';

interface CriticalInsightsProps {
  onSelectionChange?: (items: NewsItem[]) => void;
  selectedItems?: NewsItem[];
  meetingMaterials?: Record<string, MeetingMaterial[]>;
}

export default function CriticalInsights({
  onSelectionChange,
  selectedItems = [],
  meetingMaterials = {},
}: CriticalInsightsProps = {}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedNews, setExpandedNews] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<Record<string, string>>({});
  const [showAnnotationInput, setShowAnnotationInput] = useState<string | null>(
    null
  );
  const [selectedNewsIds, setSelectedNewsIds] = useState<string[]>(
    selectedItems.map((item) => item.id)
  );
  // Dynamically extract unique categories from news items
  const categories = [
    { value: 'all', label: 'All Insights' },
    ...Array.from(new Set(mockNews.map((item) => item.category)))
      .sort()
      .map((category) => ({
        value: category,
        label: category,
      })),
  ];

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
      alert(`Annotation saved for insight: ${annotations[newsId]}`);
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

      {/* Insights Feed */}
      <div className='divide-y divide-gray-200'>
        {filteredNews.length === 0 ? (
          <div className='p-8 text-center text-gray-500'>No insights found</div>
        ) : (
          <>
            {filteredNews.map((news) => (
              <InsightCard
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
                meetingMaterials={meetingMaterials}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

interface InsightCardProps {
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
  meetingMaterials?: Record<string, MeetingMaterial[]>;
}

function InsightCard({
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
  meetingMaterials = {},
}: InsightCardProps) {
  // Get meetings that contain this news item
  const meetings = getMeetingsForNewsItem(news.id, meetingMaterials);
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

        <div className='flex-1 min-w-0'>
          {/* Header */}
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <h3 className='text-lg font-semibold text-gray-900'>
                {news.title}
              </h3>
              <div className='mt-2 flex items-center space-x-3'>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    news.priority === 'high'
                      ? 'bg-red-100 text-red-800'
                      : news.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                  {news.priority.toUpperCase()} PRIORITY
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    news.urgency === 'short_term'
                      ? 'bg-red-100 text-red-800'
                      : news.urgency === 'mid_term'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                  {news.urgency === 'short_term'
                    ? 'SHORT TERM'
                    : news.urgency === 'mid_term'
                    ? 'MID TERM'
                    : 'LONG TERM'}
                </span>
              </div>
            </div>
            <div className='ml-4 flex-shrink-0 text-sm text-gray-500'>
              {format(news.timestamp, 'PPp')}
            </div>
          </div>

          {/* Summary and Meeting Coverage - Side by Side */}
          <div className='mt-3 flex items-start gap-4'>
            {/* Summary - Left Side */}
            <div className='flex-1 min-w-0'>
              <p className='text-sm text-gray-700'>{news.summary}</p>
            </div>

            {/* Meeting Coverage - Right Side */}
            {meetings.length > 0 && (
              <div className='flex-shrink-0 w-80 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                <div className='flex items-center gap-2 mb-2'>
                  <CalendarIcon className='w-5 h-5 text-primary-600' />
                  <span className='text-sm font-semibold text-gray-800'>
                    Covered in:
                  </span>
                </div>
                <div className='space-y-1.5'>
                  {meetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className='text-sm text-gray-700 flex items-center gap-2 pl-1'>
                      <span className='font-semibold text-gray-900'>
                        {meeting.title}
                      </span>
                      <span className='text-gray-600'>
                        ({format(meeting.startTime, 'MMM d')} at{' '}
                        {format(meeting.startTime, 'h:mm a')})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Analysis */}
          {isExpanded && (
            <div className='mt-5 space-y-4'>
              <div className='p-5 bg-gradient-to-br from-primary-50 to-purple-50 rounded-xl border-2 border-primary-200 shadow-sm'>
                <div className='flex items-center mb-3'>
                  <SparklesIcon className='w-5 h-5 text-primary-600 mr-2' />
                  <span className='text-sm font-bold text-primary-900'>
                    Context & Details
                  </span>
                </div>
                <p className='text-sm text-gray-700 whitespace-pre-line leading-relaxed'>
                  {news.reasoning}
                </p>
                <div className='mt-3 text-xs text-gray-500 font-medium'>
                  Source: {news.source}
                </div>
              </div>

              {/* Recommendation */}
              {news.recommendation && (
                <div className='p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 shadow-sm'>
                  <div className='flex items-center mb-3'>
                    <CheckCircleIcon className='w-5 h-5 text-green-600 mr-2' />
                    <span className='text-sm font-bold text-green-900'>
                      Recommendation
                    </span>
                  </div>
                  <p className='text-sm text-gray-700 whitespace-pre-line leading-relaxed'>
                    {news.recommendation}
                  </p>
                </div>
              )}

              {/* URL Link */}
              {news.url && (
                <div className='p-3 bg-gray-50 rounded-lg border border-gray-200'>
                  <a
                    href={news.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center'>
                    <span>View Original Article</span>
                    <svg
                      className='w-4 h-4 ml-1'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
                      />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className='mt-4 flex items-center space-x-4'>
            <button
              onClick={onToggleExpand}
              className='text-sm text-primary-600 hover:text-primary-700 font-medium'>
              {isExpanded ? 'Hide Details' : 'Show Details'}
            </button>
            <button
              onClick={onShowAnnotationInput}
              className='flex items-center text-sm text-gray-600 hover:text-gray-700'>
              <ChatBubbleLeftIcon className='w-4 h-4 mr-1' />
              Add Note
            </button>
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
