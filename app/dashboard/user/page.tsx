import { cookies } from 'next/headers';
import { getUser } from '@/app/lib/data';
import UserForm from '@/app/ui/invoices/user-form';

export default async function UserPage() {
  const cookieStore = cookies();
  const userEmail = cookieStore.get('email');
  const user = await getUser(userEmail?.value || '');

  return (
    <main>
      <div className="w-full">
        <h1 className="font-lusitana text-2xl font-bold">User</h1>
        <UserForm user={user} />
      </div>
    </main>
  );
}
