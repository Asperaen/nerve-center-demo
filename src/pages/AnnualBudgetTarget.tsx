export default function AnnualBudgetTarget() {
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200'>
        <div className='px-8 py-6'>
          <h1 className='text-3xl font-bold text-gray-900'>
            Annual Budget / Target
          </h1>
          <p className='mt-1 text-sm text-gray-500'>
            View and manage annual budget targets and actual performance
          </p>
        </div>
      </div>

      {/* Content */}
      <div className='p-8'>
        <div className='bg-white rounded-lg border border-gray-200 p-8 text-center'>
          <div className='max-w-md mx-auto'>
            <div className='w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg
                className='w-8 h-8 text-gray-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                />
              </svg>
            </div>
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>
              Coming Soon
            </h2>
            <p className='text-gray-600'>
              This page will display annual budget targets and allow you to
              compare them with actual performance settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
