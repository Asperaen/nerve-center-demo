import { InformationCircleIcon } from '@heroicons/react/24/outline';

export default function GlobalBanner() {
  return (
    <div className="bg-primary-50 border-b border-primary-200 px-6 py-3">
      <div className="flex items-center justify-center gap-2 text-primary-800">
        <InformationCircleIcon className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm font-medium">
          Illustrative data for demonstration purposes only
        </span>
      </div>
    </div>
  );
}
