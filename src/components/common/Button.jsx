"use client"

import React from 'react';
import { useRouter } from 'next/navigation';

export default function Button({ 
  children, 
  isLoading = false, 
  type = 'button', 
  fullWidth = false,
  primary = false,
  onClick,
  ...props 
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      className={`
        ${fullWidth ? 'w-full' : ''}
        ${primary ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}
        px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors
      `}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
}

// Specialized back button component
export function BackButton({ destination = '/dashboard', label = 'Back' }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(destination)}
      className="flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 bg-white border border-indigo-300 rounded hover:bg-indigo-50"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-4 h-4 mr-1" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M15 19l-7-7 7-7" 
        />
      </svg>
      {label}
    </button>
  );
}