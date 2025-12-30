import { motion, Variants } from "framer-motion";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Step {
  id: number;
  title: string;
  description: string;
  image: string;
}

const AdvantagesSection: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const steps: Step[] = [
    {
      id: 0,
      title: "Find Your Ideal Property",
      description:
        "Browse our extensive listings, filter by location, price, and features to discover your perfect home",
      image: "/images/home/Advantages1.png",
    },
    {
      id: 1,
      title: "Schedule a Viewing",
      description:
        "Easily book a property tour online at a time that suits you, or request a virtual walkthrough",
      image: "/images/home/Advantages2.png",
    },
    {
      id: 2,
      title: "Secure Your Deal",
      description:
        "Make an offer or apply for financing through our website, and let our experts guide you",
      image: "/images/home/Advantages3.avif",
    },
  ];

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.2,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto mt-8 lg:mt-12">
      {/* Header Section */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mx-auto flex flex-col items-center justify-center"
      >
        <div className="flex items-center  gap-2 mb-6">
          <div className="w-2 h-2 bg-cyan-500 rounded-sm"></div>
          <span className="text-base font-medium text-gray-700">
            How it work
          </span>
        </div>

        <h1 className="text-3xl lg:text-4xl text-center md:text-5xl tracking-tighter text-gray-900 mb-8 max-w-4xl">
          Discover the <span className="text-[#2DB8D1]">advantages</span> and
          <br />
          exclusive benefits
        </h1>
      </motion.div>
      <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:px-12 py-6 md:py-8 lg:py-12">
        {/* Left side - Steps */}
        <div className="flex-1 space-y-8">
          {steps.map((step) => (
            <div
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`cursor-pointer transition-all duration-700 ease-in-out pl-6 border-l-4 md:pt-2 flex flex-col justify-center ${
                activeStep === step.id
                  ? "border-cyan-500"
                  : "border-transparent"
              }`}
            >
              <h2
                className={`text-xl md:text-2xl font-light mb-4 transition-colors duration-700 ease-in-out tracking-tight ${
                  activeStep === step.id ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {step.title}
              </h2>
              <p
                className={`text-base md:text-xl transition-colors duration-700 ease-in-out tracking-tight ${
                  activeStep === step.id ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Right side - Image */}
        <div className="flex-1">
          <div className="relative aspect-[4/3.5] h-[80vw] md:h-[70vw] lg:h-[450px] rounded-[30px] overflow-hidden shadow-2xl">
            {steps.map((step) => (
              <img
                key={step.id}
                src={step.image}
                alt={step.title}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                  activeStep === step.id ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvantagesSection;
