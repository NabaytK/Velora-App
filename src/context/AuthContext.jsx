'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Create the AuthContext
const AuthContext = createContext(null);

// AuthProvider component
export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on initial load
  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = typeof window !== 'undefined' 
      ? localStorage.getItem('veloraUser') 
      : null;
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        // Clear invalid stored user
        localStorage.removeItem('veloraUser');
      }
    }
  }, []);

  // Signup method
  const signup = (userData) => {
    // Store user data in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('veloraUser', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      router.push('/dashboard');
    }
  };

  // Login method
  const login = (userData) => {
    // Store user data in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('veloraUser', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      router.push('/dashboard');
    }
  };

  // Logout method
  const logout = () => {
    // Remove user data from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('veloraUser');
      setUser(null);
      setIsAuthenticated(false);
      router.push('/');
    }
  };

  // Value to be passed to context consumers
  const value = {
    user,
    isAuthenticated,
    signup,
    login,
    logout
  };

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