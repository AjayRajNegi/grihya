import React, { useState } from 'react';
import { AlertCircleIcon, UploadIcon, InfoIcon } from 'lucide-react';
interface KYCStepBankProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}
const KYCStepBank: React.FC<KYCStepBankProps> = ({
  formData,
  updateFormData,
  onNext,
  onPrevious
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [chequeFile, setChequeFile] = useState<File | null>(null);
  const [skipBankDetails, setSkipBankDetails] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }
    const file = files[0];
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        cancelledCheque: 'File size should not exceed 5MB'
      }));
      return;
    }
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        cancelledCheque: 'Only JPEG, PNG, and PDF files are allowed'
      }));
      return;
    }
    setChequeFile(file);
    updateFormData({
      cancelledCheque: file
    });
    // Clear error
    if (errors.cancelledCheque) {
      setErrors(prev => ({
        ...prev,
        cancelledCheque: ''
      }));
    }
  };
  const validateForm = () => {
    // Skip validation if user chooses to skip bank details
    if (skipBankDetails) {
      return true;
    }
    const newErrors: Record<string, string> = {};
    if (!formData.bankName) {
      newErrors.bankName = 'Bank name is required';
    }
    if (!formData.accountNumber) {
      newErrors.accountNumber = 'Account number is required';
    }
    if (!formData.confirmAccountNumber) {
      newErrors.confirmAccountNumber = 'Please confirm your account number';
    } else if (formData.accountNumber !== formData.confirmAccountNumber) {
      newErrors.confirmAccountNumber = 'Account numbers do not match';
    }
    if (!formData.ifscCode) {
      newErrors.ifscCode = 'IFSC code is required';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
      newErrors.ifscCode = 'Invalid IFSC code format';
    }
    if (!formData.accountHolderName) {
      newErrors.accountHolderName = 'Account holder name is required';
    }
    if (!formData.cancelledCheque) {
      newErrors.cancelledCheque = 'Please upload a cancelled cheque or passbook photo';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (skipBankDetails || validateForm()) {
      onNext();
    }
  };
  const handleSkip = () => {
    setSkipBankDetails(true);
    // Clear all bank details
    updateFormData({
      bankName: '',
      accountNumber: '',
      confirmAccountNumber: '',
      ifscCode: '',
      accountHolderName: '',
      cancelledCheque: null
    });
    // Clear all errors
    setErrors({});
    // Move to next step
    onNext();
  };
  return <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">
          Bank Details (Optional)
        </h2>
        <button type="button" onClick={handleSkip} className="text-sm font-medium text-blue-600 hover:text-blue-500">
          Skip this step
        </button>
      </div>
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <InfoIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Adding your bank details will help you receive payments directly
              when you list properties for rent or sale.
            </p>
          </div>
        </div>
      </div>
      {errors.general && <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <div className="flex items-center">
            <AlertCircleIcon className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700 text-sm">{errors.general}</p>
          </div>
        </div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">
            Bank Name
          </label>
          <input id="bankName" name="bankName" type="text" value={formData.bankName} onChange={handleChange} className={`w-full px-3 py-2 border ${errors.bankName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`} placeholder="e.g. HDFC Bank, SBI, ICICI Bank" />
          {errors.bankName && <p className="mt-1 text-sm text-red-600">{errors.bankName}</p>}
        </div>
        <div>
          <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Account Number
          </label>
          <input id="accountNumber" name="accountNumber" type="text" value={formData.accountNumber} onChange={handleChange} className={`w-full px-3 py-2 border ${errors.accountNumber ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`} placeholder="Enter your account number" />
          {errors.accountNumber && <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>}
        </div>
        <div>
          <label htmlFor="confirmAccountNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Account Number
          </label>
          <input id="confirmAccountNumber" name="confirmAccountNumber" type="text" value={formData.confirmAccountNumber} onChange={handleChange} className={`w-full px-3 py-2 border ${errors.confirmAccountNumber ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`} placeholder="Re-enter your account number" />
          {errors.confirmAccountNumber && <p className="mt-1 text-sm text-red-600">
              {errors.confirmAccountNumber}
            </p>}
        </div>
        <div>
          <label htmlFor="ifscCode" className="block text-sm font-medium text-gray-700 mb-1">
            IFSC Code
          </label>
          <input id="ifscCode" name="ifscCode" type="text" value={formData.ifscCode} onChange={handleChange} className={`w-full px-3 py-2 border ${errors.ifscCode ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase`} placeholder="e.g. HDFC0000123" />
          {errors.ifscCode && <p className="mt-1 text-sm text-red-600">{errors.ifscCode}</p>}
          <p className="mt-1 text-xs text-gray-500">
            Format: 4 letters, followed by 0, followed by 6 characters (e.g.,
            HDFC0001234)
          </p>
        </div>
        <div>
          <label htmlFor="accountHolderName" className="block text-sm font-medium text-gray-700 mb-1">
            Account Holder Name
          </label>
          <input id="accountHolderName" name="accountHolderName" type="text" value={formData.accountHolderName} onChange={handleChange} className={`w-full px-3 py-2 border ${errors.accountHolderName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`} placeholder="Enter account holder's name" />
          {errors.accountHolderName && <p className="mt-1 text-sm text-red-600">
              {errors.accountHolderName}
            </p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Cancelled Cheque or Passbook Photo
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <div className="flex flex-col items-center">
                <UploadIcon className="h-10 w-10 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="cancelledCheque" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload a file</span>
                    <input id="cancelledCheque" name="cancelledCheque" type="file" className="sr-only" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, PDF up to 5MB</p>
              </div>
              {chequeFile && <div className="mt-2 text-sm text-gray-900">
                  Selected: {chequeFile.name}
                </div>}
            </div>
          </div>
          {errors.cancelledCheque && <p className="mt-1 text-sm text-red-600">
              {errors.cancelledCheque}
            </p>}
        </div>
        <div className="flex justify-between pt-4">
          <button type="button" onClick={onPrevious} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Previous
          </button>
          <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white text-[#2AB09C] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Next
          </button>
        </div>
      </form>
    </div>;
};
export default KYCStepBank;