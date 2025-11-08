import React from "react";
import { Link } from "react-router-dom";
import {
  HomeIcon,
  PhoneIcon,
  MailIcon,
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from "lucide-react";
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <HomeIcon className="h-8 w-8 text-blue-400" />
              {/* <span className="ml-2 text-xl font-bold">
                RealEstate<span className="text-blue-400">Hub</span>
              </span> */}
              <img src="/Easy_Lease_Logo.png" alt="Footer Logo" />
            </div>
            <p className="text-gray-400 mb-4">
              Find your perfect home or list your property with our easy-to-use
              real estate marketplace.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/share/1EmnN1wQQX/"
                className="text-gray-400 hover:text-white"
              >
                <FacebookIcon className="h-6 w-6" />
              </a>
              <a
                href="https://www.instagram.com/easylease.services?igsh=N2Q1NW1qMDZrbXd6"
                className="text-gray-400 hover:text-white"
              >
                <InstagramIcon className="h-6 w-6" />
              </a>
              {/* <a href="#" className="text-gray-400 hover:text-white">
              <YoutubeIcon className="h-6 w-6" />
            </a> */}
            </div>
          </div>

          <div>
            {/* <h3 className="text-lg font-semibold mb-4">Property Types</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/properties?type=pg" className="text-gray-400 hover:text-white">
                  PG Accommodations
                </Link>
              </li>
              <li>
                <Link to="/properties?type=flat" className="text-gray-400 hover:text-white">
                  Apartments & Flats
                </Link>
              </li>
              <li>
                <Link to="/properties?type=house" className="text-gray-400 hover:text-white">
                  Independent Houses
                </Link>
              </li>
              <li>
                <Link to="/properties?type=commercial" className="text-gray-400 hover:text-white">
                  Commercial Properties
                </Link>
              </li>
              <li>
                <Link to="/properties?type=land" className="text-gray-400 hover:text-white">
                  Plots & Land
                </Link>
              </li>
            </ul> */}
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/properties"
                  className="text-gray-400 hover:text-white"
                >
                  Properties
                </Link>
              </li>
              <li>
                <Link
                  to="/list-property"
                  className="text-gray-400 hover:text-white"
                >
                  List Your Property
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <PhoneIcon className="h-6 w-6 text-[#2AB09C] mr-2 flex-shrink-0" />
                <span className="text-gray-400">
                  <a href="tel:+918448163874">+91 8448163874</a>
                </span>
              </li>
              <li className="flex items-start">
                <MailIcon className="h-6 w-6 text-[#2AB09C] mr-2 flex-shrink-0" />
                <span className="text-gray-400">
                  <a href="mailto:support@easylease.services">
                    support@easylease.services
                  </a>
                </span>
              </li>
              <li>
                <address className="text-gray-400 not-italic">
                  11th Mile Stone, Chakrata Road, East Hope Town Dehradun,
                  Uttarakhand - 248007 India
                </address>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6">
          <p className="text-gray-400 text-center text-sm">
            &copy; {new Date().getFullYear()} EasyLease. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
