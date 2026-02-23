import {
  Home,
  Footer,
  PropertyListing,
  PropertyDetail,
  ListProperty,
  ForgotPassword,
  Account,
  TermsAndConditions,
  PrivacyPolicy,
  AllBlogs,
  BlogDetail,
  Agents,
  AgentProperties,
  ChatWithUs,
  ResetPasswordPage,
  VerifyEmailPage,
  ScrollToTop,
  Navbar,
  About,
} from "./utils/import";

import { AuthProvider } from "./context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Contact from "./pages/Contact";
import LenisProvider from "./components/LenisProvider";

export function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  return (
    <LenisProvider>
      <GoogleOAuthProvider clientId={clientId}>
        <AuthProvider>
          <BrowserRouter>
            <ScrollToTop />
            <div className="flex min-h-screen flex-col bg-gray-50">
              <Routes>
                <Route
                  path="/auth/forgot-password"
                  element={<ForgotPassword />}
                />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                <Route path="/verify-email" element={<VerifyEmailPage />} />

                <Route path="/account" element={<Account />} />
                <Route path="/properties/:id/edit" element={<ListProperty />} />
                <Route path="/terms" element={<TermsAndConditions />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />

                <Route path="/chat-with-us" element={<ChatWithUs />} />

                <Route
                  path="*"
                  element={
                    <>
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
                          <Route path="/contact" element={<Contact />} />
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
    </LenisProvider>
  );
}

{
  /* Auth routes without header/footer */
}
{
  /* <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/signup" element={<Signup />} /> */
}
{
  /* Onboarding routes without header/footer */
}
{
  /* <Route path="/onboarding/buyer" element={<BuyerOnboarding />} />
              <Route path="/onboarding/owner" element={<OwnerOnboarding />} />
              <Route path="/onboarding/kyc" element={<KYCFlow />} />
              <Route path="/onboarding/kyc-status" element={<KYCStatus />} /> */
}
{
  /* <Route path="/rates-and-trends" element={<RatesTrends />} /> */
}
{
  /* <Route path="/buy-vs-rent" element={<BuyVsRent />} /> */
}
{
  /* <Route path="/area-converter" element={<AreaConverter />} /> */
}
{
  /* <Route path="/home-loans/apply" element={<ApplyHomeLoan />} /> */
}
{
  /* <Route path="/home-loans/emi-calculator" element={<EMICalculator />} /> */
}
{
  /* <Route path="/home-loans/eligibility-calculator" element={<EligibilityCalculator />} /> */
}
{
  /* <Route path="/home-loans/partners/:slug" element={<PartnerDetail />} /> */
}
{
  /* <Route path="/help-center" element={<HelpCenter />} />\ */
}
{
  /* <Route path="/interior-services" element={<InteriorServices />} /> */
}
