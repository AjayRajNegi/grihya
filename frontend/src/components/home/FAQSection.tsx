import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

type FaqItem = { q: string; a: React.ReactNode };

const faqs: FaqItem[] = [
  {
    q: "What is EasyLease and how is it different from other portals?",
    a: (
      <p>
        EasyLease is a free property platform where owners/brokers can list
        unlimited properties and tenants can browse and connect - without any
        listing fees or subscriptions. It’s fast, simple, and truly free.
      </p>
    ),
  },
  {
    q: "Is EasyLease really free?",
    a: (
      <p>
        Yes. Listing, browsing, and contacting are free for everyone. EasyLease
        doesn’t charge listing fees, subscriptions, or commissions. Any
        brokerage fees (if you choose to engage a broker) are strictly between
        you and the broker, outside the platform.
      </p>
    ),
  },
  {
    q: "Do I need an account to use EasyLease?",
    a: (
      <p>
        Owners/Brokers: login/signup is required to create and manage listings.
        <br />
        Tenants: you can browse properties, and you’ll need to sign up or log in
        to view the owner/broker’s contact details and reach out.
      </p>
    ),
  },
  {
    q: "How do I sign up or log in?",
    a: (
      <p>
        Sign up with your email and password or continue with Google for one‑tap
        access. If you already have an account, just log in.
      </p>
    ),
  },
  {
    q: "I’m an owner/broker - how do I list a property?",
    a: (
      <div className="space-y-2">
        <p className="mb-1">Steps:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Create an account or log in.</li>
          <li>Click “List Property”.</li>
          <li>
            Fill in details (type, rent/sale, price, location, bedrooms,
            bathrooms, area, furnishing, amenities).
          </li>
          <li>Add photos and publish - your property goes live instantly.</li>
        </ul>
        <div className="pt-1">
          <Link to="/list-property" className="text-[#2AB09C] hover:underline">
            List your property →
          </Link>
        </div>
      </div>
    ),
  },
  {
    q: "Is there a limit to the number of properties I can list?",
    a: (
      <p>
        No. Owners and brokers can post unlimited listings - completely free.
      </p>
    ),
  },
  {
    q: "How long does it take for my listing to go live?",
    a: (
      <p>
        Instantly. There’s no manual review - click “List Property” and your
        listing is live.
      </p>
    ),
  },
  {
    q: "What photos can I upload?",
    a: (
      <div className="space-y-1">
        <p>
          Allowed formats: JPEG, JPG, PNG, WEBP, AVIF, HEIC, HEIF, GIF, BMP,
          TIFF. Max size per file: 15 MB.
        </p>
        <p className="text-gray-600">
          Tip: clear, well‑lit photos perform best. Include living area,
          bedrooms, kitchen, bathrooms, and building exterior.
        </p>
      </div>
    ),
  },
  {
    q: "I’m a tenant - how do I contact the owner or broker?",
    a: (
      <div>
        <p>
          Open the property you’re interested in and log in (or sign up if new).
          The owner/broker’s contact details (phone/email) will be visible -
          contact them directly, no middleman.
        </p>
        <div className="pt-1">
          <Link to="/properties" className="text-[#2AB09C] hover:underline">
            Browse properties →
          </Link>
        </div>
      </div>
    ),
  },
  {
    q: "Are owners/brokers and listings verified?",
    a: (
      <p>
        We don’t pre‑verify every listing or user before it goes live. We rely
        on community reporting to keep the platform clean. Please conduct your
        own due diligence - visit the property, verify documents, and avoid
        payments until you’re satisfied.
      </p>
    ),
  },
  {
    q: "Which cities does EasyLease support?",
    a: (
      <p>
        We’re available across India. Search by city/area and filter by budget
        and amenities.
      </p>
    ),
  },
  {
    q: "How can I find the right property faster?",
    a: (
      <p>
        Use filters: location, price range, property type, bedrooms, bathrooms,
        furnishing, and amenities (WiFi, Parking, Kitchen, Geyser, Fridge, RO,
        etc.). You can also type a locality/landmark and choose from
        suggestions.
      </p>
    ),
  },
  {
    q: "Can I edit or delete my listing?",
    a: (
      <p>
        Yes. Go to your account → My Listings → select a listing to edit
        details/photos or delete it. (Pause/hide is not available.)
      </p>
    ),
  },
  {
    q: "How do I update the contact information shown on my listings?",
    a: (
      <p>
        Update your phone/email in account settings, your listings will reflect
        the changes.
      </p>
    ),
  },
  {
    q: "How do I report a suspicious listing or user?",
    a: (
      <p>
        If you find any suspicious listing, email us at{" "}
        <a
          href="mailto:support@easylease.services"
          className="text-[#2AB09C] hover:underline"
        >
          support@easylease.services
        </a>
        . We treat such emails as high priority.
      </p>
    ),
  },
  {
    q: "Does EasyLease handle payments, agreements, or site visits?",
    a: (
      <p>
        No. EasyLease connects tenants with owners/brokers. All visits,
        payments, deposits, and agreements happen directly between you and the
        other party, outside the platform.
      </p>
    ),
  },
  {
    q: "Will EasyLease ever charge fees in the future?",
    a: (
      <p>
        Right now, everything is free. If we introduce optional paid features
        later, we’ll announce them clearly and give prior notice. Basic listing
        and browsing will remain accessible.
      </p>
    ),
  },
  {
    q: "Can brokers list on EasyLease?",
    a: (
      <p>
        Absolutely. Brokers can list unlimited properties for free, provided
        listings are accurate and not duplicates or misleading.
      </p>
    ),
  },
  {
    q: "Do you have a mobile app?",
    a: (
      <p>
        EasyLease works great on mobile browsers and desktop. You can access the
        full experience from your phone.
      </p>
    ),
  },
  {
    q: "How do I contact support?",
    a: (
      <p>
        Email us at{" "}
        <a
          href="mailto:support@easylease.services"
          className="text-[#2AB09C] hover:underline"
        >
          support@easylease.services
        </a>
        .
      </p>
    ),
  },
  {
    q: "Are there rules on what I can list?",
    a: (
      <p>
        Yes. List only real, available properties with accurate details and
        photos. No duplicates, misleading claims, or illegal content. We may
        remove listings that break these rules to protect users.
      </p>
    ),
  },
];

