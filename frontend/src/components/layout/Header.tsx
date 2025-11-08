import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { HomeIcon, UserIcon, Building2, PlusCircle } from "lucide-react";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { pathname } = useLocation();

  const isHome = pathname === "/";
  const isProperties = pathname.startsWith("/properties");
  const isList = pathname.startsWith("/list-property");
  const isAccountRoute =
    pathname.startsWith("/account") || pathname.startsWith("/profile");

  return (
    <header className=" fixed bottom-0 left-0 right-0 z-[70] bg-white/95 backdrop-blur border-t border-gray-200 shadow-[0_-1px_8px_rgba(0,0,0,0.06)] md:bottom-[2%] md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-1/2 md:rounded-2xl md:border md:border-gray-200 md:shadow-[0_10px_30px_rgba(0,0,0,0.12)] ">
      <div className="relative max-w-5xl mx-auto px-2 sm:px-4">
        <nav className="grid grid-cols-4 gap-1 py-1.5">
          {/* Home */}
          <Link
            to="/"
            className="flex flex-col items-center justify-center py-2 rounded-xl text-gray-700 hover:text-[#2AB09C] hover:bg-emerald-50 transition"
            style={isHome ? { color: "#2AB09C" } : undefined}
          >
            <HomeIcon className="h-5 w-5" />
            <span className="text-[11px] leading-tight mt-1">Home</span>
          </Link>

          {/* Properties */}
          <Link
            to="/properties"
            className="flex flex-col items-center justify-center py-2 rounded-xl text-gray-700 hover:text-[#2AB09C] hover:bg-emerald-50 transition"
            style={isProperties ? { color: "#2AB09C" } : undefined}
          >
            <Building2 className="h-5 w-5" />
            <span className="text-[11px] leading-tight mt-1">Properties</span>
          </Link>

          {/* List Your Property (primary) */}
          <Link
            to="/list-property"
            className="flex flex-col items-center justify-center py-2 rounded-xl text-gray-700 hover:bg-emerald-50 hover:text-[#2AB09C] transition"
            style={isList ? { color: "#2AB09C" } : undefined}
          >
            <PlusCircle className="h-6 w-6" />
            <span className="text-[11px] leading-tight mt-1">List</span>
          </Link>

          {/* Account */}
          <Link
            to="/account"
            className="flex flex-col items-center justify-center py-2 rounded-xl text-gray-700 hover:text-[#2AB09C] hover:bg-emerald-50 transition"
            style={isAccountRoute ? { color: "#2AB09C" } : undefined}
          >
            <UserIcon className="h-5 w-5" />
            <span className="text-[11px] leading-tight mt-1">
              {isAuthenticated
                ? user?.name?.split(" ")[0] || "Account"
                : "Account"}
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
