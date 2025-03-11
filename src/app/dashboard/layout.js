import Sidebar from '@/components/dashboard/Sidebar';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default function DashboardLayout({ children }) {
  // In a real app, you'd verify the authentication token here
  // This is a simplified example
  const cookieStore = cookies();
  const isAuthenticated = cookieStore.get('auth_token');
  
  if (!isAuthenticated) {
    redirect('/auth/login');
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">{children}</div>
    </div>
  );
}
