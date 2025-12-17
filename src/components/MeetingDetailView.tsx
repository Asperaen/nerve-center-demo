import {
  useParams,
  useNavigate,
  useOutletContext,
  Link,
} from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useMemo } from 'react';
import { mockCalendarEvents } from '../data/mockCalendar';
import { mockNews } from '../data/mockNews';
import { internalPulseColumns } from '../data/mockInternalPulse';
import { mockOPWaterfallStages } from '../data/mockForecast';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ComposedChart,
  Legend,
} from 'recharts';
import type { NewsItem, PulseMetric, MeetingMaterial } from '../types';

interface MeetingDetailViewContext {
  meetingMaterials: Record<string, MeetingMaterial[]>;
}

function WaterfallPreview() {
  // Prepare chart data for baseline waterfall only
  const chartData = useMemo(() => {
    const baselineData = mockOPWaterfallStages.map((stage, index) => {
      const prevValue = index > 0 ? mockOPWaterfallStages[index - 1].value : 0;
      const currentValue = stage.value;
      const delta =
        stage.delta ?? (index === 0 ? currentValue : currentValue - prevValue);

      const isBaseline = stage.type === 'baseline';
      const barValue = isBaseline ? currentValue : delta;
      const baselineValue = isBaseline ? 0 : prevValue;

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
        cumulativeValue: currentValue,
        delta,
        baselineValue,
        barValue,
        isPositive: delta >= 0,
      };

      return dataPoint;
    });

    return baselineData;
  }, []);

  return (
    <div className='p-6'>
      <div className='bg-white p-8'>
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900 mb-1'>
              Full Year OP Waterfall
            </h2>
            <p className='text-sm text-gray-500'>
              Visualize operating profit changes across stages
            </p>
          </div>
          <Link
            to='/finance'
            className='px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center transform hover:scale-105'>
            Go to Finance Forecast
            <ArrowRightIcon className='w-5 h-5 ml-2' />
          </Link>
        </div>

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
                  value: 'Operating Profit (M USD)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: '12px' },
                }}
              />
              <Tooltip
                formatter={(
                  value: number,
                  _name: string,
                  props: {
                    payload?: {
                      [key: string]: string | number | undefined;
                      cumulativeValue?: number;
                      delta?: number;
                      label?: string;
                    };
                  }
                ) => {
                  const payload = props.payload;
                  const cumulative = payload?.cumulativeValue ?? value;
                  const delta = payload?.delta;

                  const tooltipLines: string[] = [
                    `${payload?.label ?? 'Stage'}: $${cumulative.toFixed(1)}M`,
                  ];

                  if (delta !== undefined && delta !== cumulative) {
                    tooltipLines.push(
                      `Change: ${delta > 0 ? '+' : ''}$${delta.toFixed(1)}M`
                    );
                  }

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
              {/* Change bars - shows the delta/changes */}
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
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default function MeetingDetailView() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { meetingMaterials } = useOutletContext<MeetingDetailViewContext>();

  const meeting = mockCalendarEvents.find((m) => m.id === meetingId);

  // Get materials from context (which may have been updated via drag-drop)
  const materials = meeting
    ? meetingMaterials[meeting.id] || meeting.materials
    : [];

  if (!meeting) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-2xl font-semibold text-gray-900 mb-2'>
            Meeting not found
          </h2>
          <button
            onClick={() => navigate('/')}
            className='text-primary-600 hover:text-primary-700'>
            Go back
          </button>
        </div>
      </div>
    );
  }

  // Get materials data
  const externalMaterials = materials
    .filter((m) => m.type === 'external-pulse')
    .map((m) => mockNews.find((n) => n.id === m.itemId))
    .filter((n): n is NewsItem => n !== undefined);

  const internalMaterials = materials
    .filter((m) => m.type === 'internal-pulse')
    .map((m) => {
      // Find the metric in internal pulse columns
      for (const column of internalPulseColumns) {
        for (const section of column.sections) {
          const metric = section.metrics.find((met) => met.id === m.itemId);
          if (metric) return metric;
        }
      }
      return null;
    })
    .filter((m): m is PulseMetric => m !== null);

  const requiredAttendees = meeting.attendees.filter((a) => a.isRequired);
  const optionalAttendees = meeting.attendees.filter((a) => !a.isRequired);

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 sticky top-0 z-10'>
        <div className='p-6'>
          <button
            onClick={() => navigate(-1)}
            className='flex items-center text-gray-600 hover:text-gray-900 mb-4'>
            <ArrowLeftIcon className='w-5 h-5 mr-2' />
            <span>Back</span>
          </button>

          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <h1 className='text-2xl font-bold text-gray-900 mb-2'>
                {meeting.title}
              </h1>
              <div className='flex items-center gap-4 text-sm text-gray-600'>
                <div className='flex items-center'>
                  <span className='font-medium'>Time:</span>
                  <span className='ml-2'>
                    {format(meeting.startTime, 'h:mm a')} -{' '}
                    {format(meeting.endTime, 'h:mm a')}
                  </span>
                </div>
                {meeting.location && (
                  <div className='flex items-center'>
                    <span className='font-medium'>Location:</span>
                    <span className='ml-2'>{meeting.location}</span>
                  </div>
                )}
                <div className='flex items-center'>
                  <span className='font-medium'>Organizer:</span>
                  <span className='ml-2'>{meeting.organizer}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendees Section */}
      <div className='bg-white border-b border-gray-200 p-6'>
        <h2 className='text-lg font-semibold text-gray-900 mb-4'>Attendees</h2>
        <div className='space-y-4'>
          {requiredAttendees.length > 0 && (
            <div>
              <h3 className='text-sm font-medium text-gray-700 mb-2'>
                Required
              </h3>
              <div className='flex flex-wrap gap-3'>
                {requiredAttendees.map((attendee, index) => (
                  <div
                    key={index}
                    className='flex items-center gap-2 px-3 py-2 bg-primary-50 rounded-lg border border-primary-200'>
                    <div className='w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold'>
                      {attendee.name.charAt(0)}
                    </div>
                    <div>
                      <div className='text-sm font-medium text-gray-900'>
                        {attendee.name}
                      </div>
                      {attendee.role && (
                        <div className='text-xs text-gray-500'>
                          {attendee.role}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {optionalAttendees.length > 0 && (
            <div>
              <h3 className='text-sm font-medium text-gray-700 mb-2'>
                Optional
              </h3>
              <div className='flex flex-wrap gap-3'>
                {optionalAttendees.map((attendee, index) => (
                  <div
                    key={index}
                    className='flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200'>
                    <div className='w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-sm font-semibold'>
                      {attendee.name.charAt(0)}
                    </div>
                    <div>
                      <div className='text-sm font-medium text-gray-900'>
                        {attendee.name}
                      </div>
                      {attendee.role && (
                        <div className='text-xs text-gray-500'>
                          {attendee.role}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {meeting.description && (
        <div className='bg-white border-b border-gray-200 p-6'>
          <h2 className='text-lg font-semibold text-gray-900 mb-2'>
            Description
          </h2>
          <p className='text-sm text-gray-700'>{meeting.description}</p>
        </div>
      )}

      {/* Meeting Materials */}
      <div className='bg-white border-b border-gray-200 p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-semibold text-gray-900'>
            Meeting Materials
          </h2>
          <div className='text-sm text-gray-500'>
            {materials.length} item{materials.length !== 1 ? 's' : ''} attached
          </div>
        </div>

        {materials.length === 0 ? (
          <div className='text-center py-8 border-2 border-dashed border-gray-300 rounded-lg'>
            <p className='text-sm text-gray-500'>
              No materials attached. Drag items from External or Internal Pulse
              pages to add them.
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            {/* External Pulse Materials */}
            {externalMaterials.length > 0 && (
              <div>
                <h3 className='text-sm font-medium text-gray-700 mb-2'>
                  External Pulse
                </h3>
                <div className='space-y-2'>
                  {externalMaterials.map((news) => (
                    <div
                      key={news.id}
                      className='p-3 bg-gray-50 rounded-lg border border-gray-200'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <h4 className='text-sm font-medium text-gray-900'>
                            {news.title}
                          </h4>
                          <p className='text-xs text-gray-500 mt-1 line-clamp-2'>
                            {news.summary}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Internal Pulse Materials */}
            {internalMaterials.length > 0 && (
              <div>
                <h3 className='text-sm font-medium text-gray-700 mb-2'>
                  Internal Pulse
                </h3>
                <div className='space-y-2'>
                  {internalMaterials.map((metric) => (
                    <div
                      key={metric.id}
                      className='p-3 bg-gray-50 rounded-lg border border-gray-200'>
                      <div className='text-sm font-medium text-gray-900'>
                        {metric.name}
                      </div>
                      {metric.value !== undefined && (
                        <div className='text-xs text-gray-500 mt-1'>
                          {metric.valuePercent !== undefined
                            ? `$${metric.value}M (${metric.valuePercent}%)`
                            : `$${metric.value}M`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Meeting Content */}
      <div className='bg-gray-50'>
        {meeting.meetingType === 'finance-review' ? (
          <WaterfallPreview />
        ) : (
          <div className='p-6'>
            <div className='bg-white rounded-lg border border-gray-200 p-6'>
              <h2 className='text-lg font-semibold text-gray-900 mb-2'>
                Meeting Content
              </h2>
              <p className='text-sm text-gray-600'>
                Meeting content will be displayed here. For Finance Review
                meetings, the full Finance page is embedded above.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