const FAQSection: React.FC = () => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-center mb-4">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#CCF0E1] text-[#2AB09C]">
              <HelpCircle className="h-6 w-6" />
            </div>
          </div>

          {/* Updated heading with accent underline and extra breathing room */}
          <div className="text-center mb-10">
            <h2 className="relative inline-block text-2xl md:text-3xl font-bold text-gray-900 pb-1">
              Frequently Asked Questions
              <span
                aria-hidden
                className="absolute left-1/2 -bottom-2 h-1 w-24 md:w-28 -translate-x-1/2 rounded-full bg-[#2AB09C]"
              />
            </h2>
            <p className="text-gray-600 mt-5 max-w-2xl mx-auto">
              Answers to common questions about using EasyLease - listing is
              free, browsing is free.
            </p>
          </div>

          <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white overflow-hidden">
            {faqs.map((item, idx) => {
              const isOpen = open === idx;
              const contentId = `faq-panel-${idx}`;
              const btnId = `faq-button-${idx}`;
              return (
                <div key={idx} className="group">
                  <button
                    id={btnId}
                    aria-controls={contentId}
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : idx)}
                    className={`w-full flex items-center justify-between text-left px-4 sm:px-6 py-4 sm:py-5 focus:outline-none transition-colors
                    ${isOpen ? "bg-[#CCF0E1]" : "bg-white"} hover:bg-gray-50`}
                  >
                    <span className="font-medium text-gray-900 pr-4">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-[#2AB09C] transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    id={contentId}
                    role="region"
                    aria-labelledby={btnId}
                    aria-hidden={!isOpen}
                    className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out
                      ${
                        isOpen
                          ? "max-h-[1000px] opacity-100"
                          : "max-h-0 opacity-0 pointer-events-none"
                      }`}
                  >
                    <div className="relative pl-5 sm:pl-6 pr-4 text-gray-700 pb-6 pt-6">
                      <span
                        aria-hidden
                        className="absolute inset-y-0 left-0 w-0.5 bg-[#2AB09C]"
                      />
                      {item.a}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
