// import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import PropertyListing from "./pages/PropertyListing";
import PropertyDetail from "./pages/PropertyDetail";
import ListProperty from "./pages/ListProperty";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Account from "./pages/Account";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AllBlogs from "./pages/AllBlogs";
import BlogDetail from "./pages/BlogDetail";
import Agents from "./pages/Agents";
import AgentProperties from "./pages/AgentProperties";
import ChatWithUs from "./pages/ChatWithUs";
import ResetPasswordPage from "./pages/auth/ResetPassword";
import { GoogleOAuthProvider } from "@react-oauth/google";
// import BuyerOnboarding from "./pages/onboarding/BuyerOnboarding";
// import OwnerOnboarding from "./pages/onboarding/OwnerOnboarding";
// import KYCFlow from "./pages/onboarding/KYCFlow";
// import KYCStatus from "./pages/onboarding/KYCStatus";
// import VerifyEmailPage from "./pages/VerifyEmailPage";
// import RatesTrends from "./pages/RatesTrends";
// import BuyVsRent from "./pages/BuyVsRent";
// import ApplyHomeLoan from "./pages/homeLoans/ApplyHomeLoan";
// import EMICalculator from "./pages/homeLoans/EmiCalculator";
// import EligibilityCalculator from "./pages/homeLoans/EligibilityCalculator";
// import PartnerDetail from "./pages/homeLoans/PartnerDetail";
// import AreaConverter from "./pages/AreaConverter";
// import HelpCenter from "./pages/HelpCenter";
// import InteriorServices from "./pages/InteriorServices";

export function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen bg-gray-50">
            <Routes>
              {/* Auth routes without header/footer */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/signup" element={<Signup />} />
              <Route
                path="/auth/forgot-password"
                element={<ForgotPassword />}
              />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Onboarding routes without header/footer */}
              {/* <Route path="/onboarding/buyer" element={<BuyerOnboarding />} />
              <Route path="/onboarding/owner" element={<OwnerOnboarding />} />
              <Route path="/onboarding/kyc" element={<KYCFlow />} />
              <Route path="/onboarding/kyc-status" element={<KYCStatus />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} /> */}

              <Route path="/account" element={<Account />} />
              <Route path="/properties/:id/edit" element={<ListProperty />} />
              <Route path="/terms" element={<TermsAndConditions />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/blog" element={<AllBlogs />} />
              <Route path="/blog/:slug" element={<BlogDetail />} />
              <Route path="/agents" element={<Agents />} />
              <Route
                path="/agents/:id/properties"
                element={<AgentProperties />}
              />
              {/* <Route path="/rates-and-trends" element={<RatesTrends />} /> */}
              {/* <Route path="/buy-vs-rent" element={<BuyVsRent />} /> */}
              {/* <Route path="/area-converter" element={<AreaConverter />} /> */}
              {/* <Route path="/home-loans/apply" element={<ApplyHomeLoan />} /> */}
              {/* <Route path="/home-loans/emi-calculator" element={<EMICalculator />} /> */}
              {/* <Route path="/home-loans/eligibility-calculator" element={<EligibilityCalculator />} /> */}
              {/* <Route path="/home-loans/partners/:slug" element={<PartnerDetail />} /> */}
              {/* <Route path="/help-center" element={<HelpCenter />} />\ */}
              <Route path="/chat-with-us" element={<ChatWithUs />} />
              {/* <Route path="/interior-services" element={<InteriorServices />} /> */}
              {/* Main routes with header/footer */}
              <Route
                path="*"
                element={
                  <>
                    <Header />
                    <main className="flex-grow">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route
                          path="/properties"
                          element={<PropertyListing />}
                        />
                        <Route
                          path="/properties/:id"
                          element={<PropertyDetail />}
                        />
                        <Route
                          path="/list-property"
                          element={<ListProperty />}
                        />
                      </Routes>
                    </main>
                    <Footer />
                  </>
                }
              />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
