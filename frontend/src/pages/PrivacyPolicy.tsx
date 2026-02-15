import { Footer } from "@/utils/import";
import { ArrowLeft } from "lucide-react";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LAST_UPDATED = "February 5, 2026";

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Privacy Policy • Grihya";
  }, []);

  return (
    <div id="top" className="min-h-screen bg-gray-50 text-gray-900">
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center gap-2">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => navigate(-1)}
            className="-ml-1 inline-flex h-9 w-9 cursor-pointer items-center justify-center bg-transparent text-gray-800 hover:text-gray-900 active:scale-95"
            title="Back"
          >
            <span className="text-2xl font-extrabold leading-none md:text-3xl">
              <ArrowLeft size={30} />
            </span>
          </button>

          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Privacy Policy for Grihya
          </h1>
        </div>

        <section className="flex flex-col gap-5 md:flex-row-reverse">
          {/* Table of Contents */}
          <div className="mb-10 h-fit min-w-[30%] rounded-[10px] border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-lg font-semibold">Contents</h2>
            <ol className="ml-5 list-decimal space-y-1 text-sm sm:text-base">
              <li>
                <a className="text-[#2DB8D1] hover:underline" href="#intro">
                  Introduction
                </a>
              </li>
              <li>
                <a className="text-[#2DB8D1] hover:underline" href="#scope">
                  Scope of This Policy
                </a>
              </li>
              <li>
                <a
                  className="text-[#2DB8D1] hover:underline"
                  href="#information-we-collect"
                >
                  Information We Collect
                </a>
              </li>
              <li>
                <a className="text-[#2DB8D1] hover:underline" href="#purpose">
                  Purpose of Data Collection and Use
                </a>
              </li>
              <li>
                <a
                  className="text-[#2DB8D1] hover:underline"
                  href="#legal-basis"
                >
                  Legal Basis for Processing
                </a>
              </li>
              <li>
                <a
                  className="text-[#2DB8D1] hover:underline"
                  href="#data-sharing"
                >
                  Data Sharing and Disclosure
                </a>
              </li>
              <li>
                <a
                  className="text-[#2DB8D1] hover:underline"
                  href="#data-storage"
                >
                  Data Storage and Retention
                </a>
              </li>
              <li>
                <a
                  className="text-[#2DB8D1] hover:underline"
                  href="#data-security"
                >
                  Data Security Measures
                </a>
              </li>
              <li>
                <a className="text-[#2DB8D1] hover:underline" href="#cookies">
                  Cookies and Tracking Technologies
                </a>
              </li>
              <li>
                <a
                  className="text-[#2DB8D1] hover:underline"
                  href="#user-rights"
                >
                  User Rights
                </a>
              </li>
              <li>
                <a
                  className="text-[#2DB8D1] hover:underline"
                  href="#third-party-links"
                >
                  Third-Party Links
                </a>
              </li>
              <li>
                <a
                  className="text-[#2DB8D1] hover:underline"
                  href="#children-privacy"
                >
                  Children&apos;s Privacy
                </a>
              </li>
              <li>
                <a className="text-[#2DB8D1] hover:underline" href="#changes">
                  Changes to This Privacy Policy
                </a>
              </li>
              <li>
                <a
                  className="text-[#2DB8D1] hover:underline"
                  href="#governing-law"
                >
                  Governing Law and Jurisdiction
                </a>
              </li>
              <li>
                <a className="text-[#2DB8D1] hover:underline" href="#contact">
                  Contact Information
                </a>
              </li>
            </ol>
          </div>

          <div>
            <section id="intro" className="mb-10 space-y-4">
              <h2 className="text-xl font-semibold">1. Introduction</h2>
              <p>
                Grihya (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is
                committed to protecting the privacy and personal data of users
                who access or use the website https://grihya.in/ (the
                &quot;Website&quot;). This Privacy Policy explains how we
                collect, use, disclose, store, and protect personal information
                in accordance with:
              </p>
              <ul className="ml-6 list-disc space-y-1">
                <li>The Information Technology Act, 2000</li>
                <li>
                  The Information Technology (Reasonable Security Practices and
                  Procedures and Sensitive Personal Data or Information) Rules,
                  2011
                </li>
                <li>Other applicable Indian laws and regulations</li>
              </ul>
              <p>
                By accessing or using the Website, you consent to the collection
                and use of information as described in this Privacy Policy.
              </p>
            </section>

            <section id="scope" className="mb-10 space-y-4">
              <h2 className="text-xl font-semibold">2. Scope of This Policy</h2>
              <p>This Privacy Policy applies to:</p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Visitors to the Website</li>
                <li>Users submitting inquiries or contact forms</li>
                <li>
                  Users interacting with property listings, blogs, or marketing
                  content
                </li>
              </ul>
              <p>
                This Policy does not apply to third-party websites or services
                linked from the Website.
              </p>
            </section>

            <section id="information-we-collect" className="mb-10 space-y-4">
              <h2 className="text-xl font-semibold">
                3. Information We Collect
              </h2>

              <h3 className="font-medium">3.1 Personal Information</h3>
              <p>
                We may collect the following personal information when
                voluntarily provided by users:
              </p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Full name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>City, state, or location details</li>
                <li>Inquiry details or messages submitted through forms</li>
              </ul>

              <h3 className="font-medium">
                3.2 Automatically Collected Information
              </h3>
              <p>When you visit the Website, we may automatically collect:</p>
              <ul className="ml-6 list-disc space-y-1">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>Pages visited, time spent, and referral URLs</li>
              </ul>
              <p>
                This data is collected through standard analytics tools and
                cookies.
              </p>

              <h3 className="font-medium">3.3 Sensitive Personal Data</h3>
              <p>
                We do not intentionally collect sensitive personal data (such as
                financial information, passwords, biometric data, or government
                identification numbers) unless explicitly required and legally
                permitted.
              </p>
            </section>

            <section id="purpose" className="mb-10 space-y-4">
              <h2 className="text-xl font-semibold">
                4. Purpose of Data Collection and Use
              </h2>
              <p>We use collected information for the following purposes:</p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Responding to inquiries and contact requests</li>
                <li>Providing information related to properties or services</li>
                <li>
                  Improving Website performance, content, and user experience
                </li>
                <li>Internal analytics and business operations</li>
                <li>
                  Marketing and promotional communication, where legally
                  permitted
                </li>
                <li>
                  Compliance with legal, regulatory, or governmental
                  requirements
                </li>
              </ul>
              <p>
                We ensure that personal data is used only for purposes directly
                related to the Website&apos;s functionality and services.
              </p>
            </section>

            <section id="legal-basis" className="mb-10 space-y-4">
              <h2 className="text-xl font-semibold">
                5. Legal Basis for Processing
              </h2>
              <p>Personal data is processed based on:</p>
              <ul className="ml-6 list-disc space-y-1">
                <li>User consent</li>
                <li>Legitimate business interests</li>
                <li>Compliance with legal obligations</li>
                <li>Performance of services requested by the user</li>
              </ul>
            </section>

            <section id="data-sharing" className="mb-10 space-y-4">
              <h2 className="text-xl font-semibold">
                6. Data Sharing and Disclosure
              </h2>
              <p>We do not sell, rent, or trade personal data.</p>
              <p>
                Personal information may be shared only in the following
                circumstances:
              </p>
              <ul className="ml-6 list-disc space-y-1">
                <li>
                  With trusted service providers (such as hosting, analytics, or
                  communication tools) under confidentiality obligations
                </li>
                <li>
                  With government authorities, regulators, or law enforcement
                  when required by law
                </li>
                <li>
                  To protect the rights, property, or safety of Grihya, users,
                  or the public
                </li>
              </ul>
              <p>
                All third parties are required to adhere to reasonable data
                protection standards.
              </p>
            </section>

            <section id="data-storage" className="mb-10 space-y-4">
              <h2 className="text-xl font-semibold">
                7. Data Storage and Retention
              </h2>
              <ul className="ml-6 list-disc space-y-1">
                <li>
                  Personal data is stored on secure servers located in India or
                  other jurisdictions with adequate data protection safeguards
                </li>
                <li>
                  Data is retained only for as long as necessary to fulfil its
                  intended purpose or comply with legal requirements
                </li>
                <li>
                  When no longer required, data is securely deleted or
                  anonymised
                </li>
              </ul>
            </section>

            <section id="data-security" className="mb-10 space-y-4">
              <h2 className="text-xl font-semibold">
                8. Data Security Measures
              </h2>
              <p>
                We implement reasonable security practices and procedures to
                protect personal data, including:
              </p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Secure hosting infrastructure</li>
                <li>Access controls and administrative safeguards</li>
                <li>Encryption and technical protections where appropriate</li>
              </ul>
              <p>
                However, no system is completely secure, and we cannot guarantee
                absolute security of information transmitted over the internet.
              </p>
            </section>

            <section id="cookies" className="mb-10 space-y-4">
              <h2 className="text-xl font-semibold">
                9. Cookies and Tracking Technologies
              </h2>
              <p>The Website may use cookies or similar technologies to:</p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Improve functionality and performance</li>
                <li>Analyze traffic and user behavior</li>
                <li>Enhance user experience</li>
              </ul>
              <p>
                Users may disable cookies through their browser settings;
                however, some features of the Website may not function properly
                as a result.
              </p>
            </section>

            <section id="user-rights" className="mb-10 space-y-4">
              <h2 className="text-xl font-semibold">10. User Rights</h2>
              <p>Subject to applicable law, users have the right to:</p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Request access to personal data held by us</li>
                <li>
                  Request correction or updating of inaccurate information
                </li>
                <li>
                  Request deletion of personal data, subject to legal and
                  regulatory obligations
                </li>
                <li>Withdraw consent for data processing (where applicable)</li>
              </ul>
              <p>
                Requests may be submitted using the contact details provided
                below.
              </p>
            </section>

            <section id="third-party-links" className="mb-10 space-y-4">
              <h2 className="text-xl font-semibold">11. Third-Party Links</h2>
              <p>
                The Website may contain links to third-party websites. Grihya is
                not responsible for the privacy practices, policies, or content
                of such external sites. Users are encouraged to review the
                privacy policies of third parties before providing personal
                information.
              </p>
            </section>

            <section id="children-privacy" className="mb-10 space-y-4">
              <h2 className="text-xl font-semibold">
                12. Children&apos;s Privacy
              </h2>
              <p>
                The Website is not intended for use by individuals under the age
                of 18. We do not knowingly collect personal data from minors. If
                such data is identified, it will be deleted promptly.
              </p>
            </section>

            <section id="changes" className="mb-10 space-y-4">
              <h2 className="text-xl font-semibold">
                13. Changes to This Privacy Policy
              </h2>
              <p>
                Grihya reserves the right to modify or update this Privacy
                Policy at any time. Changes will be effective upon posting on
                the Website. Continued use of the Website after updates
                constitutes acceptance of the revised Policy.
              </p>
            </section>

            <section id="governing-law" className="mb-10 space-y-4">
              <h2 className="text-xl font-semibold">
                14. Governing Law and Jurisdiction
              </h2>
              <p>
                This Privacy Policy shall be governed by and construed in
                accordance with the laws of India, and courts in India shall
                have exclusive jurisdiction.
              </p>
            </section>

            <section id="contact" className="mb-10 space-y-4">
              <h2 className="text-xl font-semibold">15. Contact Information</h2>
              <p>
                For any questions, concerns, or requests related to this Privacy
                Policy, please contact:
              </p>
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <p className="font-medium">Grihya</p>
                <p>
                  <span className="font-medium">Website:</span>{" "}
                  <a
                    href="https://grihya.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2DB8D1] hover:underline"
                  >
                    https://grihya.in/
                  </a>
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  <a
                    href="mailto:info@grihya.in"
                    className="text-[#2DB8D1] hover:underline"
                  >
                    info@grihya.in
                  </a>
                </p>
              </div>
            </section>

            <p className="mb-8 text-sm text-gray-600">
              Last Updated: {LAST_UPDATED}
            </p>

            <div className="mt-12">
              <a href="#top" className="text-sm text-[#2DB8D1] hover:underline">
                Back to top
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
