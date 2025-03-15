"use client";
<document_content>import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '../common/Button';

export default function PasswordResetForm() {
const router = useRouter();
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState('');
const [success, setSuccess] = useState('');
const [email, setEmail] = useState('');
const handleSubmit = async (e) => {
e.preventDefault();
setIsLoading(true);
setError('');
setSuccess('');
Copytry {
  // In a real app, this would call your password reset API
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
  
  setSuccess(`Password reset instructions have been sent to ${email}. Please check your inbox.`);
  setEmail('');
} catch (err) {
  setError('Failed to send password reset email. Please try again.');
} finally {
  setIsLoading(false);
}
};
return (
<div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
<div className="text-center">
<h1 className="text-2xl font-bold">Reset Your Password</h1>
<p className="mt-2 text-gray-600">
Enter your email address and we'll send you a link to reset your password
</p>
</div>
Copy  {error && (
    <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
      {error}
    </div>
  )}
  
  {success && (
    <div className="p-3 text-sm text-green-500 bg-green-50 rounded-md">
      {success}
    </div>
  )}
  
  <form onSubmit={handleSubmit} className="mt-8 space-y-6">
    <div>
      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="you@example.com"
      />
    </div>
    
    <div>
      <Button
        type="submit"
        isLoading={isLoading}
        fullWidth
        primary
      >
        Send Reset Link
      </Button>
    </div>
    
    <div className="text-center">
      <span className="text-sm text-gray-600">
        Remember your password?{' '}
        <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
          Sign in
        </Link>
      </span>
    </div>
  </form>
</div>
);
}
</document_content>
