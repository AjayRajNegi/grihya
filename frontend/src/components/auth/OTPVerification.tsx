import React, { useEffect, useState, useRef } from 'react';
import { AlertCircleIcon } from 'lucide-react';
interface OTPVerificationProps {
  phoneNumber: string;
  onVerify: (otp: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}
const OTPVerification: React.FC<OTPVerificationProps> = ({
  phoneNumber,
  onVerify,
  onCancel,
  isLoading
}) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const [timeLeft, setTimeLeft] = useState(30);
  useEffect(() => {
    // Focus first input on mount
    if (inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
    // Countdown timer
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    // Only allow one digit
    if (value && !/^\d$/.test(value)) {
      return;
    }
    // Update OTP array
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Clear error
    if (error) {
      setError('');
    }
    // Auto-focus next input
    if (value && index < 3 && inputRefs[index + 1].current) {
      inputRefs[index + 1].current?.focus();
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Move to previous input on backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs[index - 1].current) {
      inputRefs[index - 1].current?.focus();
    }
  };
  const handleResendOTP = () => {
    // In a real app, we would resend the OTP
    setTimeLeft(30);
    setOtp(['', '', '', '']);
    if (inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  };
  const handleVerify = () => {
    // Validate OTP
    if (otp.some(digit => !digit)) {
      setError('Please enter a complete OTP');
      return;
    }
    onVerify(otp.join(''));
  };
  return <div className="text-center">
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Verify your mobile number
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        We've sent a verification code to {phoneNumber}
      </p>
      {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <div className="flex items-center">
            <AlertCircleIcon className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>}
      <div className="flex justify-center space-x-3 mb-6">
        {otp.map((digit, index) => <input key={index} ref={inputRefs[index]} type="text" maxLength={1} value={digit} onChange={e => handleChange(e, index)} onKeyDown={e => handleKeyDown(e, index)} className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />)}
      </div>
      <div className="mb-6">
        {timeLeft > 0 ? <p className="text-sm text-gray-600">
            Resend code in <span className="font-medium">{timeLeft}s</span>
          </p> : <button type="button" onClick={handleResendOTP} className="text-sm font-medium text-blue-600 hover:text-blue-500">
            Resend OTP
          </button>}
      </div>
      <div className="flex space-x-3">
        <button type="button" onClick={onCancel} className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Cancel
        </button>
        <button type="button" onClick={handleVerify} disabled={isLoading} className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white text-[#2AB09C] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
          {isLoading ? 'Verifying...' : 'Verify'}
        </button>
      </div>
    </div>;
};
export default OTPVerification;