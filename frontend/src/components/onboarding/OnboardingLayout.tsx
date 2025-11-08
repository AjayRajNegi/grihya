import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon } from 'lucide-react';
interface OnboardingLayoutProps {
  children: React.ReactNode;
}
const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children
}) => {
  return <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center">
              <HomeIcon className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                RealEstate<span className="text-blue-600">Hub</span>
              </span>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col">
          {children}
        </div>
      </main>
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} RealEstateHub. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>;
};
export default OnboardingLayout;