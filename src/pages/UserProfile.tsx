import { useNavigate } from 'react-router-dom';
import {
  UserCircleIcon,
  BellIcon,
  ArrowLeftIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

export default function UserProfile() {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50'>
      <div className='max-w-4xl mx-auto px-8 py-8'>
        {/* Header with Back Button */}
        <div className='mb-8'>
          <button
            onClick={() => navigate(-1)}
            className='inline-flex items-center text-gray-600 hover:text-gray-900 mb-4'>
            <ArrowLeftIcon className='w-5 h-5 mr-2' />
            Back
          </button>
        </div>

        {/* Profile Card */}
        <div className='bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden'>
          <div className='bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 px-8 py-16'>
            <div className='flex items-center'>
              <div className='w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg'>
                <UserCircleIcon className='w-20 h-20 text-primary-600' />
              </div>
              <div className='ml-6 text-white'>
                <h2 className='text-2xl font-bold'>CEO</h2>
                <p className='text-primary-100 mt-1'>Executive</p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className='p-10'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
              {/* Email */}
              <div className='flex items-start p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200'>
                <div className='p-2 bg-primary-100 rounded-lg mr-4'>
                  <EnvelopeIcon className='w-6 h-6 text-primary-600' />
                </div>
                <div>
                  <p className='text-sm font-semibold text-gray-500 uppercase tracking-wide'>
                    Email
                  </p>
                  <p className='text-gray-900 mt-2 font-medium'>
                    ceo@nerve.com
                  </p>
                </div>
              </div>

              {/* Role */}
              <div className='flex items-start p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200'>
                <div className='p-2 bg-primary-100 rounded-lg mr-4'>
                  <BriefcaseIcon className='w-6 h-6 text-primary-600' />
                </div>
                <div>
                  <p className='text-sm font-semibold text-gray-500 uppercase tracking-wide'>
                    Role
                  </p>
                  <p className='text-gray-900 mt-2 font-medium'>
                    Chief Executive Officer
                  </p>
                </div>
              </div>

              {/* Member Since */}
              <div className='flex items-start p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200'>
                <div className='p-2 bg-primary-100 rounded-lg mr-4'>
                  <CalendarIcon className='w-6 h-6 text-primary-600' />
                </div>
                <div>
                  <p className='text-sm font-semibold text-gray-500 uppercase tracking-wide'>
                    Member Since
                  </p>
                  <p className='text-gray-900 mt-2 font-medium'>January 2024</p>
                </div>
              </div>

              {/* Notifications */}
              <div className='flex items-start p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200'>
                <div className='p-2 bg-primary-100 rounded-lg mr-4'>
                  <BellIcon className='w-6 h-6 text-primary-600' />
                </div>
                <div>
                  <p className='text-sm font-semibold text-gray-500 uppercase tracking-wide'>
                    Notifications
                  </p>
                  <div className='mt-2'>
                    <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300'>
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className='mt-10 pt-10 border-t border-gray-200'>
              <h3 className='text-xl font-bold text-gray-900 mb-6'>
                Quick Actions
              </h3>
              <div className='flex flex-wrap gap-4'>
                <button className='px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold transform hover:scale-105'>
                  Edit Profile
                </button>
                <button className='px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 transition-all duration-200 font-semibold shadow-sm hover:shadow-md'>
                  Notification Settings
                </button>
                <button className='px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 transition-all duration-200 font-semibold shadow-sm hover:shadow-md'>
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
