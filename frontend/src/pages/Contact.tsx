import ContactHero from "@/components/contact/ContactHero";
import { Variants, motion } from "framer-motion";
import ChatWithUs from "./ChatWithUs";

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
export default function Contact() {
  return (
    <div className="mx-auto mt-5 w-full max-w-7xl px-5">
      <ContactHero />
      {/* Header Section */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-36 flex flex-col items-center justify-center px-4 md:mx-auto md:mt-8 md:px-6 lg:px-12"
      >
        <div className="mb-6 flex w-fit items-center gap-2 rounded-full bg-[#f2f7ff] px-3 py-1 md:px-4 md:py-2">
          <span className="text-sm font-medium text-[#2671ff] md:text-base">
            Contact Us
          </span>
        </div>

        <h1 className="max-w-3xl text-pretty text-center text-4xl font-medium tracking-tighter text-gray-900 md:text-5xl">
          Get in touch with us today for expert
          <span className="text-[#2DB8D1]"> assistance </span>
        </h1>
      </motion.div>

      <ChatWithUs />
    </div>
  );
}
