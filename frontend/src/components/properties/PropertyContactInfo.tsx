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
      <div className="rounded-xl border border-gray-100 bg-white p-6">
        <div className="mb-4 flex items-center">
          <ShieldIcon className="mr-2 h-6 w-6 text-[#2DB8D1]" />
          <h3 className="text-lg font-semibold">Contact Information</h3>
        </div>
        <div className="mb-4 rounded-md bg-blue-50 p-4">
          <p className="text-[#2DB8D1]">
            Please log in or sign up to view the owner's contact details.
          </p>
        </div>
        <div className="flex space-x-4">
          <Link to="/account">
            <button className="flex-1 rounded-xl bg-[#2DB8D1] px-4 py-2 text-white transition-colors">
              Login
            </button>
          </Link>
          <Link to="/account">
            <button className="flex-1 rounded-xl bg-gray-200 px-4 py-2 text-gray-800 transition-colors">
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6">
      <div className="mb-4 flex items-center">
        <UserIcon className="mr-2 h-6 w-6 text-[#2DB8D1]" />
        <h3 className="text-lg font-semibold">Owner Details</h3>
      </div>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Name</p>
          <p className="font-medium">{ownerName || "Not provided"}</p>
        </div>

        {ownerPhone ? (
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <a
              href={`tel:${ownerPhone}`}
              className="flex items-center font-medium text-[#2DB8D1]"
            >
              <PhoneIcon className="mr-2 h-4 w-4" />
              {ownerPhone}
            </a>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-medium">Not provided</p>
          </div>
        )}

        {ownerEmail ? (
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <a
              href={`mailto:${ownerEmail}`}
              className="flex items-center font-medium text-[#2DB8D1]"
            >
              <MailIcon className="mr-2 h-4 w-4" />
              {ownerEmail}
            </a>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">Not provided</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyContactInfo;
