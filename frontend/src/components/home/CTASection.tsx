import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Blog from "../blog/Blog";
import { useNavigate } from "react-router-dom";

const CTASection: React.FC = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end end"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1.3, 1]);

  return (
    <div className="mx-auto max-w-7xl overflow-hidden rounded-xl bg-white px-4 md:px-0">
      <Blog />

      {/* Hero Section */}
      <div
        ref={heroRef}
        className="relative mt-20 h-[90vh] overflow-hidden rounded-xl md:h-[80vh]"
      >
        {/* Background Image */}
        <motion.div
          style={{ scale }}
          className="absolute inset-0 h-full w-full"
        >
          <div
            className="h-full w-full bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(rgba(31, 41, 55, 0.4), rgba(31, 41, 55, 0.6)), url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=1080&fit=crop')`,
            }}
          />
        </motion.div>

        {/* Content Overlay */}
        <div className="relative z-10 flex h-full items-center overflow-hidden rounded-3xl">
          <div className="container mx-auto px-4 sm:px-6 lg:px-12">
            <div className="grid items-center gap-5 md:gap-10 lg:grid-cols-6">
              {/* Left Column */}
              <div className="col-span-4 max-w-full text-white">
                <h1 className="mb-4 break-words text-3xl font-normal leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                  Find your dream place
                  <br />
                  <span className="font-light">with Grihya</span>
                </h1>

                <p className="mb-2 max-w-2xl break-words text-base font-light text-gray-200 sm:text-lg md:text-xl">
                  Luxury, comfort, and convenience — all in one place.
                </p>

                <p className="mb-5 max-w-2xl break-words text-base font-light text-gray-300 sm:text-lg">
                  Find the perfect place to call home — effortlessly.
                </p>

                <button
                  className="group mb-6 inline-flex items-center gap-2 rounded-[10px] bg-white px-4 py-3 text-lg font-light text-[#0E7873] transition hover:bg-gray-100"
                  onClick={() => navigate("/properties")}
                >
                  Explore Properties
                  <ArrowRight className="h-5 w-5 -rotate-45 transition-transform duration-500 group-hover:rotate-0" />
                </button>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {["Explore", "Inquire", "List", "Book"].map((item) => (
                    <button
                      key={item}
                      className="rounded-xl bg-[#E7F2F1] px-4 py-1 text-sm font-medium text-[#052A28] transition hover:bg-[#d9eceb]"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column */}
              <div className="col-span-2 w-full max-w-sm rounded-2xl bg-white/10 p-5 text-white backdrop-blur-md lg:ml-14">
                <h2 className="mb-4 break-words text-lg font-light italic leading-snug sm:text-xl md:text-2xl">
                  Discover your dream
                  <br />
                  home in the Andamans!
                </h2>

                <p className="break-words text-sm tracking-tight text-gray-200 sm:text-base">
                  From serene beachfront villas to modern island apartments,
                  explore exclusive properties today. Inquire now and make
                  paradise your address.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTASection;
