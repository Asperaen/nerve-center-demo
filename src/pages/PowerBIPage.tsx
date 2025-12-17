import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import CreateActionModal from '../components/CreateActionModal';

export default function PowerBIPage() {
  const [isCreateActionModalOpen, setIsCreateActionModalOpen] = useState(false);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50'>
      <div className='p-8 max-w-[1920px] mx-auto'>
        {/* Header with Create Action Button */}
        <div className='mb-6'>
          <div className='flex items-center justify-between'>
            <div className='flex flex-col'>
              <h1 className='text-3xl font-bold text-gray-900 mb-1'>Power BI</h1>
              <p className='text-gray-600'>
                Financial Review Overview Dashboard
              </p>
            </div>
            <button
              onClick={() => setIsCreateActionModalOpen(true)}
              className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors'>
              <PlusIcon className='w-5 h-5' />
              Create Action
            </button>
          </div>
        </div>

        {/* Power BI iframe */}
        <div className='h-[calc(100vh-200px)] w-full'>
          <iframe
            title='Financial Review Overview_v2_20250805'
            width='100%'
            height='100%'
            src='https://app.powerbi.com/reportEmbed?reportId=4e443fcc-1256-4c32-9529-c53f02e8c6f8&appId=cc44d343-85f8-4457-8d33-3eb6e73eeba6&autoAuth=true&ctid=cc8936bc-9382-4fff-87cb-6f55999549e7'
            frameBorder='0'
            allowFullScreen={true}
            className='border-0 rounded-lg shadow-lg'
          />
        </div>
      </div>

      {/* Create Action Modal */}
      <CreateActionModal
        isOpen={isCreateActionModalOpen}
        onClose={() => setIsCreateActionModalOpen(false)}
      />
    </div>
  );
}

