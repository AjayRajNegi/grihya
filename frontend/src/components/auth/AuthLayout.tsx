import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon } from 'lucide-react';
interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}
const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle
}) => {
  return <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center">
          <HomeIcon className="h-10 w-10 text-blue-600" />
          <span className="ml-2 text-2xl font-bold text-gray-900">
            RealEstate<span className="text-blue-600">Hub</span>
          </span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {title}
        </h2>
        {subtitle && <p className="mt-2 text-center text-sm text-gray-600 max-w-md mx-auto">
            {subtitle}
          </p>}
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {children}
        </div>
      </div>
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          &copy; {new Date().getFullYear()} RealEstateHub. All rights reserved.
        </p>
      </div>
    </div>;
};
export default AuthLayout;