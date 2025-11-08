import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../../components/onboarding/ProgressBar';
import KYCStepPersonal from '../../components/onboarding/KYCStepPersonal';
import KYCStepAddress from '../../components/onboarding/KYCStepAddress';
import KYCStepBank from '../../components/onboarding/KYCStepBank';
import KYCStepReview from '../../components/onboarding/KYCStepReview';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
const KYCFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal details
    dob: '',
    gender: '',
    panNumber: '',
    aadhaarNumber: '',
    // Address proof
    addressProofType: '',
    addressProofDocument: null,
    selfieWithId: null,
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    useGPS: false,
    // Bank details
    bankName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    cancelledCheque: null
  });
  const navigate = useNavigate();
  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({
      ...prev,
      ...data
    }));
  };
  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };
  const handleSubmit = () => {
    // In a real app, we would submit the KYC data to an API
    navigate('/onboarding/kyc-status');
  };
  const steps = [{
    number: 1,
    title: 'Personal Details'
  }, {
    number: 2,
    title: 'Address Proof'
  }, {
    number: 3,
    title: 'Bank Details'
  }, {
    number: 4,
    title: 'Review'
  }];
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <KYCStepPersonal formData={formData} updateFormData={updateFormData} onNext={handleNext} />;
      case 2:
        return <KYCStepAddress formData={formData} updateFormData={updateFormData} onNext={handleNext} onPrevious={handlePrevious} />;
      case 3:
        return <KYCStepBank formData={formData} updateFormData={updateFormData} onNext={handleNext} onPrevious={handlePrevious} />;
      case 4:
        return <KYCStepReview formData={formData} onSubmit={handleSubmit} onPrevious={handlePrevious} />;
      default:
        return null;
    }
  };
  return <OnboardingLayout>
      <div className="max-w-3xl mx-auto w-full">
        <div className="p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            KYC Verification
          </h1>
          <p className="text-gray-600 mb-6">
            Complete your identity verification to start listing properties.
          </p>
          <ProgressBar steps={steps} currentStep={currentStep} />
          <div className="mt-8">{renderStepContent()}</div>
        </div>
      </div>
    </OnboardingLayout>;
};
export default KYCFlow;