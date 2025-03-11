import { useState } from 'react';
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
    
    try {
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
      
      {error && (
