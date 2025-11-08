import React from 'react';
import { CheckIcon } from 'lucide-react';
interface Step {
  number: number;
  title: string;
}
interface ProgressBarProps {
  steps: Step[];
  currentStep: number;
}
const ProgressBar: React.FC<ProgressBarProps> = ({
  steps,
  currentStep
}) => {
  return <nav aria-label="Progress">
      <ol className="space-y-4 md:flex md:space-y-0 md:space-x-8">
        {steps.map(step => <li key={step.number} className="md:flex-1">
            <div className="flex items-center">
              {step.number < currentStep ? <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center border-2 border-blue-600 rounded-full text-[#2AB09C]">
                  <CheckIcon className="w-5 h-5 text-white" />
                </div> : step.number === currentStep ? <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center border-2 border-blue-600 rounded-full">
                  <span className="text-blue-600 font-medium">
                    {step.number}
                  </span>
                </div> : <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center border-2 border-gray-300 rounded-full">
                  <span className="text-gray-500">{step.number}</span>
                </div>}
              <div className="ml-4 md:w-full">
                <p className={`text-sm font-medium ${step.number <= currentStep ? 'text-blue-600' : 'text-gray-500'}`}>
                  {step.title}
                </p>
              </div>
            </div>
            {step.number !== steps.length && <div className="hidden md:block w-full h-0.5 mt-3 bg-gray-200">
                {step.number < currentStep && <div className="h-0.5 text-[#2AB09C]" style={{
            width: '100%'
          }}></div>}
              </div>}
          </li>)}
      </ol>
    </nav>;
};
export default ProgressBar;