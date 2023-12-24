import {
  AtSymbolIcon,
  UserIcon,
  ArchiveBoxXMarkIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import type { User } from '@/app/lib/definitions';
import { deleteUser } from '@/app/lib/actions';
import { signOut } from '@/auth';

export default function UserForm({ user }: { user: User }) {

  const handleDeleteUser = async () => {
    "use server";
    try {
      await deleteUser(user?.email);
      await signOut();
    } catch (error) {
      alert('Error deleting user: ' + error);
    }
  };

  return (
    <>
      <form action={handleDeleteUser} className="max-w-[700px]">
        <div>
          <label
            htmlFor="name"
            className="mb-3 mt-5 block text-xs font-medium text-gray-900"
          >
            Name
          </label>
          <div className="relative">
            <input
              className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm font-bold outline-2 placeholder:text-gray-500"
              id="name"
              type="text"
              name="name"
              placeholder="Enter your name"
              required
              disabled
              aria-labelledby="name-error"
              value={user?.name}
            />
            <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
        </div>
        <div>
          <label
            htmlFor="email"
            className="mb-3 mt-5 block text-xs font-medium text-gray-900"
          >
            Email
          </label>
          <div className="relative">
            <input
              className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm font-bold outline-2 placeholder:text-gray-500"
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email address"
              required
              disabled
              aria-labelledby="email-error"
              value={user?.email}
            />
            <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
        </div>
        <Button className="mt-10 bg-red-500">
          Delete my Account
          <ArchiveBoxXMarkIcon className="ml-2 w-5 md:w-6" />
        </Button>
      </form>
    </>
  );
}
