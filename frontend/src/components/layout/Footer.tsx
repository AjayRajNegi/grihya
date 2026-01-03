import React from "react";
import { motion, Variants } from "framer-motion";
import { Facebook, Linkedin, Twitter } from "lucide-react";

const Footer: React.FC = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const socialVariants: Variants = {
    hover: {
      scale: 1.1,
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
    tap: { scale: 0.95 },
  };

  const quickLinks = ["Home", "About Us", "Our Agents", "Contact Us", "FAQ"];
  const mainPages = ["Properties", "Blogs"];
  return (
    <footer className="bg-white">
      <motion.div
        className="mx-auto max-w-6xl px-6 pb-6 pt-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-12 lg:grid-cols-5">
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="lg:col-span-3">
            <h2 className="mb-6 text-4xl font-medium leading-tight text-gray-900">
              Discover Real state from <br /> your own Ease!
            </h2>
            <div className="flex gap-3">
              <motion.a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded bg-blue-100 text-[#3D81FF] transition-colors hover:bg-[#3D81FF] hover:text-white"
                variants={socialVariants}
                whileHover="hover"
                whileTap="tap"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </motion.a>
              <motion.a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded bg-blue-100 text-[#3D81FF] transition-colors hover:bg-[#3D81FF] hover:text-white"
                variants={socialVariants}
                whileHover="hover"
                whileTap="tap"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </motion.a>
              <motion.a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded bg-blue-100 text-[#3D81FF] transition-colors hover:bg-[#3D81FF] hover:text-white"
                variants={socialVariants}
                whileHover="hover"
                whileTap="tap"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </motion.a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h3 className="mb-3 text-xl font-normal text-gray-900 md:mb-6">
              Quick Links
            </h3>
            <ul className="space-y-1.5 md:space-y-3">
              {quickLinks.map((link, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <a
                    href="#"
                    className="text-base text-gray-600 transition-colors hover:text-gray-900"
                  >
                    {link}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Main Pages */}
          <motion.div variants={itemVariants}>
            <h3 className="mb-3 text-xl font-normal text-gray-900 md:mb-6">
              Main Pages
            </h3>
            <ul className="space-y-1.5 md:space-y-3">
              {mainPages.map((link, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <a
                    href="#"
                    className="text-base text-gray-600 transition-colors hover:text-gray-900"
                  >
                    {link}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-gray-200 pt-4 md:mt-12 md:flex-row md:gap-4 md:pt-8"
          variants={itemVariants}
        >
          <p className="text-sm text-gray-600">Copyright @2024 Grihya</p>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Developed by Redsan</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0L0 8h8v8l8-8H8V0z" />
            </svg>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;
