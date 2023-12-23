import { Metadata } from 'next';
import Table from '@/app/ui/customers/table';
import { Suspense } from 'react';
import { CustomersTableSkeleton } from '@/app/ui/skeletons';
import Search from '@/app/ui/search';

export const metadata: Metadata = {
  title: 'Customers',
};

export default function Customers ({ searchParams } : {
    searchParams?: {
        query?: string;
    }
}) {
    const query = searchParams?.query || '';
    return (
        <main>
            <div className="w-full">
                <h1 className="text-2xl font-lusitana font-bold">Customers</h1>
                <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                    <Search placeholder="Search invoices..." />
                </div>
                <Suspense fallback={<CustomersTableSkeleton/>}>
                    <Table query={query}/>
                </Suspense>
            </div>
        </main>
    )
};