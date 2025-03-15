import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';

export default async function DashboardLayout({ children }) {
  // Use async to properly await cookie retrieval
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token');

  // If no token, redirect to login
  if (!token) {
    redirect('/auth/login');
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">{children}</div>
    </div>
  );
}