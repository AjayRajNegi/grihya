import CTASection from "@/components/home/CTASection";
import { motion, Variants } from "framer-motion";

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
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const imageVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function About() {
  return (
    <>
      {/* Hero Section */}
      <div className="mx-auto my-8 max-w-7xl overflow-hidden bg-white">
        {/* Header Section */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center px-4 md:mx-auto md:px-6 lg:px-12"
        >
          <div className="mb-6 flex w-fit items-center gap-2 rounded-full bg-[#f2f7ff] px-3 py-1 md:px-4 md:py-2">
            <span className="text-sm font-medium text-[#2671ff] md:text-base">
              About Us
            </span>
          </div>

          <h1 className="max-w-3xl text-pretty text-center text-4xl font-medium tracking-tighter text-gray-900 md:text-5xl">
            Connect with our experts and bring your
            <span className="text-[#2DB8D1]"> Real Estate </span>
            ideas to life
          </h1>
        </motion.div>

        <motion.div
          className="relative mx-auto mt-[46px] grid h-[100vh] max-w-7xl grid-cols-1 grid-rows-7 gap-4 overflow-hidden px-6 md:h-[80vh] md:grid-cols-2 md:grid-rows-4 md:px-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.img
            src="/images/about/Hero1.png"
            className="col-span-1 row-span-2 h-full w-full rounded-3xl object-cover md:row-span-4"
            variants={imageVariants}
          />

          <motion.img
            src="/images/about/Hero2.png"
            className="col-span-1 row-span-3 h-full w-full rounded-3xl object-cover md:col-start-2 md:row-span-2"
            variants={imageVariants}
          />

          <motion.img
            src="/images/about/Hero3.png"
            className="col-span-1 row-span-2 h-full w-full rounded-3xl object-cover md:col-start-2"
            variants={imageVariants}
          />
        </motion.div>
      </div>

      {/* CTA */}
      <CTASection />
    </>
  );
}
