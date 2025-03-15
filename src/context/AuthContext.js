'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Create the AuthContext
const AuthContext = createContext(null);

// AuthProvider component
export function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on initial load
  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check if user is stored in localStorage
        const storedUser = localStorage.getItem('veloraUser');
        
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
          
          // Redirect to dashboard if on login/signup page and authenticated
          if (['/auth/login', '/auth/signup'].includes(pathname)) {
            router.push('/dashboard');
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
          
          // Redirect to login if trying to access protected routes
          if (pathname === '/dashboard') {
            router.push('/auth/login');
          }
        }
      } catch (error) {
        // Clear invalid stored user
        localStorage.removeItem('veloraUser');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Run check immediately
    checkAuth();
  }, [pathname, router]);

  // Signup method
  const signup = (userData) => {
    localStorage.setItem('veloraUser', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    router.push('/dashboard');
  };

  // Login method
  const login = (userData) => {
    localStorage.setItem('veloraUser', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    router.push('/dashboard');
  };

  // Logout method
  const logout = () => {
    localStorage.removeItem('veloraUser');
    setUser(null);
    setIsAuthenticated(false);
    router.push('/auth/login');
  };

  // Value to be passed to context consumers
  const value = {
    user,
    isAuthenticated,
    isLoading,
    signup,
    login,
    logout
  };

  // Show loading state if still checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
