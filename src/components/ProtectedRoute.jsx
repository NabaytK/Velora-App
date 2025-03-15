'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Check authentication status
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Render children only if authenticated
  return isAuthenticated ? children : null;
}
