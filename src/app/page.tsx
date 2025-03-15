'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/auth/signup');
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center">
          <svg className="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          <span className="ml-2 text-xl font-bold text-indigo-600">Velora</span>
        </div>
        <div className="space-x-4">
          <button 
            onClick={handleLogin}
            className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-md"
          >
            Login
          </button>
          <button 
            onClick={handleGetStarted}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Sign Up
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">
          AI-Powered <span className="text-indigo-600">Stock Predictions</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Get accurate predictions for stocks, ETFs, and cryptocurrencies using our advanced AI models trained on market data, news sentiment, and economic indicators.
        </p>

        <div className="flex justify-center space-x-4">
          <button 
            onClick={handleGetStarted}
            className="px-8 py-3 bg-indigo-600 text-white text-lg rounded-md hover:bg-indigo-700 transition"
          >
            Get Started
          </button>
          <button 
            onClick={handleLogin}
            className="px-8 py-3 border border-indigo-600 text-indigo-600 text-lg rounded-md hover:bg-indigo-50 transition"
          >
            Login
          </button>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered Predictions</h3>
            <p className="text-gray-600">
              Leverage advanced machine learning models for accurate stock predictions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Sentiment Analysis</h3>
            <p className="text-gray-600">
              Understand market sentiment from news and social media insights.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Portfolio Management</h3>
            <p className="text-gray-600">
              Track investments and get AI-powered portfolio optimization tips.
            </p>
          </div>
        </div>

        <div className="mt-16 bg-indigo-700 text-white py-16 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Join Thousands of Successful Investors</h2>
          <p className="text-xl mb-8">Start making data-driven investment decisions today</p>
          <button 
            onClick={handleGetStarted}
            className="px-10 py-3 bg-white text-indigo-700 rounded-md hover:bg-indigo-50 transition text-lg font-semibold"
          >
            Sign Up for Free
          </button>
        </div>
      </main>

      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2025 Velora. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}