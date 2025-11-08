import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserIcon, MailIcon, LockIcon, PhoneIcon, AlertCircleIcon } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import SocialLoginButtons from '../../components/auth/SocialLoginButtons';
import OTPVerification from '../../components/auth/OTPVerification';
const Signup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    role: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const {
    signup
  } = useAuth();
  const navigate = useNavigate();
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must be 10 digits';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value,
      type,
      checked
    } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  const handleRoleChange = (role: string) => {
    setFormData({
      ...formData,
      role
    });
    if (errors.role) {
      setErrors({
        ...errors,
        role: ''
      });
    }
  };
  const handleSendOTP = () => {
    // In a real app, we would send an OTP to the mobile number
    if (!formData.mobile.trim() || !/^\d{10}$/.test(formData.mobile)) {
      setErrors({
        ...errors,
        mobile: 'Please enter a valid 10-digit mobile number'
      });
      return;
    }
    setShowOTPVerification(true);
  };
  const handleVerifyOTP = (otp: string) => {
    // In a real app, we would verify the OTP
    setIsLoading(true);
    // Simulate verification
    setTimeout(() => {
      setShowOTPVerification(false);
      setStep(2);
      setIsLoading(false);
    }, 1000);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await signup(formData.fullName, formData.email, formData.password, formData.role);
      // Redirect based on role
      if (formData.role === 'owner') {
        navigate('/onboarding/owner');
      } else {
        navigate('/onboarding/buyer');
      }
    } catch (err) {
      setErrors({
        ...errors,
        general: 'Failed to create account. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  return <AuthLayout title="Create an Account" subtitle="Join RealEstateHub to find your perfect property or list your real estate">
      {errors.general && <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <div className="flex items-center">
            <AlertCircleIcon className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700 text-sm">{errors.general}</p>
          </div>
        </div>}
      {showOTPVerification ? <OTPVerification phoneNumber={formData.mobile} onVerify={handleVerifyOTP} onCancel={() => setShowOTPVerification(false)} isLoading={isLoading} /> : <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 ? <>
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input id="fullName" name="fullName" type="text" value={formData.fullName} onChange={handleChange} className={`pl-10 w-full px-3 py-2 border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`} placeholder="Enter your full name" />
                </div>
                {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
              </div>
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>
                <div className="flex">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input id="mobile" name="mobile" type="text" value={formData.mobile} onChange={handleChange} className={`pl-10 w-full px-3 py-2 border ${errors.mobile ? 'border-red-500' : 'border-gray-300'} rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`} placeholder="10-digit mobile number" />
                  </div>
                  <button type="button" onClick={handleSendOTP} className="text-[#2AB09C] text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    Get OTP
                  </button>
                </div>
                {errors.mobile && <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MailIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className={`pl-10 w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`} placeholder="Enter your email" />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} className={`pl-10 w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`} placeholder="Create a password" />
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} className={`pl-10 w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`} placeholder="Confirm your password" />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>}
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => {
            if (formData.fullName && formData.email && formData.mobile && formData.password && formData.confirmPassword) {
              setStep(2);
            } else {
              validateForm();
            }
          }} className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white text-[#2AB09C] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Next
                </button>
              </div>
            </> : <>
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-3">
                  I am a:
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => handleRoleChange('buyer')} className={`flex flex-col items-center justify-center p-4 border rounded-lg ${formData.role === 'buyer' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="font-medium">Buyer/Renter</span>
                    <span className="text-xs text-gray-500 mt-1">
                      Looking for property
                    </span>
                  </button>
                  <button type="button" onClick={() => handleRoleChange('owner')} className={`flex flex-col items-center justify-center p-4 border rounded-lg ${formData.role === 'owner' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="font-medium">Property Owner</span>
                    <span className="text-xs text-gray-500 mt-1">
                      Want to list property
                    </span>
                  </button>
                </div>
                {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
              </div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input id="agreeToTerms" name="agreeToTerms" type="checkbox" checked={formData.agreeToTerms} onChange={handleChange} className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${errors.agreeToTerms ? 'border-red-500' : ''}`} />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="agreeToTerms" className="font-medium text-gray-700">
                    I agree to the{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-500">
                      Terms and Conditions
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-500">
                      Privacy Policy
                    </a>
                  </label>
                </div>
              </div>
              {errors.agreeToTerms && <p className="mt-1 text-sm text-red-600">
                  {errors.agreeToTerms}
                </p>}
              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(1)} className="flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Back
                </button>
                <button type="submit" disabled={isLoading} className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white text-[#2AB09C] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </>}
        </form>}
      {step === 1 && !showOTPVerification && <>
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>
            <SocialLoginButtons />
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                Login
              </Link>
            </p>
          </div>
        </>}
    </AuthLayout>;
};
export default Signup;