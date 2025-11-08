import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import HeroSection from '../components/home/HeroSection';
import FeaturedListings from '../components/home/FeaturedListings';
import FAQSection from '../components/home/FAQSection';
import Blog from '../components/blog/Blog';
import { ArrowRightIcon, HomeIcon, BuildingIcon, UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [role, setRole] = useState<'tenant' | 'owner'>('tenant');

  const [heroCoords, setHeroCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const title =
      'Buy your dream home | sell your property faster | find the ideal space for rent';
    const description =
      'Find your perfect home or tenant with EasyLease. Browse thousands of 100% verified properties for sale and rent across India. Connect directly with owners. Safe, simple, and secure.';

    const currentUrl = (typeof window !== 'undefined' ? window.location.href : 'https://easylease.services/') || 'https://easylease.services/';
    const ogImage = 'https://easylease.services/og-default.jpg';

    document.title = title;
    upsertMetaByName('description', description);

    upsertMetaByProperty('og:title', title);
    upsertMetaByProperty('og:description', description);
    upsertMetaByProperty('og:type', 'website');
    upsertMetaByProperty('og:url', currentUrl);
    upsertMetaByProperty('og:image', ogImage);

    upsertMetaByName('twitter:card', 'summary_large_image');
    upsertMetaByName('twitter:title', title);
    upsertMetaByName('twitter:description', description);
    upsertMetaByName('twitter:image', ogImage);

    upsertLinkCanonical('https://easylease.services/');
  }, []);

  const stepsTenant = [
    {
      title: 'Search Properties',
      desc: 'Browse thousands of listings with smart filters to find your perfect match.',
      icon: (
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#CCF0E1] text-[#2AB09C] ring-1 ring-teal-200">
          <SearchIcon className="h-7 w-7" />
        </div>
      ),
    },
    {
      title: 'Connect with Owners',
      desc: 'Contact owners directly without intermediaries or brokerage fees.',
      icon: (
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#CCF0E1] text-[#2AB09C] ring-1 ring-teal-200">
          <UserIcon className="h-7 w-7" />
        </div>
      ),
    },
    {
      title: 'Move In',
      desc: 'Schedule visits, finalize terms and move in with confidence.',
      icon: (
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#CCF0E1] text-[#2AB09C] ring-1 ring-teal-200">
          <HomeIcon className="h-7 w-7" />
        </div>
      ),
    },
  ];

  const stepsOwner = [
    {
      title: 'List Your Property',
      desc: 'Add details, photos, pricing and publish your listing for free.',
      icon: (
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#CCF0E1] text-[#2AB09C] ring-1 ring-teal-200">
          <HomeIcon className="h-7 w-7" />
        </div>
      ),
    },
    {
      title: 'Get Leads Directly',
      desc: 'Tenants contact you directly - no middlemen, no platform fee.',
      icon: (
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#CCF0E1] text-[#2AB09C] ring-1 ring-teal-200">
          <UserIcon className="h-7 w-7" />
        </div>
      ),
    },
    {
      title: 'Close Faster',
      desc: 'Schedule visits, negotiate, and close the deal quickly.',
      icon: (
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#CCF0E1] text-[#2AB09C] ring-1 ring-teal-200">
          <BuildingIcon className="h-7 w-7" />
        </div>
      ),
    },
  ];

  useEffect(() => {
    // console.log('[Home] heroCoords changed:', heroCoords);
  }, [heroCoords]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Get coords from HeroSection */}
      <HeroSection onLocationReady={setHeroCoords} />

      {/* Only show nearby (10 km) once we have coords */}
      <FeaturedListings coords={heroCoords} radiusMeters={20000} />

      {/* Browse by Property Type */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="relative inline-block text-2xl md:text-3xl font-bold text-gray-900">
              Browse by Property Type
              <span
                aria-hidden
                className="absolute left-1/2 -bottom-2 h-1 w-24 md:w-28 -translate-x-1/2 rounded-full bg-[#2AB09C]"
              />
            </h2>
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.4, ease: 'easeOut', staggerChildren: 0.07 },
              },
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <BrowseCard
              to="/properties?type=pg"
              icon={
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#CCF0E1] text-[#2AB09C] shadow-sm">
                  <BuildingIcon className="h-8 w-8" />
                </div>
              }
              title="PG Accommodations"
              desc="Affordable shared living spaces with amenities"
              cta="Browse PGs"
            />
            <BrowseCard
              to="/properties?type=flat"
              icon={
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#CCF0E1] text-[#2AB09C] shadow-sm">
                  <BuildingIcon className="h-8 w-8" />
                </div>
              }
              title="Apartments & Flats"
              desc="Modern apartments with security and amenities"
              cta="Browse Flats"
            />
            <BrowseCard
              to="/properties?type=house"
              icon={
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#CCF0E1] text-[#2AB09C] shadow-sm">
                  <HomeIcon className="h-8 w-8" />
                </div>
              }
              title="Independent Houses"
              desc="Spacious homes with privacy and freedom"
              cta="Browse Houses"
            />
            <BrowseCard
              to="/properties?type=commercial"
              icon={
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#CCF0E1] text-[#2AB09C] shadow-sm">
                  <BuildingIcon className="h-8 w-8" />
                </div>
              }
              title="Commercial Spaces"
              desc="Office spaces and retail properties for business"
              cta="Browse Commercial"
            />
          </motion.div>
        </div>
      </section>

      {/* How It Works with role toggle */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="relative inline-block text-2xl md:text-3xl font-bold text-gray-900">
              How It Works
              <span
                aria-hidden
                className="absolute left-1/2 -bottom-2 h-1 w-20 md:w-24 -translate-x-1/2 rounded-full bg-[#2AB09C]"
              />
            </h2>
          </div>

          {/* Toggle */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-xl border border-teal-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setRole('tenant')}
                className={`px-4 py-2 text-sm rounded-lg transition ${role === 'tenant' ? 'bg-[#2AB09C] text-white' : 'text-slate-700 hover:bg-slate-50'
                  }`}
              >
                For Tenants
              </button>
              <button
                type="button"
                onClick={() => setRole('owner')}
                className={`px-4 py-2 text-sm rounded-lg transition ${role === 'owner' ? 'bg-[#2AB09C] text-white' : 'text-slate-700 hover:bg-slate-50'
                  }`}
              >
                For Owners & Brokers
              </button>
            </div>
          </div>

          <motion.div
            key={role}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {(role === 'tenant' ? stepsTenant : stepsOwner).map((s, i) => (
              <StepCard key={s.title} step={`${i + 1}`} icon={s.icon} title={s.title} desc={s.desc} />
            ))}
          </motion.div>

          <div className="mt-8 text-center">
            <Link
              to={`/guide?role=${role}`}
              className="inline-flex items-center gap-2 text-[#125A4F] hover:text-[#0e4a41] font-medium"
              title="See full guide"
            >
              Still confused? See step-by-step guide
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      <Blog />
      {/* CTA Section – improved */}
      <section className="py-16 bg-gradient-to-br from-[#2AB09C] to-[#1e8e7e] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto text-center max-w-3xl">
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-sm">
                No brokerage
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg:white/10 border border-white/20 px-3 py-1 text-sm">
                Direct leads
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Own a Property? List it on EasyLease</h2>
            <p className="text-lg opacity-95 mb-6">
              Get discovered by thousands of active tenants. Publish in minutes and start receiving direct calls and
              messages - no platform fee.
            </p>
            <ul className="text-left sm:text-center list-none space-y-2 text:white/95 mb-8">
              <li>• Unlimited listings at ₹0</li>
              <li>• Boosted visibility in search</li>
              <li>• Get direct leads - No middleman</li>
            </ul>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link
                to="/list-property"
                className="inline-flex items-center justify-center bg-white text-[#2AB09C] px-6 py-3 rounded-md font-semibold hover:bg-transparent hover:text-white border border-white transition-colors"
              >
                List Your Property
              </Link>
              <Link
                to="/guide?role=owner"
                className="inline-flex items-center justify-center bg-transparent text-white px-6 py-3 rounded-md font-semibold border border-white/70 hover:bg-white/10 transition-colors"
              >
                How listing works
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FAQSection />
    </div>
  );
};

