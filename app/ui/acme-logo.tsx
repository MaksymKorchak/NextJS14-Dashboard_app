import { GlobeAltIcon } from '@heroicons/react/24/outline';

export default function AcmeLogo() {
  return (
    <div className="font-lusitana flex flex-row items-center leading-none text-white hover:opacity-95 cursor-pointer">
      <GlobeAltIcon className="h-12 w-12 min-w-[48px] rotate-[15deg]" />
      <p className="text-3xl font-bold">Acme</p>
    </div>
  );
}
