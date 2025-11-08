import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, ChevronRightIcon, ChevronLeftIcon } from 'lucide-react';
import OnboardingLayout from '../../components/onboarding/OnboardingLayout';
const BuyerOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const onboardingTips = [{
    title: 'Welcome to RealEstateHub',
    description: 'Your journey to finding the perfect property starts here. Let us show you around.',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1673&q=80'
  }, {
    title: 'Search & Filter Properties',
    description: 'Use our advanced search filters to find properties that match your exact requirements.',
    image: 'https://images.unsplash.com/photo-1560520031-3a4dc4e9de0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1673&q=80'
  }, {
    title: 'Save Your Favorites',
    description: 'Save properties you like and get updates when their prices change.',
    image: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1673&q=80'
  }, {
    title: 'Contact Property Owners',
    description: 'Directly connect with property owners without any intermediaries.',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1674&q=80'
  }];
  const handleSkip = () => {
    navigate('/');
  };
  const handleNext = () => {
    if (currentStep < onboardingTips.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/');
    }
  };
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  return <OnboardingLayout>
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col">
          <div className="relative w-full h-64 md:h-80 bg-gray-200 overflow-hidden">
            <img src={onboardingTips[currentStep].image} alt={onboardingTips[currentStep].title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
              <div className="p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">
                  {onboardingTips[currentStep].title}
                </h2>
                <p className="text-sm md:text-base">
                  {onboardingTips[currentStep].description}
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-6 space-x-2">
            {onboardingTips.map((_, index) => <button key={index} onClick={() => setCurrentStep(index)} className={`h-2 w-2 rounded-full ${index === currentStep ? 'text-[#2AB09C]' : 'bg-gray-300'}`} aria-label={`Go to slide ${index + 1}`} />)}
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 bg-white">
          <div className="flex justify-between">
            <button onClick={handlePrevious} className={`flex items-center text-sm font-medium ${currentStep === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:text-gray-900'}`} disabled={currentStep === 0}>
              <ChevronLeftIcon className="h-5 w-5 mr-1" />
              Previous
            </button>
            <button onClick={handleSkip} className="text-sm font-medium text-gray-500 hover:text-gray-700">
              Skip
            </button>
            <button onClick={handleNext} className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700">
              {currentStep === onboardingTips.length - 1 ? 'Finish' : 'Next'}
              <ChevronRightIcon className="h-5 w-5 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </OnboardingLayout>;
};
export default BuyerOnboarding;