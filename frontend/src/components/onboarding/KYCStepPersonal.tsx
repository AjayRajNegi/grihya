import React, { useState } from 'react';
import { AlertCircleIcon, CalendarIcon } from 'lucide-react';
interface KYCStepPersonalProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
}
const KYCStepPersonal: React.FC<KYCStepPersonalProps> = ({
  formData,
  updateFormData,
  onNext
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {
      name,
      value
    } = e.target;
    updateFormData({
      [name]: value
    });
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      // Check if user is at least 18 years old
      const dobDate = new Date(formData.dob);
      const today = new Date();
      const ageDiff = today.getFullYear() - dobDate.getFullYear();
      const monthDiff = today.getMonth() - dobDate.getMonth();
      if (ageDiff < 18 || ageDiff === 18 && monthDiff < 0) {
        newErrors.dob = 'You must be at least 18 years old';
      }
    }
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    if (!formData.panNumber) {
      newErrors.panNumber = 'PAN number is required';
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
      newErrors.panNumber = 'Invalid PAN number format';
    }
    if (!formData.aadhaarNumber) {
      newErrors.aadhaarNumber = 'Aadhaar number is required';
    } else if (!/^\d{12}$/.test(formData.aadhaarNumber)) {
      newErrors.aadhaarNumber = 'Aadhaar number must be 12 digits';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
    }
  };
  return <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Personal Details
      </h2>
      {errors.general && <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <div className="flex items-center">
            <AlertCircleIcon className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700 text-sm">{errors.general}</p>
          </div>
        </div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth*
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input id="dob" name="dob" type="date" value={formData.dob} onChange={handleChange} max={new Date().toISOString().split('T')[0]} className={`pl-10 w-full px-3 py-2 border ${errors.dob ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`} />
          </div>
          {errors.dob && <p className="mt-1 text-sm text-red-600">{errors.dob}</p>}
        </div>
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
            Gender*
          </label>
          <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className={`w-full px-3 py-2 border ${errors.gender ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
          {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
        </div>
        <div>
          <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700 mb-1">
            PAN Number*
          </label>
          <input id="panNumber" name="panNumber" type="text" value={formData.panNumber} onChange={handleChange} placeholder="ABCDE1234F" className={`w-full px-3 py-2 border ${errors.panNumber ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase`} />
          {errors.panNumber && <p className="mt-1 text-sm text-red-600">{errors.panNumber}</p>}
          <p className="mt-1 text-xs text-gray-500">
            Format: ABCDE1234F (5 letters, 4 numbers, 1 letter)
          </p>
        </div>
        <div>
          <label htmlFor="aadhaarNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Aadhaar Number*
          </label>
          <input id="aadhaarNumber" name="aadhaarNumber" type="text" value={formData.aadhaarNumber} onChange={handleChange} placeholder="123456789012" className={`w-full px-3 py-2 border ${errors.aadhaarNumber ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`} maxLength={12} />
          {errors.aadhaarNumber && <p className="mt-1 text-sm text-red-600">{errors.aadhaarNumber}</p>}
          <p className="mt-1 text-xs text-gray-500">
            Enter your 12-digit Aadhaar number without spaces
          </p>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white text-[#2AB09C] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Next
          </button>
        </div>
      </form>
    </div>;
};
export default KYCStepPersonal;