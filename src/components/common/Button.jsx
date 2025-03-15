"use client"

import { useRouter } from 'next/navigation';

export default function BackButton({ destination = '/dashboard', label = 'Back' }) {
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