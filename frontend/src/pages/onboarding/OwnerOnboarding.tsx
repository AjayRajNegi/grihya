import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
const OwnerOnboarding = () => {
  const navigate = useNavigate();
  const handleStartKYC = () => {
    navigate('/onboarding/kyc');
  };
  const handleSkip = () => {
    navigate('/');
  };
  return <OnboardingLayout>
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-6">
            <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1673&q=80" alt="Property Owner" className="w-32 h-32 object-cover rounded-full mx-auto mb-4 border-4 border-white shadow-lg" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Welcome, Property Owner!
          </h1>
          <p className="text-gray-600 mb-8 max-w-md">
            To start listing your properties on RealEstateHub, we need to verify
            your identity through our simple KYC process.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-left max-w-md mb-8">
            <h3 className="text-blue-800 font-medium mb-1">
              Why complete KYC?
            </h3>
            <ul className="text-blue-700 text-sm list-disc list-inside space-y-1">
              <li>Build trust with potential buyers/renters</li>
              <li>Get a verified badge on your listings</li>
              <li>Faster approval process for your properties</li>
              <li>Receive payments directly to your verified account</li>
            </ul>
          </div>
          <div className="flex flex-col space-y-4 w-full max-w-xs">
            <button onClick={handleStartKYC} className="flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white text-[#2AB09C] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Start KYC Process
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </button>
            <button onClick={handleSkip} className="text-sm font-medium text-gray-500 hover:text-gray-700">
              Skip for now (Limited access)
            </button>
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="max-w-md mx-auto">
            <h3 className="font-medium text-gray-900 mb-2">
              What you'll need:
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center">
                <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                ID Proof (Aadhaar Card, Driving License, Passport)
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                PAN Card details
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                A selfie for face verification
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Bank account details (optional)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </OnboardingLayout>;
};
export default OwnerOnboarding;