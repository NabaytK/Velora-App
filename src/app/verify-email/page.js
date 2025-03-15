'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyEmail() {
  const [status, setStatus] = useState('Verifying...');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('Invalid verification link');
        return;
      }

      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('Email verified successfully!');
          // Redirect to login after 2 seconds
          setTimeout(() => {
            router.push('/auth/login');
          }, 2000);
        } else {
          setStatus(data.message || 'Verification failed');
        }
      } catch (error) {
        setStatus('An error occurred during verification');
        console.error(error);
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  );
}
