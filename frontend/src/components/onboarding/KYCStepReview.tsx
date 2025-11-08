import React from 'react';
import { CheckCircleIcon } from 'lucide-react';
interface KYCStepReviewProps {
  formData: any;
  onSubmit: () => void;
  onPrevious: () => void;
}
const KYCStepReview: React.FC<KYCStepReviewProps> = ({
  formData,
  onSubmit,
  onPrevious
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  return <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Review Your Details
      </h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-base font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4">
            Personal Details
          </h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Date of Birth
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatDate(formData.dob)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Gender</dt>
              <dd className="mt-1 text-sm text-gray-900 capitalize">
                {formData.gender}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">PAN Number</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formData.panNumber}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Aadhaar Number
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formData.aadhaarNumber ? `XXXX XXXX ${formData.aadhaarNumber.slice(-4)}` : ''}
              </dd>
            </div>
          </dl>
        </div>
        <div>
          <h3 className="text-base font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4">
            Address Details
          </h3>
          <dl className="grid grid-cols-1 gap-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">
                ID Proof Type
              </dt>
              <dd className="mt-1 text-sm text-gray-900 capitalize">
                {formData.addressProofType?.replace('_', ' ')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formData.address?.line1}
                {formData.address?.line2 && <span>, {formData.address.line2}</span>}
                <br />
                {formData.address?.city}, {formData.address?.state} -{' '}
                {formData.address?.pincode}
                <br />
                {formData.address?.country}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Documents Uploaded
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                <ul className="list-disc list-inside space-y-1">
                  {formData.addressProofDocument && <li className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                      Address Proof Document
                    </li>}
                  {formData.selfieWithId && <li className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                      Selfie with ID
                    </li>}
                </ul>
              </dd>
            </div>
          </dl>
        </div>
        <div>
          <h3 className="text-base font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4">
            Bank Details
          </h3>
          {formData.bankName ? <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Bank Name</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formData.bankName}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Account Number
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formData.accountNumber ? `XXXX XXXX ${formData.accountNumber.slice(-4)}` : ''}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">IFSC Code</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formData.ifscCode}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Account Holder Name
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formData.accountHolderName}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Documents Uploaded
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formData.cancelledCheque && <div className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                      Cancelled Cheque/Passbook Photo
                    </div>}
                </dd>
              </div>
            </dl> : <p className="text-sm text-gray-500 italic">
              No bank details provided (optional)
            </p>}
        </div>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Please review all the information above carefully. Once
                submitted, you will not be able to edit these details until the
                verification process is complete.
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-between pt-4">
          <button type="button" onClick={onPrevious} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Previous
          </button>
          <button type="button" onClick={onSubmit} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white text-[#2AB09C] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Submit for Verification
          </button>
        </div>
      </div>
    </div>;
};
export default KYCStepReview;