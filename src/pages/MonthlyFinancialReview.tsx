export default function MonthlyFinancialReview() {
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200'>
        <div className='px-8 py-6'>
          <h1 className='text-3xl font-bold text-gray-900'>
            Monthly Financial Review
          </h1>
          <p className='mt-1 text-sm text-gray-500'>
            Review monthly financial performance and create reconcile
            initiatives to uplift profitability
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
                  d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
            </div>
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>
              Coming Soon
            </h2>
            <p className='text-gray-600'>
              This page will allow you to review monthly financial performance
              and easily create reconcile initiatives to uplift your P&L.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
