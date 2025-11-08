import React, { useState } from 'react';
import { AlertCircleIcon, MapPinIcon, UploadIcon } from 'lucide-react';
interface KYCStepAddressProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}
const KYCStepAddress: React.FC<KYCStepAddressProps> = ({
  formData,
  updateFormData,
  onNext,
  onPrevious
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [addressProofFile, setAddressProofFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const {
      name,
      value
    } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      updateFormData({
        address: {
          ...formData.address,
          [addressField]: value
        }
      });
    } else {
      updateFormData({
        [name]: value
      });
    }
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'addressProof' | 'selfie') => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }
    const file = files[0];
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        [fileType]: 'File size should not exceed 5MB'
      }));
      return;
    }
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        [fileType]: 'Only JPEG, PNG, and PDF files are allowed'
      }));
      return;
    }
    if (fileType === 'addressProof') {
      setAddressProofFile(file);
      updateFormData({
        addressProofDocument: file
      });
    } else {
      setSelfieFile(file);
      updateFormData({
        selfieWithId: file
      });
    }
    // Clear error
    if (errors[fileType]) {
      setErrors(prev => ({
        ...prev,
        [fileType]: ''
      }));
    }
  };
  const handleUseGPS = () => {
    // In a real app, we would use the browser's geolocation API
    // to get the user's current location and then use a reverse
    // geocoding service to get the address
    updateFormData({
      useGPS: true,
      address: {
        ...formData.address,
        line1: '123 Main Street',
        line2: 'Apartment 4B',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        country: 'India'
      }
    });
  };
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.addressProofType) {
      newErrors.addressProofType = 'Please select an ID type';
    }
    if (!formData.addressProofDocument) {
      newErrors.addressProof = 'Please upload your address proof document';
    }
    if (!formData.selfieWithId) {
      newErrors.selfie = 'Please upload a selfie with your ID';
    }
    if (!formData.address.line1) {
      newErrors['address.line1'] = 'Address line 1 is required';
    }
    if (!formData.address.city) {
      newErrors['address.city'] = 'City is required';
    }
    if (!formData.address.state) {
      newErrors['address.state'] = 'State is required';
    }
    if (!formData.address.pincode) {
      newErrors['address.pincode'] = 'PIN code is required';
    } else if (!/^\d{6}$/.test(formData.address.pincode)) {
      newErrors['address.pincode'] = 'PIN code must be 6 digits';
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
      <h2 className="text-lg font-medium text-gray-900 mb-4">Address Proof</h2>
      {errors.general && <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <div className="flex items-center">
            <AlertCircleIcon className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700 text-sm">{errors.general}</p>
          </div>
        </div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="addressProofType" className="block text-sm font-medium text-gray-700 mb-1">
            Select ID Proof Type*
          </label>
          <select id="addressProofType" name="addressProofType" value={formData.addressProofType} onChange={handleChange} className={`w-full px-3 py-2 border ${errors.addressProofType ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}>
            <option value="">Select ID Type</option>
            <option value="aadhaar">Aadhaar Card</option>
            <option value="driving_license">Driving License</option>
            <option value="passport">Passport</option>
            <option value="voter_id">Voter ID</option>
          </select>
          {errors.addressProofType && <p className="mt-1 text-sm text-red-600">
              {errors.addressProofType}
            </p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Address Proof Document*
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <div className="flex flex-col items-center">
                <UploadIcon className="h-10 w-10 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="addressProof" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload a file</span>
                    <input id="addressProof" name="addressProof" type="file" className="sr-only" onChange={e => handleFileChange(e, 'addressProof')} accept=".jpg,.jpeg,.png,.pdf" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, PDF up to 5MB</p>
              </div>
              {addressProofFile && <div className="mt-2 text-sm text-gray-900">
                  Selected: {addressProofFile.name}
                </div>}
            </div>
          </div>
          {errors.addressProof && <p className="mt-1 text-sm text-red-600">{errors.addressProof}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Selfie with ID*
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <div className="flex flex-col items-center">
                <UploadIcon className="h-10 w-10 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="selfie" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload a file</span>
                    <input id="selfie" name="selfie" type="file" className="sr-only" onChange={e => handleFileChange(e, 'selfie')} accept=".jpg,.jpeg,.png" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
              </div>
              {selfieFile && <div className="mt-2 text-sm text-gray-900">
                  Selected: {selfieFile.name}
                </div>}
            </div>
          </div>
          {errors.selfie && <p className="mt-1 text-sm text-red-600">{errors.selfie}</p>}
        </div>
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-gray-900">
              Current Address
            </h3>
            <button type="button" onClick={handleUseGPS} className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <MapPinIcon className="h-4 w-4 mr-1 text-blue-500" />
              Use Current Location
            </button>
          </div>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label htmlFor="address.line1" className="block text-sm font-medium text-gray-700">
                Address Line 1*
              </label>
              <input type="text" name="address.line1" id="address.line1" value={formData.address.line1} onChange={handleChange} className={`mt-1 block w-full border ${errors['address.line1'] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`} />
              {errors['address.line1'] && <p className="mt-1 text-sm text-red-600">
                  {errors['address.line1']}
                </p>}
            </div>
            <div className="sm:col-span-6">
              <label htmlFor="address.line2" className="block text-sm font-medium text-gray-700">
                Address Line 2
              </label>
              <input type="text" name="address.line2" id="address.line2" value={formData.address.line2} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">
                City*
              </label>
              <input type="text" name="address.city" id="address.city" value={formData.address.city} onChange={handleChange} className={`mt-1 block w-full border ${errors['address.city'] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`} />
              {errors['address.city'] && <p className="mt-1 text-sm text-red-600">
                  {errors['address.city']}
                </p>}
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="address.state" className="block text-sm font-medium text-gray-700">
                State*
              </label>
              <input type="text" name="address.state" id="address.state" value={formData.address.state} onChange={handleChange} className={`mt-1 block w-full border ${errors['address.state'] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`} />
              {errors['address.state'] && <p className="mt-1 text-sm text-red-600">
                  {errors['address.state']}
                </p>}
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="address.pincode" className="block text-sm font-medium text-gray-700">
                PIN Code*
              </label>
              <input type="text" name="address.pincode" id="address.pincode" value={formData.address.pincode} onChange={handleChange} className={`mt-1 block w-full border ${errors['address.pincode'] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`} />
              {errors['address.pincode'] && <p className="mt-1 text-sm text-red-600">
                  {errors['address.pincode']}
                </p>}
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="address.country" className="block text-sm font-medium text-gray-700">
                Country*
              </label>
              <select id="address.country" name="address.country" value={formData.address.country} onChange={handleChange} className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option value="India">India</option>
              </select>
            </div>
          </div>
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
export default KYCStepAddress;