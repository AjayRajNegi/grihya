import { motion, Variants } from "framer-motion";

interface Feature {
  title: string;
  image: string;
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
      duration: 1.8,
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
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};
export default function AmenitiesSection() {
  const features: Feature[] = [
    {
      title: "Cleanliness",
      image: "/images/about/Cleanliness.png",
    },
    {
      title: "High speed network",
      image: "/images/about/HighSpeed.png",
    },
    {
      title: "Full time security & work",
      image: "/images/about/FullSecurity.png",
    },
    {
      title: "Cleanliness strictly",
      image: "/images/about/Cleanliness.png",
    },
    {
      title: "Gym and store",
      image: "/images/about/Gym.png",
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
        <div className="mb-6 flex items-center gap-2">
          <div className="h-2 w-2 rounded-sm bg-cyan-500"></div>
          <span className="text-base font-medium text-gray-700">Amenities</span>
        </div>

        <h1 className="max-w-4xl text-4xl font-medium tracking-tighter text-gray-900 md:text-5xl">
          Discover exceptional amenities <br /> for a luxurious lifestyle
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
          className="absolute left-1/2 top-36 -translate-x-1/2 -translate-y-1/2 transform md:top-40 lg:left-auto lg:right-20 lg:translate-x-0"
        >
          <div className="w-[310px] space-y-4 rounded-3xl bg-[#2DB8D1] p-4 py-6 tracking-tight md:w-[300px] md:p-6 md:py-6">
            <p className="text-xl text-white">Including:</p>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={featureVariants}
                className="flex items-center gap-2 md:gap-5"
              >
                <img src={feature.image} className="h-5" />
                <h3 className="flex items-center text-base font-medium text-white md:text-lg">
                  {feature.title}
                </h3>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
