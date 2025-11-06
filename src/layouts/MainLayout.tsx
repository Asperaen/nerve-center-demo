import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLandingPage = location.pathname === '/';

  // Get page title based on route
  const getPageTitle = () => {
    if (location.pathname.startsWith('/daily-pulse-check')) {
      return 'Pulse';
    }
    if (location.pathname.startsWith('/weekly-forecast')) {
      return 'Review';
    }
    if (location.pathname === '/profile') {
      return 'User Profile';
    }
    return '';
  };

  const pageTitle = getPageTitle();

  // Get tabs for Daily Pulse Check
  const getDailyPulseTabs = () => {
    const basePath = '/daily-pulse-check';
    let currentTab = 'external';

    if (location.pathname.includes('/internal')) {
      currentTab = 'internal';
    } else if (location.pathname.includes('/actions')) {
      currentTab = 'actions';
    }

    return [
      {
        id: 'external',
        label: 'External Pulse',
        path: `${basePath}/external`,
        isActive: currentTab === 'external',
      },
      {
        id: 'internal',
        label: 'Internal Pulse',
        path: `${basePath}/internal`,
        isActive: currentTab === 'internal',
      },
      {
        id: 'actions',
        label: 'Action Tracking',
        path: `${basePath}/actions`,
        isActive: currentTab === 'actions',
      },
    ];
  };

  // Get tabs for Weekly Financial Forecast
  const getWeeklyForecastTabs = () => {
    const basePath = '/weekly-forecast';
    let currentTab = 'forecast';

    if (location.pathname.includes('/actions')) {
      currentTab = 'actions';
    }

    return [
      {
        id: 'forecast',
        label: 'Financial Performance Review',
        path: `${basePath}/forecast`,
        isActive: currentTab === 'forecast',
      },
      {
        id: 'actions',
        label: 'Action Tracker',
        path: `${basePath}/actions`,
        isActive: currentTab === 'actions',
      },
    ];
  };

  const getTabs = () => {
    if (location.pathname.startsWith('/daily-pulse-check')) {
      return getDailyPulseTabs();
    }
    if (location.pathname.startsWith('/weekly-forecast')) {
      return getWeeklyForecastTabs();
    }
    return [];
  };

  const tabs = getTabs();

  return (
    <div className='min-h-screen bg-gray-50 relative'>
      {/* Header Bar with N icon, page title, tabs, and profile - Only show on non-landing pages */}
      {!isLandingPage && (
        <header className='sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm'>
          <div className='max-w-full mx-auto px-8 py-4 relative'>
            <div className='flex items-center justify-between'>
              {/* Left: N icon and page title */}
              <div className='flex items-center gap-4'>
                <Link
                  to='/'
                  className='w-10 h-10 bg-primary-600 hover:bg-primary-700 rounded-lg flex items-center justify-center transition-all duration-200 group hover:scale-110'>
                  <span className='text-white font-bold text-xl'>N</span>
                </Link>
                <h1 className='text-xl font-bold text-gray-900'>{pageTitle}</h1>
              </div>

              {/* Center: Tabs Navigation - Absolutely centered */}
              {tabs.length > 0 && (
                <nav
                  className='absolute left-1/2 transform -translate-x-1/2 flex space-x-8 items-center'
                  aria-label='Tabs'>
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => navigate(tab.path)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        tab.isActive
                          ? 'border-primary-600 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              )}

              {/* Right: Profile icon */}
              <Link
                to='/profile'
                className='flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-all duration-200 group'>
                <div className='w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center group-hover:bg-primary-700 transition-colors'>
                  <span className='text-white font-semibold text-sm'>XC</span>
                </div>
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* Main content */}
      <main className='min-h-screen'>
        <Outlet />
      </main>
    </div>
  );
}
