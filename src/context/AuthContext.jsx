'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status on initial load
    const storedAuth = typeof window !== 'undefined' ? localStorage.getItem('isAuthenticated') : null;
    setIsAuthenticated(storedAuth === 'true');
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('isAuthenticated', 'true');
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAuthenticated');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
