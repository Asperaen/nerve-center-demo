import ActionTracker from '../components/ActionTracker';

export default function ActionTrackerPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 relative'>
      <div className='p-8 max-w-[1920px] mx-auto'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Action Tracker
          </h1>
          <p className='text-gray-600'>
            Manage and track your team's actions and initiatives
          </p>
        </div>
        <ActionTracker />
      </div>
    </div>
  );
}
