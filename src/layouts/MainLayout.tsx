import { Outlet, NavLink } from 'react-router-dom';
import {
  HomeIcon,
  NewspaperIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BeakerIcon,
  BellIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  // { name: 'Dashboard', href: '/dashboard', icon: HomeIcon }, // Hidden for now
  { name: 'Market Pulse', href: '/market-pulse', icon: NewspaperIcon },
  {
    name: 'Business Assumptions',
    href: '/assumptions',
    icon: DocumentTextIcon,
  },
  { name: 'Financial Forecast', href: '/forecast', icon: ChartBarIcon },
  { name: 'Scenario Simulation', href: '/scenarios', icon: BeakerIcon },
];

export default function MainLayout() {
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Sidebar */}
      <div className='fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200'>
        <div className='flex flex-col h-full'>
          {/* Logo */}
          <div className='flex items-center h-16 px-6 border-b border-gray-200'>
            <div className='flex items-center'>
              <div className='w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center'>
                <span className='text-white font-bold text-lg'>N</span>
              </div>
              <span className='ml-3 text-xl font-semibold text-gray-900'>
                NERVE
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className='flex-1 px-3 py-4 space-y-1 overflow-y-auto'>
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }>
                <item.icon className='w-5 h-5 mr-3' />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* User Profile */}
          <div className='border-t border-gray-200 p-4'>
            <div className='flex items-center'>
              <UserCircleIcon className='w-10 h-10 text-gray-400' />
              <div className='ml-3'>
                <p className='text-sm font-medium text-gray-900'>CEO</p>
                <p className='text-xs text-gray-500'>Executive</p>
              </div>
              <div className='ml-auto'>
                <button className='relative p-1'>
                  <BellIcon className='w-5 h-5 text-gray-400' />
                  <span className='absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full'></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className='pl-64'>
        <main className='min-h-screen'>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
