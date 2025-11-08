import React from 'react';
import { Link } from 'react-router-dom';
import { ClockIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
const KYCStatus = () => {
  // In a real app, we would fetch the KYC status from an API
  const kycStatus = 'pending'; // could be "pending", "approved", "rejected"
  const renderStatusContent = () => {
    switch (kycStatus) {
      case 'pending':
        return <>
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-yellow-100 mb-6">
              <ClockIcon className="h-12 w-12 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              KYC Under Review
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              We're reviewing your KYC documents. This usually takes 24-48
              hours. We'll notify you once the verification is complete.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 text-left max-w-md mx-auto mb-8">
              <h3 className="text-yellow-800 font-medium mb-1">What's next?</h3>
              <p className="text-yellow-700 text-sm">
                While we verify your details, you can explore the platform but
                with limited access. You'll be able to list properties once your
                KYC is approved.
              </p>
            </div>
          </>;
      case 'approved':
        return <>
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
              <CheckCircleIcon className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              KYC Approved!
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Your identity has been verified successfully. You now have full
              access to list and manage properties on RealEstateHub.
            </p>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 text-left max-w-md mx-auto mb-8">
              <h3 className="text-green-800 font-medium mb-1">What's next?</h3>
              <p className="text-green-700 text-sm">
                Start listing your properties and connect with potential buyers
                and renters. Your verified badge will help build trust with
                users.
              </p>
            </div>
          </>;
      case 'rejected':
        return <>
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 mb-6">
              <AlertCircleIcon className="h-12 w-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Unfortunately, we couldn't verify your identity with the provided
              documents. Please review the issues below and resubmit.
            </p>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-left max-w-md mx-auto mb-8">
              <h3 className="text-red-800 font-medium mb-1">Issues found:</h3>
              <ul className="text-red-700 text-sm list-disc list-inside">
                <li>The ID document provided is not clearly visible</li>
                <li>The selfie doesn't match with the ID document</li>
              </ul>
            </div>
          </>;
      default:
        return null;
    }
  };
  return <OnboardingLayout>
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          {renderStatusContent()}
          <div className="flex flex-col space-y-4 w-full max-w-xs">
            {kycStatus === 'rejected' && <Link to="/onboarding/kyc" className="flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white text-[#2AB09C] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Resubmit KYC
              </Link>}
            <Link to="/" className={`flex items-center justify-center py-3 px-4 border ${kycStatus === 'rejected' ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50' : 'border-transparent text-white text-[#2AB09C] hover:bg-blue-700'} rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}>
              {kycStatus === 'approved' ? 'Start Listing Properties' : 'Go to Dashboard'}
            </Link>
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="max-w-md mx-auto">
            <h3 className="font-medium text-gray-900 mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600">
              If you have any questions or need assistance with your KYC
              verification, please contact our support team at{' '}
              <a href="mailto:support@realestatehub.com" className="text-blue-600 hover:text-blue-500">
                support@realestatehub.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </OnboardingLayout>;
};
export default KYCStatus;