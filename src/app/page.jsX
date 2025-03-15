"use client"

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not authenticated and not loading, redirect to login
    if (!isAuthenticated && !loading) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render the dashboard content
  // (useEffect will handle redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Welcome, {user?.name || 'User'}</span>
            <button
              onClick={logout}
              className="rounded-md bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="h-96 rounded-lg border-4 border-dashed border-gray-200 p-4 flex flex-col items-center justify-center">
              <h2 className="text-2xl font-semibold mb-4">Welcome to your Dashboard!</h2>
              <p className="text-gray-600 mb-6">Your account is successfully authenticated.</p>
              <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Your Profile Information</h3>
                <div className="space-y-2">
                  <p><span className="font-semibold">Name:</span> {user?.name || 'Not available'}</p>
                  <p><span className="font-semibold">Email:</span> {user?.email || 'Not available'}</p>
                  <p><span className="font-semibold">User ID:</span> {user?.id || 'Not available'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}