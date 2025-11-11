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

  const tabs = [
    {
      id: 'executive-summary',
      label: 'Executive Summary',
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
      id: 'finance',
      label: 'Finance',
      path: '/finance',
      icon: CurrencyDollarIcon,
    },
    {
      id: 'action-tracker',
      label: 'Action Tracker',
      path: '/action-tracker',
      icon: ClipboardDocumentListIcon,
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
      className={`fixed right-0 top-0 h-full bg-white border-l border-gray-200 shadow-lg transition-all duration-300 z-30 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
      {/* Collapse Toggle Button */}
      <div className='flex items-center justify-end p-4 border-b border-gray-200'>
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
      <nav className='flex flex-col py-4'>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-colors ${
                active
                  ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}>
              <Icon
                className={`w-6 h-6 flex-shrink-0 ${
                  active ? 'text-primary-600' : 'text-gray-600'
                }`}
              />
              {!isCollapsed && (
                <span className='ml-3 font-medium text-sm'>{tab.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Profile Button */}
      <div className='absolute bottom-4 left-0 right-0 px-4'>
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
