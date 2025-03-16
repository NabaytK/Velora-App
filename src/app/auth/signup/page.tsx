import SignupForm from '@/components/auth/SignupForm';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="flex flex-col justify-center min-h-screen py-12 bg-gray-50 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/">
          <div className="flex items-center justify-center">
            <svg className="w-10 h-10 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <span className="ml-2 text-2xl font-bold text-indigo-600">Velora</span>
          </div>
        </Link>
        
        <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
          Create a new account
        </h2>
        
        <p className="mt-2 text-sm text-center text-gray-600">
          Or{' '}
          <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <SignupForm />
      </div>
    </div>
  );
}
