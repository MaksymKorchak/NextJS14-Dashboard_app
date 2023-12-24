import { GlobeAltIcon } from '@heroicons/react/24/outline';

export default function AcmeLogo() {
  return (
    <div className="flex cursor-pointer flex-row items-center font-lusitana leading-none text-white hover:opacity-95">
      <GlobeAltIcon className="h-12 w-12 min-w-[48px] rotate-[15deg]" />
      <p className="text-3xl font-bold">Acme</p>
    </div>
  );
}
