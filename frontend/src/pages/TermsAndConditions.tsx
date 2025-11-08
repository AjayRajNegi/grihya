import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';   // <-- adjust path if needed
import Footer from '../components/layout/Footer';   // <-- adjust path if needed

const LAST_UPDATED = 'September 1, 2025';

const TermsAndConditions: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Terms & Conditions • EasyLease';
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
            EasyLease: Terms and Conditions of Use
          </h1>
        </div>

        <p className="text-sm text-gray-600 mb-8">Last Updated: {LAST_UPDATED}</p>

        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-8 text-gray-700">
          Please read these Terms and Conditions carefully before using the EasyLease platform.
        </div>

        {/* Table of Contents */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-10">
          <h2 className="text-lg font-semibold mb-3">Contents</h2>
          <ol className="list-decimal ml-5 space-y-1 text-sm sm:text-base">
            <li><a className="text-[#2AB09C] hover:underline" href="#acceptance-of-terms">Acceptance of Terms</a></li>
            <li><a className="text-[#2AB09C] hover:underline" href="#services-and-platform">Definition of Services & Nature of Platform</a></li>
            <li><a className="text-[#2AB09C] hover:underline" href="#eligibility-and-account">User Eligibility and Account Registration</a></li>
            <li><a className="text-[#2AB09C] hover:underline" href="#free-service-and-financial">Free Service Model and Financial Disclaimers</a></li>
            <li><a className="text-[#2AB09C] hover:underline" href="#user-conduct">User Conduct and Obligations</a></li>
            <li><a className="text-[#2AB09C] hover:underline" href="#ip-rights">Intellectual Property Rights</a></li>
            <li><a className="text-[#2AB09C] hover:underline" href="#privacy-policy">Privacy Policy</a></li>
            <li><a className="text-[#2AB09C] hover:underline" href="#disclaimer">Disclaimer of Warranties</a></li>
            <li><a className="text-[#2AB09C] hover:underline" href="#limitation-of-liability">Limitation of Liability</a></li>
            <li><a className="text-[#2AB09C] hover:underline" href="#indemnification">Indemnification</a></li>
            <li><a className="text-[#2AB09C] hover:underline" href="#termination">Termination</a></li>
            <li><a className="text-[#2AB09C] hover:underline" href="#governing-law">Governing Law and Jurisdiction</a></li>
            <li><a className="text-[#2AB09C] hover:underline" href="#grievance-officer">Grievance Officer</a></li>
            <li><a className="text-[#2AB09C] hover:underline" href="#miscellaneous">Miscellaneous</a></li>
          </ol>
        </div>

        {/* Verbatim content */}
        <section id="acceptance-of-terms" className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
          <p>
            Welcome to EasyLease ("Platform," "Site," "we," "us," "our"), accessible at www.easylease.services and its associated mobile applications. These Terms and Conditions of Use ("Terms") constitute a legally binding agreement between you ("User," "you," "your") and EasyLease governing your access to and use of this Platform and all content, functionality, and services offered on or through EasyLease.
          </p>
          <p>
            By accessing, browsing, or using the EasyLease platform in any manner, you acknowledge that you have read, understood, and unconditionally agree to be bound by these terms. If you do not agree to all of these terms and conditions, you are expressly prohibited from using the site and must discontinue use immediately.
          </p>
          <p>
            Supplemental terms and conditions or documents that may be posted on the site from time to time are hereby expressly incorporated herein by reference. We reserve the right, in our sole discretion, to make changes or modifications to these Terms at any time and for any reason. We will alert you about any changes by updating the "Last Updated" date of these Terms, and you waive any right to receive specific notice of each such change. It is your responsibility to periodically review these Terms to stay informed of updates. You will be subject to, and will be deemed to have been made aware of and to have accepted, the changes in any revised Terms by your continued use of the Platform after the date such revised Terms are posted.
          </p>
        </section>

        <section id="services-and-platform" className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">2. Definition of Services & Nature of Platform</h2>
          <h3 className="font-medium"> 2.1. Service Description: </h3>
          <p>
            EasyLease provides a digital marketplace that facilitates connections between individuals and/or entities seeking to list, rent, lease, or find residential and commercial properties ("Listers") and individuals and/or entities seeking to identify, view, and potentially rent or lease such properties ("Seekers"). The services ("Services") include, but are not limited to:
          </p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Hosting user-generated property listings, including descriptions, photographs, and contact information.</li>
            <li> Providing search tools and filters for Seekers to browse listings.</li>
            <li>  Enabling communication between Listers and Seekers through the Platform.</li>
            <li>Offering ancillary services designed to assist in the rental process (e.g., facilitation of tenant verification, legal documentation, etc.).</li>
          </ul>
          <h3 className="font-medium"> 2.2. Platform Role – Disclaimer: </h3>
          <p>
            EasyLease acts solely as an intermediary and a hosting platform. We are not a real estate broker, agent, or insurer. We are not a party to any rental, lease, or other agreement between Users. We do not own, sell, or manage the properties listed on the site. We do not endorse any User, property, or listing. We are not involved in the actual transaction between Listers and Seekers.
          </p>
        </section>

        <section id="eligibility-and-account" className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">3. User Eligibility and Account Registration</h2>
          <h3 className="font-medium">3.1. Eligibility: </h3>
          <p>
            To use the EasyLease Platform, you must be at least eighteen (18) years of age and possess the legal authority, right, and capacity to enter into these Terms and to use the Platform in accordance with all terms and conditions herein.
          </p>
          <h3 className="font-medium"> 3.2. Account Registration: </h3>
          <p> To access certain features of the Platform, you must register to create an account ("Account"). You agree to:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Provide accurate, current, and complete information during the registration process ("Registration Data").</li>
            <li>Maintain and promptly update your Registration Data to keep it accurate, current, and complete.</li>
            <li>Maintain the security and confidentiality of your password and not disclose it to any third party.</li>
            <li>Accept sole responsibility for all activities that occur under your Account and username.</li>
            <li>Notify us immediately of any unauthorized use of your Account or any other breach of security.</li>
            <li>Ensure that you log out from your Account at the end of each session.</li>
          </ul>
          <p>
            You may not create an Account for anyone other than yourself without their express permission. You may not use a username that is the name of another person with the intent to impersonate that person, or that is subject to any rights of another person without appropriate authorization.
          </p>
        </section>

        <section id="free-service-and-financial" className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">4. Free Service Model and Financial Disclaimers</h2>
          <h3 className="font-medium">4.1. No Fees: </h3>
          <p>
            The core services of the EasyLease Platform—including account registration, property listing, browsing, and basic communication—are provided to all users free of charge. EasyLease does not currently charge any listing fees, subscription fees, success fees, or commissions.
          </p>
          <h3 className="font-medium"> 4.2. No Involvement in Transactions: </h3>
          <p>
            EasyLease is not a party to any rental or lease agreement negotiated between Users. All financial arrangements, including security deposits, rent payments, brokerage fees (if any, agreed upon outside the Platform), and other monetary transactions, are conducted solely between the Lister and the Seeker, outside of the EasyLease Platform.
          </p>
          <h3 className="font-medium"> 4.3. Absolute Disclaimer of Financial Liability: </h3>
          <p>You acknowledge and agree that EasyLease is not responsible for, and shall have no liability in relation to, any financial transactions between Users. This includes, but is not limited to:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Disputes over security deposit returns.</li>
            <li>Non-payment or late payment of rent.</li>
            <li>Fraudulent payment activities.</li>
            <li>Quality of the property or services rendered.</li>
            <li>Any fees or commissions agreed upon between a User and a third-party broker or agent. </li>
          </ul>
          <p>
            Users are solely responsible for verifying the identity and credentials of other Users and for ensuring that all payment transactions are secure and conducted through reliable and traceable methods.
          </p>
        </section>

        <section id="user-conduct" className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">5. User Conduct and Obligations</h2>
          <h3 className="font-medium"> 5.1. General Conduct: </h3>
          <p> You agree to use the Platform only for lawful purposes and in accordance with these Terms. You agree not to use the Platform:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>In any way that violates any applicable federal, state, local, or international law or regulation.</li>
            <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way.</li>
            <li>To transmit, or procure the sending of, any advertising or promotional material without our prior written consent, including any "junk mail," "chain letter," "spam," or any other similar solicitation.</li>
            <li>To impersonate or attempt to impersonate EasyLease, an EasyLease employee, another user, or any other person or entity.</li>
            <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Platform, or which, as determined by us, may harm EasyLease or users of the Platform or expose them to liability.</li>
          </ul>

          <h3 className="font-medium"> 5.2. Content Standards: </h3>
          <p> You are solely responsible for all content, including text, images, photos, audio, video, and other materials ("Content"), that you upload, post, publish, or display on the Platform. You represent and warrant that you own or have the necessary rights to all Content you submit and that such Content does not:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Infringe, misappropriate, or violate a third party's patent, copyright, trademark, trade secret, moral rights, or other intellectual property rights, or rights of publicity or privacy.</li>
            <li>Violate, or encourage any conduct that would violate, any applicable law or regulation or would give rise to civil liability.</li>
            <li>Contain false, misleading, or deceptive information.</li>
            <li>Promote illegal activities or are fraudulent.</li>
            <li>Contain any material that is defamatory, obscene, pornographic, indecent, abusive, offensive, harassing, violent, hateful, inflammatory, or otherwise objectionable.</li>
            <li>Involve commercial activities or sales without our express written consent, such as contests, sweepstakes, or other sales promotions.</li>
          </ul>

          <h3 className="font-medium"> 5.3. Property Listing Warranties: </h3>
          <p> As a Lister, you represent and warrant that:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>You hold all necessary rights, title, and interest to the property listed, including the authority to offer it for rent or lease.</li>
            <li>All information provided in the listing is accurate, complete, and not misleading, including but not limited to the property's size, amenities, condition, availability, and rental price.</li>
            <li>You will deal with inquiries from Seekers in a timely, professional, and honest manner.</li>
          </ul>

          <h3 className="font-medium"> 5.4. Seeker Obligations: </h3>
          <p> As a Seeker, you agree to:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Provide accurate information in your profile and communications.</li>
            <li>Deal with Listers in a respectful and professional manner.</li>
            <li>
              Exercise your own independent judgment and perform your own due diligence before entering into any agreement. This includes physically inspecting the property, verifying ownership/rights of the Lister, reviewing all legal documents (e.g., lease agreements), and ensuring the terms are acceptable to you.
            </li>
          </ul>
        </section>

        <section id="ip-rights" className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">6. Intellectual Property Rights</h2>
          <h3 className="font-medium"> 6.1. Platform IP: </h3>
          <p>
            The Platform and its entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by EasyLease, its licensors, or other providers of such material and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
          </p>
          <h3 className="font-medium"> 6.2. Limited License: </h3>
          <p>
            Subject to your compliance with these Terms, EasyLease grants you a limited, non-exclusive, non-transferable, non-sublicensable, and revocable license to access and use the Platform for your personal, non-commercial use.
          </p>
          <h3 className="font-medium"> 6.3. User-Generated Content License: </h3>
          <p>
            By posting, uploading, or submitting any Content to the Platform, you grant EasyLease a worldwide, perpetual, irrevocable, non-exclusive, royalty-free, fully-paid, transferable, and sub-licensable license to use, copy, modify, create derivative works based upon, distribute, publicly display, publicly perform, and otherwise exploit such Content in any form, medium, or technology now known or later developed, for the purposes of operating, promoting, and improving the Platform.
          </p>
          <p>
            You waive any and all moral rights to such Content. You represent and warrant that you have all rights necessary to grant us this license.
          </p>
        </section>

        <section id="privacy-policy" className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">7. Privacy Policy</h2>
          <p>
            Your privacy is important to us. Our Privacy Policy, which is incorporated into these Terms by reference, describes how we collect, use, and share your personal information when you use our Platform. By using the Platform, you consent to the practices described in our Privacy Policy.
          </p>
        </section>

        <section id="disclaimer" className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">8. Disclaimer of Warranties</h2>
          <p>
            Your use of the platform and its content is at your own risk. The platform and all content are provided on an "as is" and "as available" basis, without any warranties of any kind, either express or implied. Neither EasyLease nor any person associated with EasyLease makes any warranty or representation with respect to the completeness, security, reliability, quality, accuracy, or availability of the platform.
          </p>
          <p>
            Without limiting the foregoing, neither EasyLease nor anyone associated with the company represents or warrants that the platform will be accurate, reliable, error-free, or uninterrupted, that defects will be corrected, that the platform or the server that makes it available are free of viruses or other harmful components, or that the platform will otherwise meet your needs or expectations.
          </p>
          <p>
            EasyLease hereby disclaims all warranties of any kind, whether express or implied, statutory, or otherwise, including but not limited to any warranties of merchantability, non-infringement, and fitness for a particular purpose.
          </p>
        </section>

        <section id="limitation-of-liability" className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">9. Limitation of Liability</h2>
          <p>
            To the fullest extent provided by law, in no event shall EasyLease, its affiliates, or their licensors, service providers, employees, agents, officers, or directors be liable for damages of any kind, under any legal theory, arising out of or in connection with your use, or inability to use, the platform, any websites linked to it, any content on the platform or such other websites, including any direct, indirect, special, incidental, consequential, or punitive damages, including but not limited to, personal injury, pain and suffering, emotional distress, loss of revenue, loss of profits, loss of business or anticipated savings, loss of use, loss of goodwill, loss of data, and whether caused by tort (including negligence), breach of contract, or otherwise, even if foreseeable.
          </p>
          <p>
            The foregoing does not affect any liability which cannot be excluded or limited under applicable law.
          </p>
        </section>

        <section id="indemnification" className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">10. Indemnification</h2>
          <p>
            You agree to defend, indemnify, and hold harmless EasyLease, its affiliates, licensors, and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of the Platform, including, but not limited to: (i) your User Contributions; (ii) your interaction with any other User; (iii) your violation of any third-party right, including without limitation any copyright, property, or privacy right; or (iv) any claim that your Content caused damage to a third party. This indemnification obligation will survive the termination of your Account and these Terms.
          </p>
        </section>

        <section id="termination" className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">11. Termination </h2>
          <h3 className="font-medium">11.1. By You:</h3>
          <p>You may deactivate your Account at any time by contacting us or using the tools provided within your Account settings.</p>
          <h3 className="font-medium">11.2. By Us:</h3>
          <p>We may, in our sole discretion and without liability:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Suspend or terminate your Account and your access to the Platform for any reason, including without limitation, if we believe you have violated these Terms.</li>
            <li>Change, suspend, or discontinue all or any part of the Platform at any time.</li>
            <li>Remove or refuse to post any Content for any or no reason.</li>
          </ul>
          <p>
            Upon termination, all licenses and rights granted to you will cease immediately. Provisions of these Terms which, by their nature, should survive termination (including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability) shall survive any termination.
          </p>
        </section>

        <section id="governing-law" className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">12. Governing Law and Jurisdiction</h2>
          <p>
            These Terms and your use of the Platform shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles. Any legal action or proceeding arising under these Terms will be brought exclusively in the courts located in New Delhi, India, and you hereby irrevocably consent to the personal jurisdiction and venue of such courts.
          </p>
        </section>

        <section id="grievance-officer" className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">13. Grievance Officer</h2>
          <p> In accordance with the Information Technology Act, 2000 and rules made thereunder, the name and contact details of the Grievance Officer are provided below:</p>
          <div className="rounded-lg border border-gray-200 p-4 bg-white">
            <p><span className="font-medium">Email:</span> support@easylease.services</p>
            <p><span className="font-medium">Phone:</span> 8448163874</p>
          </div>
          <p className="text-sm text-gray-600">
            You may contact the Grievance Officer to report any violations of these Terms or to resolve any complaints regarding the Platform or any Content.
          </p>
        </section>

        <section id="miscellaneous" className="space-y-4 mb-10">
          <h2 className="text-xl font-semibold">14. Miscellaneous</h2>
          <p><span className="font-medium"> 14.1. Entire Agreement:</span> These Terms, together with our Privacy Policy, constitute the sole and entire agreement between you and EasyLease regarding the Platform and supersede all prior and contemporaneous understandings, agreements, representations, and warranties, both written and oral, regarding the Platform.</p>
          <p><span className="font-medium"> 14.2. Severability:</span> If any provision of these Terms is held by a court or other tribunal of competent jurisdiction to be invalid, illegal, or unenforceable for any reason, such provision shall be eliminated or limited to the minimum extent such that the remaining provisions of the Terms will continue in full force and effect.</p>
          <p><span className="font-medium">14.3. No Waiver:</span> No waiver by EasyLease of any term or condition outlined in these Terms shall be deemed a further or continuing waiver of such term or condition or a waiver of any other term or condition, and any failure of EasyLease to assert a right or provision under these Terms shall not constitute a waiver of such right or provision.</p>
          <p><span className="font-medium">14.4. Contact Information:</span> For any questions about these Terms, please contact us at [Insert your general contact email address].</p>
          <p className="italic text-gray-600">Your Easy Way to Find a Place to Call Home.</p>
        </section>

        <div className="mt-12">
          <a href="#top" className="text-sm text-[#2AB09C] hover:underline">Back to top</a>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsAndConditions;