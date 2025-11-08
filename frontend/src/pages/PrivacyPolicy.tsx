import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';   // <-- adjust path
import Footer from '../components/layout/Footer';   // <-- adjust path

const LAST_UPDATED = 'September 1, 2025';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Privacy Policy • EasyLease';
  }, []);

  return (
    <div id="top" className="min-h-screen bg-gray-50 text-gray-900">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6 flex items-center gap-2">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => navigate(-1)}
            className="inline-flex h-9 w-9 -ml-1 items-center justify-center bg-transparent text-gray-800 hover:text-gray-900 active:scale-95 cursor-pointer"
            title="Back"
          >
            <span className="text-2xl md:text-3xl font-extrabold leading-none"><img src="less_than_icon.png" alt="Back-Icon" /></span>
          </button>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Privacy Policy for EasyLease
          </h1>
        </div>

        <p className="text-sm text-gray-600 mb-8">Last Updated: {LAST_UPDATED}</p>

        {/* Verbatim intro */}
        <section className="space-y-4 mb-8">
          <p>
            This Privacy Policy ("Policy") describes how EasyLease ("we," "us," or "our") collects, uses, discloses, and protects your information when you use our website, mobile application, and related services (collectively, the "Services").
          </p>
          <p>
            By accessing or using our Services, you consent to the practices described in this Policy. Please read it carefully to understand our views and practices regarding your personal data.
          </p>
        </section>

        {/* Table of Contents */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-10">
          <h2 className="text-lg font-semibold mb-3">Contents</h2>
          <ol className="list-decimal ml-5 space-y-1 text-sm sm:text-base">
            <li><a className="text-[#2AB09C] hover:underline" href="#information-we-collect">1. Information We Collect</a></li>
            <li><a className="text-[#2AB09C] hover:underline" href="#how-we-use">2. How We Use Your Information</a></li>
            <li><a className="text-[#2AB09C] hover:underline" href="#how-we-share">3. How We Share Your Information</a></li>
            <li><a className="text-[#2AB09C] hover:underline" href="#your-choices">4. Your Choices and Access to Your Information</a></li>
            <li><a className="text-[#2AB09C] hover:underline" href="#data-security">5. Data Security</a></li>
            <li><a className="text-[#2AB09C] hover:underline" href="#third-party-links">6. Third-Party Links</a></li>
            <li><a className="text-[#2AB09C] hover:underline" href="#changes-to-policy">7. Changes to This Privacy Policy</a></li>
            <li><a className="text-[#2AB09C] hover:underline" href="#grievance-officer">8. Grievance Officer</a></li>
          </ol>
        </div>

        {/* Verbatim sections */}
        <section id="information-we-collect" className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">1. Information We Collect</h2>
          <p>We collect information to provide and improve our Services, facilitating connections between property owners and tenants.</p>

          <h3 className="font-medium">A. Information You Provide to Us:</h3>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              <span className="font-medium">Registration Data:</span> When you create an account as an owner or a tenant, we ask for information such as your name, phone number, email address, and location.
            </li>
            <li>
              <span className="font-medium">Property Listings:</span>If you are an owner listing a property, we collect details about the property, including its address, type, size, amenities, photographs, and rental price.
            </li>
            <li>
              <span className="font-medium">Profile Information:</span> You may choose to provide additional information to enhance your profile, such as a biography, your profession, or preferences (e.g., pet-friendly, furnished).
            </li>
            <li>
              <span className="font-medium">Communications:</span> Information you provide when you contact us for support or communicate with other users through our platform.
            </li>
          </ul>

          <h3 className="font-medium">B. Information Collected Automatically:</h3>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              <span className="font-medium">Log Data:</span> We automatically receive information from your browser or device, such as your IP address, device type, browser type, pages visited, and the time and date of your visit.
            </li>
            <li>
              <span className="font-medium">Cookies and Similar Technologies:</span> We use cookies to recognize your browser, remember your preferences, and understand how you use our Services. This helps us provide a more personalized experience. You can control cookies through your browser settings.
            </li>
            <li>
              <span className="font-medium">Usage Information:</span> We collect data about your interactions with our Services, including the properties you view, search queries you run, and features you use.
            </li>
          </ul>
        </section>

        <section id="how-we-use" className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
          <p>We use the information we collect for the following purposes:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>To create and manage your user account.</li>
            <li>To enable you to create, publish, and manage property listings.</li>
            <li>To facilitate communication between property owners and prospective tenants.</li>
            <li>To personalize your experience and show you relevant property listings.</li>
            <li>To analyze and improve our Services, functionality, and user experience.</li>
            <li>To communicate with you about service updates, security alerts, and administrative messages.</li>
            <li>To detect, prevent, and address technical issues, fraud, or misuse of our Services.</li>
          </ul>
        </section>

        <section id="how-we-share" className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">3. How We Share Your Information</h2>
          <p>We respect your privacy and do not sell your personal information to third parties. We may share your information in the following limited circumstances:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              <span className="font-semibold">Between Users:</span> Your contact information and property details from a listing will be shared with other users to facilitate the rental process, as is the core function of our Service.
            </li>
            <li>
              <span className="font-semibold">Service Providers:</span> We employ trusted third-party companies to perform functions on our behalf (e.g., hosting, data analysis, customer service). They have access to information needed to perform their tasks but are obligated not to disclose or use it for other purposes.
            </li>
            <li>
              <span className="font-semibold">Legal Requirements:</span> We may disclose information if required to do so by law or in response to valid requests by public authorities (e.g., a court or government agency).
            </li>
            <li>
              <span className="font-semibold">To Protect Our Rights:</span> We may share information to enforce our Terms of Service, protect the security of our Services, or protect the rights, property, or safety of EasyLease, our users, or others.
            </li>
          </ul>
        </section>

        <section id="your-choices" className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">4. Your Choices and Access to Your Information</h2>
          <p>You can access and update most of your personal information directly through your account profile settings. You are responsible for keeping your account information accurate and confidential.</p>
          <p>You can typically remove or block cookies using your browser settings, though this may affect your ability to use some features of our Services.</p>
        </section>

        <section id="data-security" className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">5. Data Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. While we strive to use commercially acceptable means to protect your information, no method of transmission over the Internet or electronic storage is 100% secure.</p>
        </section>

        <section id="third-party-links" className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">6. Third-Party Links</h2>
          <p>Our Service may contain links to other websites. This Privacy Policy applies only to our Services. We are not responsible for the content or privacy practices of third-party sites. We encourage you to review the privacy policies of any other site you visit.</p>
        </section>

        <section id="changes-to-policy" className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">7. Changes to This Privacy Policy</h2>
          <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Policy on this page and updating the "Last Updated" date. Your continued use of the Services after any change constitutes your acceptance of the new Policy.</p>
        </section>

        <section id="grievance-officer" className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">8. Grievance Officer</h2>
          <p>If you have any questions, concerns, or complaints about this Privacy Policy or our data practices, you can contact our Grievance Officer:</p>
          <div className="rounded-lg border border-gray-200 p-4 bg-white">
            <p>EasyLease</p>
            <p>Email: support@easylease.services</p>
            <p>Phone: 8448163874</p>
          </div>
          <p>We will address your concerns and strive to resolve any issues in a timely manner.</p>
        </section>

        <div className="mt-12">
          <a href="#top" className="text-sm text-[#2AB09C] hover:underline">Back to top</a>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;