import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import {
  Layers,
  Palette,
  Sofa,
  Lamp,
  Brush,
  Hammer,
  MessageSquare,
  Ruler,
  LayoutTemplate,
  ClipboardCheck,
  Truck,
  Sparkles,
  Shield,
  Star,
  Quote,
  Phone,
  Mail,
  ArrowRight,
  ChevronDown,
  HelpCircle,
} from "lucide-react";

const InteriorServices: React.FC = () => {
  const navigate = useNavigate();
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  // Simple mount animations (fade-in + slight slide-up)
  const AnimCSS = () => (
    <style>{`
      @keyframes fade-in-up {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .animate-in { animation: fade-in-up .6s ease-out both; }
    `}</style>
  );

  const services = [
    {
      title: "Modular Kitchens",
      desc: "Functional layouts, premium finishes, optimized storage.",
      icon: Layers,
    },
    {
      title: "Wardrobes & Storage",
      desc: "Custom wardrobes, TV units, shoe racks, and more.",
      icon: Palette,
    },
    {
      title: "Living Room Designs",
      desc: "Layouts, color palettes, furniture and wall accents.",
      icon: Sofa,
    },
    {
      title: "False Ceiling & Lighting",
      desc: "Layered lighting, ambience and ceiling concepts.",
      icon: Lamp,
    },
    {
      title: "Full Home Interiors",
      desc: "End-to-end design and execution for your entire home.",
      icon: Brush,
    },
    {
      title: "Renovation",
      desc: "Makeovers, space planning, material upgrades and repairs.",
      icon: Hammer,
    },
  ];

  const process = [
    {
      step: "01",
      title: "Consultation & Brief",
      desc: "Understand your style, needs, and budget.",
      icon: MessageSquare,
    },
    {
      step: "02",
      title: "Site Visit & Measurement",
      desc: "Accurate dimensions and feasibility checks.",
      icon: Ruler,
    },
    {
      step: "03",
      title: "Concept & 3D Design",
      desc: "Visualize spaces with mood boards and 3D renders.",
      icon: LayoutTemplate,
    },
    {
      step: "04",
      title: "BOQ & Timeline",
      desc: "Transparent costing and project timeline.",
      icon: ClipboardCheck,
    },
    {
      step: "05",
      title: "Execution",
      desc: "Production, civil, electrical, and on-site work.",
      icon: Truck,
    },
    {
      step: "06",
      title: "Handover & Styling",
      desc: "Final touches, styling, and walkthrough.",
      icon: Sparkles,
    },
  ];

  const testimonials = [
    {
      name: "Amit & Priya",
      city: "Bengaluru",
      quote:
        "The 3D designs matched the final output. On-time delivery and great finish.",
      rating: 5,
    },
    {
      name: "Rahul S.",
      city: "Whitefield",
      quote:
        "Loved the kitchen storage planning. Team was proactive and professional.",
      rating: 5,
    },
    {
      name: "Sneha K.",
      city: "HSR Layout",
      quote:
        "Seamless experience from concept to handover. Highly recommended!",
      rating: 5,
    },
  ];

  const faqs = [
    {
      q: "How long does a typical project take?",
      a: (
        <p>
          Most modular scopes finish in 4–6 weeks after design freeze and
          payment milestones. Full‑home scopes may take 6–10 weeks depending on
          civil work.
        </p>
      ),
    },
    {
      q: "Do you provide 3D designs?",
      a: (
        <p>
          Yes. We provide mood boards and 3D visuals so you can visualize
          finishes, layouts, and lighting before execution.
        </p>
      ),
    },
    {
      q: "What brands and materials do you use?",
      a: (
        <p>
          We work with trusted boards, laminates, acrylic/PU/veneer finishes and
          premium hardware. Exact selection depends on your package and design
          specifications.
        </p>
      ),
    },
    {
      q: "Is there a warranty?",
      a: (
        <p>
          Yes. We provide standard warranties on modular fittings and hardware.
          Coverage details are shared along with the BOQ.
        </p>
      ),
    },
  ];

  const Stat = ({
    value,
    label,
    icon: Icon,
    delay = 0,
  }: {
    value: string;
    label: string;
    icon: React.ElementType;
    delay?: number;
  }) => (
    <div
      className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm animate-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="rounded-md bg-[#CCF0E1] p-2.5 text-[#2AB09C]">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-base font-semibold text-slate-900">{value}</div>
        <div className="text-xs text-slate-600">{label}</div>
      </div>
    </div>
  );

  const SectionHeader = ({
    title,
    subtitle,
    delay = 0,
  }: {
    title: string;
    subtitle?: string;
    delay?: number;
  }) => (
    <div
      className="mb-8 text-center animate-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <h2 className="relative inline-block pb-1 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
        {title}
        <span
          aria-hidden
          className="absolute -bottom-1 left-1/2 h-0.5 w-16 -translate-x-1/2 rounded-full bg-[#2AB09C]"
        />
      </h2>
      {subtitle && (
        <p className="mx-auto mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-600">
          {subtitle}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <AnimCSS />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="space-y-14 md:space-y-20">
          {/* Page header */}
          <div className="animate-in" style={{ animationDelay: "60ms" }}>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Go back"
                onClick={() => navigate(-1)}
                className="-ml-1 inline-flex h-9 w-9 cursor-pointer items-center justify-center bg-transparent text-gray-800 hover:text-gray-900 active:scale-95"
                title="Back"
              >
                <span className="text-2xl font-extrabold leading-none md:text-3xl">
                  <img src="/less_than_icon.png" alt="Back-Icon" />
                </span>
              </button>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Interior Services
              </h1>
            </div>
            <p className="mx-9 mt-3 max-w-3xl text-[15px] leading-relaxed text-slate-700">
              End‑to‑end interior solutions: modular kitchens, wardrobes, living
              rooms, lighting, and complete home interiors — with transparent
              BOQ and reliable timelines.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
            <Stat
              value="250+ homes"
              label="Delivered across Bengaluru"
              icon={Shield}
              delay={0}
            />
            <Stat
              value="4.8 / 5"
              label="Average client rating"
              icon={Star}
              delay={80}
            />
            <Stat
              value="40–60 days"
              label="Typical modular timeline"
              icon={Sparkles}
              delay={160}
            />
          </div>

          {/* Services */}
          <section>
            <SectionHeader
              title="What we do"
              subtitle="Full‑stack interior solutions — modular to bespoke."
              delay={0}
            />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
              {services.map(({ title, desc, icon: Icon }, i) => (
                <div
                  key={title}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition animate-in hover:-translate-y-0.5 hover:shadow-lg md:p-7"
                  style={{ animationDelay: `${100 + i * 70}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-[#CCF0E1] p-3 text-[#2AB09C]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-center text-[15px] font-semibold text-slate-900 sm:text-left md:text-base">
                        {title}
                      </h3>
                      <p className="mt-1.5 text-center text-[14px] leading-relaxed text-slate-600 sm:text-left">
                        {desc}
                      </p>
                    </div>
                  </div>
                  <div className="pointer-events-none mx-auto mt-5 h-0.5 w-12 rounded-full bg-[#E6F7F1] transition group-hover:bg-[#CCF0E1] sm:mx-0" />
                </div>
              ))}
            </div>
          </section>

          {/* Portfolio */}
          <section>
            <SectionHeader
              title="Recent projects"
              subtitle="A quick look at our kitchens, living rooms and wardrobes."
              delay={0}
            />
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
                {[
                  "image_1.jpg",
                  "image_2.jpg",
                  "image_3.jpg",
                  "image_4.jpg",
                  "image_5.jpg",
                  "image_6.jpg",
                ].map((src, i) => (
                  <div
                    key={i}
                    className="group relative overflow-hidden rounded-xl will-change-transform animate-in"
                    style={{ animationDelay: `${120 + i * 60}ms` }}
                  >
                    <img
                      src={src}
                      alt={`Project ${i + 1}`}
                      className="aspect-[4/3] w-full rounded-xl object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="duration-400 pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Process */}
          <section>
            <SectionHeader
              title="How we work"
              subtitle="A transparent workflow from brief to handover."
              delay={0}
            />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
              {process.map(({ step, title, desc, icon: Icon }, i) => (
                <div
                  key={step}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition animate-in hover:-translate-y-0.5 hover:shadow-lg md:p-7"
                  style={{ animationDelay: `${100 + i * 80}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-[#CCF0E1] p-3 text-[#2AB09C]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-center text-xs font-semibold text-[#2AB09C] md:text-left">
                        Step {step}
                      </div>
                      <h3 className="mt-0.5 text-center text-[15px] font-semibold text-slate-900 md:text-left md:text-base">
                        {title}
                      </h3>
                      <p className="mt-1.5 text-center text-[14px] leading-relaxed text-slate-600 md:text-left">
                        {desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-3 text-xs text-slate-600 md:mt-5">
              <Shield className="h-4 w-4 text-[#2AB09C]" />
              Transparent BOQ and documented timelines for every project.
            </div>
          </section>

          {/* Testimonials */}
          <section>
            <SectionHeader title="What clients say" delay={0} />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
              {testimonials.map((t, i) => (
                <div
                  key={t.name}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition animate-in hover:-translate-y-0.5 hover:shadow-lg md:p-7"
                  style={{ animationDelay: `${100 + i * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-center md:text-left">
                      <div className="text-sm font-semibold text-slate-900">
                        {t.name}
                      </div>
                      <div className="text-xs text-slate-600">{t.city}</div>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2 text-[14px] leading-relaxed text-slate-700">
                    <Quote className="mt-0.5 h-4 w-4 text-[#2AB09C]" />
                    <p>{t.quote}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ (styled like your shared component) */}
          <section className="rounded-2xl border border-gray-200 bg-white py-12 shadow-sm md:py-14">
            <div className="mx-auto max-w-5xl px-5 md:px-8">
              <div className="mx-auto max-w-3xl">
                <div className="mb-4 flex items-center justify-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#CCF0E1] text-[#2AB09C]">
                    <HelpCircle className="h-6 w-6" />
                  </div>
                </div>

                <div className="mb-10 text-center">
                  <h2 className="relative inline-block pb-1 text-2xl font-bold text-gray-900 md:text-3xl">
                    Frequently Asked Questions
                    <span
                      aria-hidden
                      className="absolute -bottom-2 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-[#2AB09C] md:w-28"
                    />
                  </h2>
                  <p className="mx-auto mt-5 max-w-2xl text-gray-600">
                    Answers to common questions about our interior services,
                    timelines, designs, and warranties.
                  </p>
                </div>

                <div className="divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 bg-white">
                  {faqs.map((item, idx) => {
                    const isOpen = faqOpen === idx;
                    const contentId = `faq-panel-${idx}`;
                    const btnId = `faq-button-${idx}`;
                    return (
                      <div
                        key={idx}
                        className="group animate-in"
                        style={{ animationDelay: `${80 + idx * 80}ms` }}
                      >
                        <button
                          id={btnId}
                          aria-controls={contentId}
                          aria-expanded={isOpen}
                          onClick={() => setFaqOpen(isOpen ? null : idx)}
                          className={`flex w-full items-center justify-between px-5 py-4 text-left transition-colors focus:outline-none md:px-6 md:py-5 ${
                            isOpen ? "bg-[#CCF0E1]" : "bg-white"
                          } hover:bg-gray-50`}
                        >
                          <span className="pr-4 font-medium text-gray-900">
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
                          className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
                            isOpen
                              ? "opacity-100"
                              : "pointer-events-none max-h-0 opacity-0"
                          }`}
                          style={{ maxHeight: isOpen ? 1000 : 0 }}
                        >
                          <div className="relative pb-6 pl-5 pr-5 pt-6 text-[14px] leading-relaxed text-gray-700 md:pl-6 md:pr-6">
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

          {/* Contact box */}
          <section>
            <div
              className="rounded-2xl border border-[#BFE9DC] bg-white p-6 shadow-sm animate-in md:p-7"
              style={{ animationDelay: "60ms" }}
            >
              <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
                <div className="w-full text-center md:w-auto md:text-left">
                  <h3 className="text-lg font-semibold text-slate-900 md:text-xl">
                    Ready to discuss your space?
                  </h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-slate-700">
                    Book a quick consult. We’ll share concepts, timelines, and
                    costing.
                  </p>
                </div>
                <div className="flex w-full justify-center gap-3 md:w-auto md:justify-end">
                  <a
                    href="mailto:interior@grihya.in?subject=Interior%20Services%20Enquiry"
                    className="inline-flex items-center gap-2 rounded-md bg-[#2AB09C] px-4 py-2.5 text-sm text-white transition hover:opacity-95"
                  >
                    <Mail className="h-4 w-4" /> Email us
                  </a>
                  <a
                    href="tel:+918448163874"
                    className="inline-flex items-center gap-2 rounded-md border border-[#2AB09C] px-4 py-2.5 text-sm text-[#2AB09C] transition hover:bg-[#EAF8F4]"
                  >
                    <Phone className="h-4 w-4" /> Call us
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default InteriorServices;