/* -------------------- UI helpers -------------------- */

const BrowseCard = ({
  to,
  icon,
  title,
  desc,
  cta,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  cta: string;
}) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 14, scale: 0.98 },
      show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: 'easeOut' } },
    }}
  >
    <Link to={to} className="group block focus:outline-none">
      <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-emerald-200/60 via-teal-200/40 to-cyan-200/50 transition">
        <div className="relative rounded-2xl bg-white p-6 text-center ring-1 ring-slate-200 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background:
                'radial-gradient(140px 70px at 50% 0%, rgba(42,176,156,0.08), transparent 70%)',
            }}
          />
          <div className="relative">
            <div className="mx-auto mb-4 transform transition-transform duration-300 group-hover:-translate-y-0.5">
              {icon}
            </div>
            <h3 className="text-lg font-semibold mb-2 text-slate-900">{title}</h3>
            <p className="text-gray-600 mb-4">{desc}</p>
            <span className="text-[#2AB09C] inline-flex items-center justify-center font-medium">
              {cta}
              <ArrowRightIcon className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
);

const StepCard = ({
  step,
  icon,
  title,
  desc,
}: {
  step: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 14 },
      show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    }}
    className="relative bg-white p-6 rounded-xl shadow-md ring-1 ring-slate-200"
  >
    <div className="absolute -top-3 -left-3 rounded-full bg-[#CCF0E1] text-[#2AB09C] text-xs font-semibold px-2 py-1 shadow-sm">
      Step {step}
    </div>

    <div className="flex flex-col items-center text-center md:items-start md:text-left">
      {icon}
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-gray-600">{desc}</p>
    </div>
  </motion.div>
);

/* Local Search icon used in How It Works */
const SearchIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.3-4.3"></path>
  </svg>
);

// -- Head tag helpers (no Helmet needed) --
function upsertMetaByName(name: string, content: string) {
  const head = document.head || document.getElementsByTagName('head')[0];
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertMetaByProperty(property: string, content: string) {
  const head = document.head || document.getElementsByTagName('head')[0];
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLinkCanonical(href: string) {
  const head = document.head || document.getElementsByTagName('head')[0];
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    head.appendChild(link);
  }
  link.setAttribute('href', href);
}

export default Home;