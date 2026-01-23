import {
  BuildingOffice2Icon,
  ChartBarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  DocumentCheckIcon,
  HomeIcon,
  SparklesIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';

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
      label: 'Home',
      path: '/',
      icon: HomeIcon,
    },
    {
      id: 'budget',
      label: 'Budget',
      path: '/budget',
      icon: ChartBarIcon,
    },
    {
      id: 'ideation-progress',
      label: 'Initiatives',
      path: '/initiative-performance',
      icon: SparklesIcon,
    },
    {
      id: 'business-group-performance',
      label: 'Actual - Business Group Performance',
      path: '/business-group-performance',
      icon: BuildingOffice2Icon,
    },
    {
      id: 'actual-initiative-implementation',
      label: 'Actual - Initiative Implementation dashboard',
      path: '/actual-initiative-implementation',
      icon: DocumentCheckIcon,
    },
    {
      id: 'market-intelligence',
      label: 'Forecast',
      path: '/market-intelligence',
      icon: CurrencyDollarIcon,
    },
  ];

  // Tools section
  const toolsTabs = [
    {
      id: 'action-tracker',
      label: 'Action Tracker',
      path: '/action-tracker',
      icon: ClipboardDocumentListIcon,
    },
    {
      id: 'finance-review',
      label: 'Quarterly Actuals Review',
      path: '/finance-review',
      icon: DocumentCheckIcon,
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
        {/* Live */}
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

        {/* Tools Section */}
        <div className='mb-6'>
          {!isCollapsed && (
            <div className='px-4 mb-3'>
              <h3 className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                Tools
              </h3>
            </div>
          )}
          <div className='space-y-1'>
            {toolsTabs.map((tab) => {
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
