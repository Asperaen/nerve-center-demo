import {
  ArrowTopRightOnSquareIcon,
  BuildingOffice2Icon,
  ChartBarIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  ComputerDesktopIcon,
  CurrencyDollarIcon,
  DocumentCheckIcon,
  HomeIcon,
  SparklesIcon,
  UserCircleIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';

function CompalLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 133 71" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M119.71 46.91v23.15h12.58v-4.12h-7.54V46.91h-5.05zm-16.94 0-8.82 23.15h5.35l1.67-4.24h9.5l1.58 4.24h5.38l-8.64-23.15zm-.61 15.31 3.5-10.44 3.44 10.44h-6.95zM33.22 45.72c-3.56 0-6.99 1.41-9.41 3.86a11.7 11.7 0 0 0-3.34 8.08c0 3.63 1.27 6.9 3.56 9.22 2.31 2.33 5.58 3.62 9.19 3.62 7.51 0 12.75-5.28 12.75-12.84 0-3.08-1.15-5.87-3.34-8.08-2.43-2.45-5.86-3.86-9.41-3.86zm5.64 17.72a7.29 7.29 0 0 1-5.18 2.16c-1.94 0-3.81-.77-5.17-2.16a8.15 8.15 0 0 1-2.27-5.75c0-3.83 3.41-7.07 7.45-7.07 2.02.01 3.96.83 5.38 2.27 1.33 1.34 2.07 3.05 2.07 4.8 0 2.23-.81 4.27-2.27 5.75zm-35.48-13.8c-2.18 2.27-3.38 5.29-3.38 8.5 0 3.59 1.24 6.54 3.68 8.76 2.4 2.21 5.48 3.43 8.66 3.43 1.72 0 3.1-.4 4.93-.97v-5.68c-1.37 1.1-3.1 1.75-4.8 1.75-2.05 0-3.83-.7-5.14-2.02-1.3-1.32-2.02-3.18-2.02-5.24 0-4.28 2.97-7.39 7.06-7.39 1.84 0 3.58.64 4.9 1.75v-5.61c-1.78-.7-3.42-1.04-5.12-1.04-3.21 0-6.49 1.41-8.76 3.76zm90.3-1c-1.39-1.4-3.52-2.11-6.32-2.11h-9v23.16h5.05v-8.09h4.18c5.35 0 7.94-2.51 7.94-7.66 0-2.27-.62-4.05-1.85-5.29zm-4.33 8.06c-1.02 1.03-2.67 1.03-4.26 1.03h-1.68v-7.34h1.68c1.59 0 3.23 0 4.24 1.02.6.62.9 1.5.9 2.71 0 1.14-.29 1.98-.88 2.57zm-21.88-10.17-5.63 14.14-5.31-14.14h-5.24l-3.9 23.16h4.99l2.26-15.98 6.32 15.98h1.67l6.62-15.74 1.97 15.74h5.02l-3.47-23.16zM74.15 14.22c.17 1 .26 2.03.26 3.08 0 9.77-7.85 17.7-17.53 17.7-9.68 0-17.53-7.93-17.53-17.7S47.2-.37 56.88-.37c1.04 0 2.05.09 3.04.26l-.85 4.87a12.7 12.7 0 0 0-2.19-.19c-6.98 0-12.63 5.71-12.63 12.75s5.66 12.75 12.63 12.75 12.63-5.71 12.63-12.75c0-.76-.06-1.5-.19-2.22l4.83-.86m-6.22 1.11-4.83.85c.06.36.1.74.1 1.12 0 3.52-2.83 6.38-6.32 6.38-.82 0-1.63-.16-2.39-.47l9.2-9.29-3.46-3.49-9.2 9.29a6.3 6.3 0 0 1-.47-2.41c0-3.52 2.83-6.38 6.32-6.38.37 0 .74.03 1.1.1l.85-4.87a11.2 11.2 0 0 0-1.95-.17c-6.19 0-11.22 5.07-11.22 11.32s5.02 11.32 11.22 11.32 11.22-5.07 11.22-11.32c0-.67-.06-1.33-.17-1.97"
        fill="#64a70b"
      />
    </svg>
  );
}

interface RightSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function RightSidebar({
  isCollapsed,
  onToggleCollapse,
}: RightSidebarProps) {
  const location = useLocation();
  const linkSearch = location.search;
  const buildLink = (path: string) =>
    linkSearch ? `${path}${linkSearch}` : path;

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
      id: 'actual-initiative-implementation',
      label: 'Actual (Implementation)',
      path: '/actual-initiative-implementation',
      icon: DocumentCheckIcon,
    },
    {
      id: 'business-group-performance',
      label: 'Actual (Reconciliation)',
      path: '/business-group-performance',
      icon: BuildingOffice2Icon,
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
    {
      id: 'hc-dashboard',
      label: 'HC Dashboard',
      path: 'external:hc-dashboard',
      icon: UsersIcon,
      isExternal: true,
    },
    {
      id: 'ict',
      label: 'ICT',
      path: 'external:ict',
      icon: ComputerDesktopIcon,
      isExternal: true,
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
      {/* Brand Logo + Collapse Toggle */}
      {isCollapsed ? (
        <div className='flex items-center justify-center py-3 px-1 border-b border-gray-200 flex-shrink-0'>
          <button
            onClick={onToggleCollapse}
            className='p-1.5 rounded-lg hover:bg-gray-100 transition-colors'
            aria-label='Expand sidebar'>
            <CompalLogo className='h-5' />
          </button>
        </div>
      ) : (
        <div className='flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0'>
          <Link to={buildLink('/')} className='flex items-center' aria-label='Compal Home'>
            <CompalLogo className='h-7' />
          </Link>
          <button
            onClick={onToggleCollapse}
            className='p-2 rounded-lg hover:bg-gray-100 transition-colors'
            aria-label='Collapse sidebar'>
            <ChevronRightIcon className='w-5 h-5 text-gray-600' />
          </button>
        </div>
      )}

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
                  to={buildLink(tab.path)}
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
              const active = !tab.isExternal && isActive(tab.path);

              if (tab.isExternal) {
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      alert(`Opening ${tab.label}...\n\nThis will launch an external application.`);
                    }}
                    className='flex items-center px-4 py-3 mx-2 rounded-lg transition-colors text-gray-700 hover:bg-gray-50 w-full text-left'>
                    <Icon className='w-6 h-6 flex-shrink-0 text-gray-600' />
                    {!isCollapsed && (
                      <>
                        <span className='ml-3 font-medium text-sm'>
                          {tab.label}
                        </span>
                        <ArrowTopRightOnSquareIcon className='w-4 h-4 ml-auto text-gray-400' />
                      </>
                    )}
                  </button>
                );
              }

              return (
                <Link
                  key={tab.id}
                  to={buildLink(tab.path)}
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
          to={buildLink('/profile')}
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
