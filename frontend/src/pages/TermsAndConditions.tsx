import { Footer } from "@/utils/import";
import { ArrowLeft } from "lucide-react";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LAST_UPDATED = "February 5, 2026";

const TermsAndConditions: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Terms & Conditions • Grihya";
  }, []);

  return (
    <div id="top" className="min-h-screen bg-gray-50 text-gray-900">
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
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
            Terms and Conditions of Use
          </h1>
        </div>

        <section className="flex flex-col gap-5 md:flex-row-reverse">
          {/* Table of Contents */}
          <div className="mb-10 h-fit min-w-[30%] rounded-[10px] border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-lg font-semibold">Contents</h2>
            <ol className="ml-5 list-decimal space-y-1 text-sm sm:text-base">
              <li>
                <a className="text-[#2DB8D1] hover:underline" href="#intro">
                  Introduction and Acceptance of Terms
                </a>
              </li>
              <li>
                <a
                  className="text-[#2DB8D1] hover:underline"
                  href="#nature-scope"
                >
                  Nature and Scope of Services
                </a>
              </li>
              <li>
                <a className="text-[#2DB8D1] hover:underline" href="#rera">
                  Regulatory Disclosure (RERA)
                </a>
              </li>
              <li>
                <a
                  className="text-[#2DB8D1] hover:underline"
                  href="#eligibility"
                >
                  Eligibility
                </a>
              </li>
              <li>
                <a
                  className="text-[#2DB8D1] hover:underline"
                  href="#user-responsibilities"
                >
                  User Responsibilities and Acceptable Use
                </a>
              </li>
              <li>
                <a
                  className="text-[#2DB8D1] hover:underline"
                  href="#property-disclaimer"
                >
                  Property Information and Listings Disclaimer
                </a>
              </li>
              <li>
                <a
                  className="text-[#2DB8D1] hover:underline"
                  href="#user-submissions"
                >
                  User Submissions and Communications
                </a>
              </li>
              <li>
                <a className="text-[#2DB8D1] hover:underline" href="#ip-rights">
                  Intellectual Property Rights
                </a>
              </li>
              <li>
                <a
                  className="text-[#2DB8D1] hover:underline"
                  href="#third-party"
                >
                  Third-Party Links and Services
                </a>
              </li>
              <li>
                <a className="text-[#2DB8D1] hover:underline" href="#no-advice">
                  No Professional Advice
                </a>
              </li>
              <li>
                <a
                  className="text-[#2DB8D1] hover:underline"
                  href="#limitation-of-liability"
                >
                  Limitation of Liability
                </a>
              </li>
              <li>
                <a
                  className="text-[#2DB8D1] hover:underline"
                  href="#indemnification"
                >
                  Indemnification
                </a>
              </li>
              <li>
                <a
                  className="text-[#2DB8D1] hover:underline"
                  href="#suspension-termination"
                >
                  Suspension and Termination
                </a>
              </li>
              <li>
                <a
                  className="text-[#2DB8D1] hover:underline"
                  href="#modifications"
                >
                  Modifications to Terms
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
              <h2 className="text-xl font-semibold">
                1. Introduction and Acceptance of Terms
              </h2>
              <p>
                Welcome to Grihya (&quot;we,&quot; &quot;our,&quot; or
                &quot;us&quot;). These Terms of Service (&quot;Terms&quot;)
                govern your access to and use of the website https://grihya.in
                and all associated webpages, content, features, and services
                (collectively, the &quot;Website&quot;).
              </p>
              <p>
                By accessing, browsing, or using the Website in any manner, you
                acknowledge that you have read, understood, and agree to be
                legally bound by these Terms, our Privacy Policy, and any other
                policies referenced herein. If you do not agree with any part of
                these Terms, you must immediately discontinue use of the
                Website.
              </p>
            </section>

            <section id="nature-scope" className="mb-10 space-y-4">
              <h2 className="text-xl font-semibold">
                2. Nature and Scope of Services
              </h2>
              <p>
                Grihya operates as a real estate–focused informational and
                lead-generation platform. The Website provides:
              </p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Property-related information and marketing content</li>
                <li>Project descriptions and indicative listings</li>
                <li>Blogs, articles, and educational materials</li>
                <li>Inquiry and contact facilitation features</li>
              </ul>
              <p>
                Unless expressly stated in writing. No content on the Website
                constitutes a legally binding offer, contract, or solicitation.
              </p>
            </section>

            <section id="rera" className="mb-10 space-y-4">
              <h2 className="text-xl font-semibold">
                3. Regulatory Disclosure (RERA)
              </h2>
              <p>
                All real estate projects, listings, images, and representations
                displayed on the Website are subject to state-specific real
                estate laws and regulations.
              </p>
              <p>
                Users are advised to independently verify all project details,
                RERA registration numbers, approvals, and compliance status with
                the respective State Real Estate Regulatory Authority before
                making any decision.
              </p>
            </section>

            <section id="eligibility" className="mb-10 space-y-4">
              <h2 className="text-xl font-semibold">4. Eligibility</h2>
              <p>To use the Website, you must:</p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Be at least 18 years of age</li>
                <li>
                  Have the legal capacity to enter into binding agreements under
                  Indian law
                </li>
              </ul>
              <p>
                By using the Website, you represent and warrant that you meet
                these requirements.
              </p>
            </section>

            <section id="user-responsibilities" className="mb-10 space-y-4">
              <h2 className="text-xl font-semibold">
                5. User Responsibilities and Acceptable Use
              </h2>
              <p>
                You agree to use the Website only for lawful and legitimate
                purposes. You shall not:
              </p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Provide false, misleading, or inaccurate information</li>
                <li>
                  Attempt unauthorized access to the Website or its systems
                </li>
                <li>
                  Copy, scrape, reproduce, or exploit Website content without
                  permission
                </li>
                <li>
                  Upload or transmit malicious code, spam, or harmful material
                </li>
                <li>
                  Use the Website in a manner that disrupts its operation or
                  security
                </li>
              </ul>
              <p>
                Grihya reserves the right to restrict or terminate access for
                violations of these Terms.
              </p>
            </section>

            <section id="property-disclaimer" className="mb-10 space-y-4">
              <h2 className="text-xl font-semibold">
                6. Property Information and Listings Disclaimer
              </h2>
              <p>
                All property-related content on the Website is provided for
                informational and marketing purposes only and may include:
              </p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Indicative images, layouts, and descriptions</li>
                <li>Approximate pricing or availability information</li>
              </ul>
              <p>Such information:</p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Is subject to change without notice</li>
                <li>May contain inaccuracies or omissions</li>
                <li>
                  Does not constitute an advertisement, offer, or agreement
                  under RERA
                </li>
              </ul>
              <p>
                Grihya makes no representations or warranties regarding the
                completeness, accuracy, or reliability of property information.
              </p>
            </section>

            <section id="user-submissions" className="mb-10 space-y-4">
              <h2 className="text-xl font-semibold">
                7. User Submissions and Communications
              </h2>
              <p>
                By submitting inquiries, forms, or other information through the
                Website, you:
              </p>
              <ul className="ml-6 list-disc space-y-1">
                <li>
                  Confirm that the information provided is accurate and lawful
                </li>
                <li>
                  Consent to being contacted by Grihya via email, phone, or
                  other communication methods
                </li>
                <li>
                  Acknowledge that submission does not create any contractual
                  obligation
                </li>
              </ul>
              <p>
                Grihya does not guarantee responses, follow-ups, or successful
                transactions.
              </p>
            </section>

            <section id="ip-rights" className="mb-10 space-y-4">
              <h2 className="text-xl font-semibold">
                8. Intellectual Property Rights
              </h2>
              <p>All Website content, including but not limited to:</p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Text, graphics, images, and videos</li>
                <li>Design, layout, and user interface</li>
                <li>Trademarks, logos, and branding</li>
              </ul>
              <p>
                is owned by or licensed to Grihya and is protected under Indian
                intellectual property laws.
              </p>
              <p>
                No content may be copied, modified, distributed, or commercially
                exploited without prior written consent.
              </p>
            </section>

            <section id="third-party" className="mb-10 space-y-4">
              <h2 className="text-xl font-semibold">
                9. Third-Party Links and Services
              </h2>
              <p>
                The Website may contain links to third-party websites or
                services. Grihya:
              </p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Does not control or endorse third-party content</li>
                <li>
                  Is not responsible for third-party privacy practices,
                  accuracy, or availability
                </li>
              </ul>
              <p>Accessing third-party links is at your own risk.</p>
            </section>

            <section id="no-advice" className="mb-10 space-y-4">
              <h2 className="text-xl font-semibold">
                10. No Professional Advice
              </h2>
              <p>
                All content provided on the Website is for general informational
                purposes only and does not constitute:
              </p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Legal advice</li>
                <li>Financial or investment advice</li>
                <li>Real estate or tax advice</li>
              </ul>
              <p>
                Users should consult qualified professionals before making
                decisions based on Website content.
              </p>
            </section>

            <section id="limitation-of-liability" className="mb-10 space-y-4">
              <h2 className="text-xl font-semibold">
                11. Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by applicable law, Grihya shall
                not be liable for:
              </p>
              <ul className="ml-6 list-disc space-y-1">
                <li>
                  Any direct, indirect, incidental, consequential, or special
                  damages
                </li>
                <li>
                  Loss of data, profits, business opportunities, or goodwill
                </li>
                <li>
                  Errors, interruptions, delays, or Website unavailability
                </li>
              </ul>
              <p>Your use of the Website is entirely at your own risk.</p>
            </section>

            <section id="indemnification" className="mb-10 space-y-4">
              <h2 className="text-xl font-semibold">12. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless Grihya, its affiliates,
                and representatives from any claims, losses, liabilities, or
                expenses arising from:
              </p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Your use or misuse of the Website</li>
                <li>Violation of these Terms</li>
                <li>Infringement of any third-party rights</li>
              </ul>
            </section>

            <section id="suspension-termination" className="mb-10 space-y-4">
              <h2 className="text-xl font-semibold">
                13. Suspension and Termination
              </h2>
              <p>Grihya reserves the right, at its sole discretion, to:</p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Suspend or terminate access to the Website</li>
                <li>Modify or discontinue any part of the Website</li>
              </ul>
              <p>
                without prior notice, particularly in cases of Terms violations
                or legal requirements.
              </p>
            </section>

            <section id="modifications" className="mb-10 space-y-4">
              <h2 className="text-xl font-semibold">
                14. Modifications to Terms
              </h2>
              <p>
                Grihya may revise these Terms at any time. Updated Terms will be
                effective upon posting on the Website. Continued use of the
                Website constitutes acceptance of the revised Terms.
              </p>
            </section>

            <section id="governing-law" className="mb-10 space-y-4">
              <h2 className="text-xl font-semibold">
                15. Governing Law and Jurisdiction
              </h2>
              <p>
                These Terms shall be governed by and construed in accordance
                with the laws of India, and courts located in India shall have
                exclusive jurisdiction.
              </p>
            </section>

            <section id="contact" className="mb-10 space-y-4">
              <h2 className="text-xl font-semibold">16. Contact Information</h2>
              <p>
                For any questions or concerns regarding these Terms, please
                contact:
              </p>
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <p className="font-medium">Grihya</p>
                <p>
                  <span className="font-medium">Website:</span>{" "}
                  <a
                    href="https://grihya.in"
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
                    href="mailto:contact@grihya.in"
                    className="text-[#2DB8D1] hover:underline"
                  >
                    contact@grihya.in
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

export default TermsAndConditions;
