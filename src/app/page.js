import Link from 'next/link'

export default function Home() {
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
          <Link 
            href="/auth/login"
            className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-md"
          >
            Login
          </Link>
          <Link 
            href="/auth/signup"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">
          AI-Powered <span className="text-indigo-600">Stock Predictions</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Get accurate predictions for stocks, ETFs, and cryptocurrencies using our advanced AI models.
        </p>

        <div className="flex justify-center space-x-4">
          <Link 
            href="/auth/signup"
            className="px-8 py-3 bg-indigo-600 text-white text-lg rounded-md hover:bg-indigo-700 transition"
          >
            Get Started
          </Link>
          <Link 
            href="/auth/login"
            className="px-8 py-3 border border-indigo-600 text-indigo-600 text-lg rounded-md hover:bg-indigo-50 transition"
          >
            Login
          </Link>
        </div>
      </main>

      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2025 Velora. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
