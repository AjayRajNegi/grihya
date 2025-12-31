import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPropertiesHovered, setIsPropertiesHovered] = useState(false);

  const navigate = useNavigate();
  const navLinks = [
    { name: "Home", link: "/" },
    { name: "About", link: "/about" },
    { name: "Properties", link: "/properties" },
    { name: "Blogs", link: "/blog" },
  ];
  // shadow-md shadow-[#2DB8D1]/30
  return (
    <nav className="w-full bg-[#FFFFFF]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div
            className="flex max-w-32 cursor-pointer items-center gap-2 object-contain"
            onClick={() => navigate("/")}
          >
            <img src="/logo/GrihyaLogoWithName.png" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="relative text-base font-medium"
                onMouseEnter={() =>
                  link.name === "Properties" && setIsPropertiesHovered(true)
                }
                onMouseLeave={() =>
                  link.name === "Properties" && setIsPropertiesHovered(false)
                }
              >
                {/* Main Nav Item */}
                {link.name === "Properties" ? (
                  <button
                    type="button"
                    className="flex items-center gap-1 text-base text-gray-900 transition-colors hover:text-[#2DB8D1]"
                    onClick={() => navigate(link.link)}
                  >
                    Properties
                    <ChevronDown className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(link.link)}
                    className="text-base text-gray-900 transition-colors hover:text-[#2DB8D1]"
                  >
                    {link.name}
                  </button>
                )}

                {/* Properties Dropdown */}
                {link.name === "Properties" && (
                  <AnimatePresence>
                    {isPropertiesHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-1/2 top-full z-50 mt-2 w-32 -translate-x-1/2 overflow-hidden rounded-2xl border border-gray-100 bg-white p-1 text-base shadow-lg"
                      >
                        <button
                          onClick={() => navigate("/properties?for=sale")}
                          className="block w-full rounded-2xl px-2 py-3 text-left text-black transition-colors hover:bg-[#2DB8D1] hover:text-white"
                        >
                          For Sale
                        </button>

                        <button
                          onClick={() => navigate("/properties?for=rent")}
                          className="block w-full rounded-2xl px-2 py-3 text-left text-black transition-colors hover:bg-[#2DB8D1] hover:text-white"
                        >
                          For Rent
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Buttons */}
          <div className="hidden items-center gap-4 md:flex">
            <button
              onClick={() => navigate("/account")}
              className="rounded-full bg-gray-900 px-6 py-3 text-white transition-colors hover:bg-gray-800"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="rounded-full bg-[#2DB8D1] px-6 py-3 text-white transition-colors hover:bg-[#26a5bb]"
            >
              Contact Us
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 bg-[#ffffff] md:hidden">
            <button
              onClick={() => navigate("/account")}
              className="rounded-full bg-gray-900 px-6 py-3 text-sm text-white transition-colors hover:bg-gray-800"
            >
              Sign In
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-full bg-[#2DB8D1] p-2 text-white transition-colors hover:bg-gray-100 hover:text-black"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            transition={{
              duration: 0.3,
            }}
            className="overflow-hidden md:hidden"
          >
            <div className="space-y-2 px-4 py-4">
              {navLinks.map((link, index) => (
                <motion.button
                  key={link.name}
                  initial={{
                    opacity: 0,
                    x: -20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: index * 0.1,
                  }}
                  onClick={() => navigate(link.link)}
                  className="block w-full py-3 text-center text-lg text-gray-900 transition-colors hover:text-[#2DB8D1]"
                >
                  {link.name}
                </motion.button>
              ))}
              <motion.button
                initial={{
                  opacity: 0,
                  x: -20,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: navLinks.length * 0.1,
                }}
                onClick={() => {
                  navigate("/contact");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full rounded-full bg-[#2DB8D1] py-3 text-white transition-colors hover:bg-[#26a5bb]"
              >
                Contact Us
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
