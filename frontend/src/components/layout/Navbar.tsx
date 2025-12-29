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
    { name: "Blogs", link: "/blogs" },
  ];
  return (
    <nav className="w-full bg-[#FFFFFF] shadow-md shadow-[#2DB8D1]/30 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div
            className="flex items-center gap-2 object-contain max-w-32 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img src="/logo/GrihyaLogoWithName.png" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
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
                    className="text-gray-900 text-base hover:text-[#2DB8D1] transition-colors flex items-center gap-1"
                    onClick={() => navigate(link.link)}
                  >
                    Properties
                    <ChevronDown className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(link.link)}
                    className="text-gray-900 text-base hover:text-[#2DB8D1] transition-colors"
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
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-32 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 z-50 p-1 text-base"
                      >
                        <button
                          onClick={() => navigate("/")}
                          className="block text-left w-full px-2 py-3 rounded-2xl  hover:bg-[#2DB8D1] text-black hover:text-white  transition-colors"
                        >
                          For Sale
                        </button>

                        <button
                          onClick={() => navigate("/")}
                          className="block text-left w-full px-2 py-3 rounded-2xl  hover:bg-[#2DB8D1] text-black hover:text-white  transition-colors"
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
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => navigate("/account")}
              className="px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="px-6 py-3 bg-[#2DB8D1] text-white rounded-full hover:bg-[#26a5bb] transition-colors"
            >
              Contact Us
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex bg-[#ffffff] md:hidden items-center gap-3">
            <button
              onClick={() => navigate("/account")}
              className="px-6 py-3 bg-gray-900 text-white rounded-full text-sm hover:bg-gray-800 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-full text-white hover:bg-gray-100 transition-colors bg-[#2DB8D1] hover:text-black"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 " />
              ) : (
                <Menu className="w-6 h-6 " />
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
            className="md:hidden overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
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
                  className="block w-full text-center py-3 text-gray-900 text-lg hover:text-[#2DB8D1] transition-colors"
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
                className="w-full py-3 bg-[#2DB8D1] text-white rounded-full hover:bg-[#26a5bb] transition-colors"
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
