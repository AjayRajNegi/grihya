import React from "react";
import { Link } from "react-router-dom";
import { PhoneIcon, MailIcon, UserIcon, ShieldIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface PropertyContactInfoProps {
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
}

const PropertyContactInfo: React.FC<PropertyContactInfoProps> = ({
  ownerName,
  ownerPhone,
  ownerEmail,
}) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center mb-4">
          <ShieldIcon className="h-6 w-6 text-[#2AB09C] mr-2" />
          <h3 className="text-lg font-semibold">Contact Information</h3>
        </div>
        <div className="bg-blue-50 p-4 rounded-md mb-4">
          <p className="text-[#2AB09C]">
            Please log in or sign up to view the owner's contact details.
          </p>
        </div>
        <div className="flex space-x-4">
          <Link to="/account">
            <button className="flex-1 bg-[#2AB09C] hover:bg-transparent hover:text-[#2AB09C] text-white py-2 px-4 rounded-md transition-colors">
              Login
            </button>
          </Link>
          <Link to="/account">
            <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md transition-colors">
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center mb-4">
        <UserIcon className="h-6 w-6 text-[#2AB09C] mr-2" />
        <h3 className="text-lg font-semibold">Owner Details</h3>
      </div>
      <div className="space-y-4">
        <div>
          <p className="text-gray-600 text-sm">Name</p>
          <p className="font-medium">{ownerName || "Not provided"}</p>
        </div>

        {ownerPhone ? (
          <div>
            <p className="text-gray-600 text-sm">Phone</p>
            <a
              href={`tel:${ownerPhone}`}
              className="flex items-center text-[#2AB09C] hover:text-[#2AB09C] font-medium"
            >
              <PhoneIcon className="h-4 w-4 mr-2" />
              {ownerPhone}
            </a>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 text-sm">Phone</p>
            <p className="font-medium">Not provided</p>
          </div>
        )}

        {ownerEmail ? (
          <div>
            <p className="text-gray-600 text-sm">Email</p>
            <a
              href={`mailto:${ownerEmail}`}
              className="flex items-center text-[#2AB09C] hover:text-[#2AB09C] font-medium"
            >
              <MailIcon className="h-4 w-4 mr-2" />
              {ownerEmail}
            </a>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 text-sm">Email</p>
            <p className="font-medium">Not provided</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyContactInfo;
