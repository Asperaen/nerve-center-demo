import WaveExecutiveDashboard from '../components/WaveExecutiveDashboard';

export default function WaveExecutiveDashboardPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 relative'>
      <div className='p-8 max-w-[1920px] mx-auto'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Wave Executive Dashboard
          </h1>
          <p className='text-gray-600'>
            Review of top initiatives for each workflow and value delivery
            tracking
          </p>
        </div>
        <WaveExecutiveDashboard />
      </div>
    </div>
  );
}
