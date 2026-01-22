import React from "react";
import { Check } from "lucide-react";
import { motion, Variants } from "framer-motion";

interface Feature {
  title: string;
  description: string;
}

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

const imageVariants: Variants = {
  hidden: { opacity: 0, scale: 1.05 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 1.4,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.2,
    },
  },
};

const featureVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const WhyChooseUsSection: React.FC = () => {
  const features: Feature[] = [
    {
      title: "Your First heading - Why Grihya is better",
      description:
        "Extensive experience and insights into the perfect local market.",
    },
    {
      title: "Second quesion - Personalized Service",
      description: "This can be a beneficial factor",
    },
    {
      title: "Something to bring traction to further section?",
      description: "Something not to vauge but precise.",
    },
  ];

  return (
    <div className="mx-auto my-8 mb-0 max-w-7xl overflow-hidden">
      {/* Header Section */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="px-4 md:mx-auto md:px-6 lg:px-12"
      >
        <div className="mb-1 flex items-center gap-2 md:mb-6">
          <div className="h-2 w-2 rounded-sm bg-cyan-500"></div>
          <span className="text-base font-medium text-gray-700">
            Why choose us?
          </span>
        </div>

        <h1 className="max-w-4xl text-4xl tracking-tighter text-gray-900 md:text-5xl">
          What makes us the right partner for <br /> your real estate?
        </h1>
      </motion.div>

      <div className="relative mx-auto h-[65vh] max-w-7xl overflow-hidden md:h-screen">
        {/* Background Image */}
        <motion.div
          variants={imageVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="absolute inset-5 md:inset-12"
        >
          <img
            src="/images/home/Choose.png"
            alt="Modern architecture"
            className="h-full w-full rounded-3xl object-cover"
          />
        </motion.div>

        {/* Overlay Card */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform lg:left-auto lg:right-20 lg:translate-x-0"
        >
          <div className="shadow-3xl w-[330px] space-y-8 rounded-3xl bg-white p-4 py-6 tracking-tight md:w-[380px] md:p-6 md:py-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={featureVariants}
                className="flex gap-2 md:gap-4"
              >
                {/* Checkmark Icon */}
                <div className="mt-1 flex-shrink-0">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
                    <Check className="h-4 w-4 text-blue-400" strokeWidth={3} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="mb-2 text-base font-[400] text-gray-900 md:text-lg">
                    {feature.title}
                  </h3>
                  <p className="text:xs leading-relaxed text-gray-500 md:text-sm">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WhyChooseUsSection;
