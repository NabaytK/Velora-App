import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../common/Button';

export default function VerificationForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  
  // Timer countdown effect
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft]);
  
  // Format time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };
  
  const handleChange = (e, index) => {
    const value = e.target.value;
    
    // Only allow one digit
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Auto-focus next input
    if (value !== '' && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };
  
  const handleKeyDown = (e, index) => {
    // On backspace, clear current field and focus previous field
    if (e.key === 'Backspace' && index > 0 && code[index] === '') {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        
        // Update the code array
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Combine code digits
    const verificationCode = code.join('');
    
    // Validate the code is complete
    if (verificationCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      setIsLoading(false);
      return;
    }
    
    try {
      // In a real app, this would call your verification API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Check if the code is correct (example: 123456)
      if (verificationCode === '123456') {
        // Mock successful verification
        localStorage.setItem('isVerified', 'true');
        router.push('/dashboard');
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResendCode = async () => {
    setIsLoading(true);
    
    try {
      // In a real app, this would call your resend code API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Reset timer
      setTimeLeft(180);
      
      // Show success message (in a real app)
      alert('Verification code has been resent to your email');
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Verify Your Account</h1>
        <p className="mt-2 text-gray-600">
          We've sent a 6-digit verification code to your email
        </p>
      </div>
      
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="flex justify-center space-x-2">
          {code.map((digit, index) => (
            <input
              key={index}
              id={`code-${index}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          ))}
        </div>
        
        <div className="text-center">
          <div className="text-sm text-gray-500">
            {timeLeft > 0 ? (
              <p>Resend code in {formatTime(timeLeft)}</p>
            ) : (
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isLoading}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Resend verification code
              </button>
            )}
          </div>
        </div>
        
        <div>
          <Button
            type="submit"
            isLoading={isLoading}
            fullWidth
            primary
          >
            Verify Account
          </Button>
        </div>
      </form>
    </div>
  );
}
