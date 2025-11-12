import { Link, useLocation } from 'react-router-dom';
import {
  SparklesIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  UserCircleIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  HomeIcon,
  PresentationChartBarIcon,
} from '@heroicons/react/24/outline';

interface RightSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function RightSidebar({
  isCollapsed,
  onToggleCollapse,
}: RightSidebarProps) {
  const location = useLocation();

  // Real time pulse section
  const realTimePulseTabs = [
    {
      id: 'executive-summary',
      label: 'CEO Mind Space',
      path: '/',
      icon: HomeIcon,
    },
    {
      id: 'external-pulse',
      label: 'External Pulse',
      path: '/external-pulse',
      icon: SparklesIcon,
    },
    {
      id: 'internal-pulse',
      label: 'Internal Pulse',
      path: '/internal-pulse',
      icon: ChartBarIcon,
    },
    {
      id: 'wave-executive-dashboard',
      label: 'Wave Executive Dashboard',
      path: '/wave-executive-dashboard',
      icon: PresentationChartBarIcon,
    },
    {
      id: 'action-tracker',
      label: 'Action Tracker',
      path: '/action-tracker',
      icon: ClipboardDocumentListIcon,
    },
  ];

  // Meetings section
  const meetingsTabs = [
    {
      id: 'finance',
      label: 'Finance Forecast',
      path: '/finance',
      icon: CurrencyDollarIcon,
    },
    {
      id: 'finance-review',
      label: 'Finance Review',
      path: '/finance-review',
      icon: PresentationChartBarIcon,
    },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return (
      location.pathname === path || location.pathname.startsWith(path + '/')
    );
  };

  return (
    <div
      className={`fixed right-0 top-0 h-full bg-white border-l border-gray-200 shadow-lg transition-all duration-300 z-30 flex flex-col ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
      {/* Collapse Toggle Button */}
      <div className='flex items-center justify-end p-4 border-b border-gray-200 flex-shrink-0'>
        <button
          onClick={onToggleCollapse}
          className='p-2 rounded-lg hover:bg-gray-100 transition-colors'>
          {isCollapsed ? (
            <ChevronLeftIcon className='w-5 h-5 text-gray-600' />
          ) : (
            <ChevronRightIcon className='w-5 h-5 text-gray-600' />
          )}
        </button>
      </div>

      {/* Navigation Tabs */}
      <nav className='flex flex-col py-4 flex-1 overflow-y-auto min-h-0'>
        {/* Real Time Pulse Section */}
        <div className='mb-6'>
          {!isCollapsed && (
            <div className='px-4 mb-3'>
              <h3 className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                Real Time Pulse
              </h3>
            </div>
          )}
          <div className='space-y-1'>
            {realTimePulseTabs.map((tab) => {
              const Icon = tab.icon;
              const active = isActive(tab.path);
              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}>
                  <Icon
                    className={`w-6 h-6 flex-shrink-0 ${
                      active ? 'text-blue-600' : 'text-gray-600'
                    }`}
                  />
                  {!isCollapsed && (
                    <span className='ml-3 font-medium text-sm'>
                      {tab.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Separator */}
        {!isCollapsed && (
          <div className='mx-4 my-4 border-t border-gray-200'></div>
        )}

        {/* Meetings Section */}
        <div className='mb-4'>
          {!isCollapsed && (
            <div className='px-4 mb-3'>
              <h3 className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                Meetings
              </h3>
            </div>
          )}
          <div className='space-y-1'>
            {meetingsTabs.map((tab) => {
              const Icon = tab.icon;
              const active = isActive(tab.path);
              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-colors ${
                    active
                      ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}>
                  <Icon
                    className={`w-6 h-6 flex-shrink-0 ${
                      active ? 'text-purple-600' : 'text-gray-600'
                    }`}
                  />
                  {!isCollapsed && (
                    <span className='ml-3 font-medium text-sm'>
                      {tab.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Profile Button */}
      <div className='px-4 pb-4 pt-2 border-t border-gray-200 flex-shrink-0'>
        <Link
          to='/profile'
          className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-colors ${
            location.pathname === '/profile'
              ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
              : 'text-gray-700 hover:bg-gray-50'
          }`}>
          <UserCircleIcon
            className={`w-6 h-6 flex-shrink-0 ${
              location.pathname === '/profile'
                ? 'text-primary-600'
                : 'text-gray-600'
            }`}
          />
          {!isCollapsed && (
            <span className='ml-3 font-medium text-sm'>Profile</span>
          )}
        </Link>
      </div>
    </div>
  );
}
