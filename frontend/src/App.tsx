import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import PropertyListing from "./pages/PropertyListing";
import PropertyDetail from "./pages/PropertyDetail";
import ListProperty from "./pages/ListProperty";
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
import VerifyEmailPage from "./pages/VerifyEmailPage";
import { Navbar } from "./components/layout/Navbar";
import ScrollToTop from "./components/layout/ScrollToTop";
import About from "./pages/About";

export function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="flex min-h-screen flex-col bg-gray-50">
            <Routes>
              {/* Auth routes without header/footer */}
              {/* <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/signup" element={<Signup />} /> */}
              <Route
                path="/auth/forgot-password"
                element={<ForgotPassword />}
              />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Onboarding routes without header/footer */}
              {/* <Route path="/onboarding/buyer" element={<BuyerOnboarding />} />
              <Route path="/onboarding/owner" element={<OwnerOnboarding />} />
              <Route path="/onboarding/kyc" element={<KYCFlow />} />
              <Route path="/onboarding/kyc-status" element={<KYCStatus />} /> */}
              <Route path="/verify-email" element={<VerifyEmailPage />} />

              <Route path="/account" element={<Account />} />
              <Route path="/properties/:id/edit" element={<ListProperty />} />
              <Route path="/terms" element={<TermsAndConditions />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />

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
                    {/* <Header /> */}
                    <Navbar />
                    <main className="flex-grow bg-white">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<About />} />
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
                        <Route path="/blog" element={<AllBlogs />} />
                        <Route path="/blog/:slug" element={<BlogDetail />} />
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
