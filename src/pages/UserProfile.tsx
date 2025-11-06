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
    <div className='min-h-screen bg-gray-50'>
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
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
          <div className='bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-12'>
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
          <div className='p-8'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Email */}
              <div className='flex items-start'>
                <EnvelopeIcon className='w-6 h-6 text-gray-400 mt-1 mr-4' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>Email</p>
                  <p className='text-gray-900 mt-1'>ceo@nerve.com</p>
                </div>
              </div>

              {/* Role */}
              <div className='flex items-start'>
                <BriefcaseIcon className='w-6 h-6 text-gray-400 mt-1 mr-4' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>Role</p>
                  <p className='text-gray-900 mt-1'>Chief Executive Officer</p>
                </div>
              </div>

              {/* Member Since */}
              <div className='flex items-start'>
                <CalendarIcon className='w-6 h-6 text-gray-400 mt-1 mr-4' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    Member Since
                  </p>
                  <p className='text-gray-900 mt-1'>January 2024</p>
                </div>
              </div>

              {/* Notifications */}
              <div className='flex items-start'>
                <BellIcon className='w-6 h-6 text-gray-400 mt-1 mr-4' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    Notifications
                  </p>
                  <div className='mt-1'>
                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'>
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className='mt-8 pt-8 border-t border-gray-200'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Quick Actions
              </h3>
              <div className='flex flex-wrap gap-4'>
                <button className='px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors'>
                  Edit Profile
                </button>
                <button className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'>
                  Notification Settings
                </button>
                <button className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'>
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
