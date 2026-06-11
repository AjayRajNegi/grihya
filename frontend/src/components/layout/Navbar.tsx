import { useState } from "react";
import { Menu, X, ChevronDown, UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
const navLinks = [
  { name: "Home", link: "/" },
  { name: "About", link: "/about" },
  { name: "Properties", link: "/properties" },
  { name: "Blogs", link: "/blog" },
];
export const Navbar = () => {
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPropertiesHovered, setIsPropertiesHovered] = useState(false);

  const auth = useAuth();
  const { isAuthenticated } = auth;

  return (
    <nav className="w-full bg-[#FAFCFE]">
      <div className="mx-auto max-w-7xl px-2 lg:px-12">
        <div className="-mb-[14px] flex h-16 items-center justify-between md:-mb-0 md:h-20">
          {/* Logo */}
          <div
            className="flex max-w-[160px] cursor-pointer items-center gap-2 object-contain md:hidden"
            onClick={() => navigate("/")}
          >
            <img src="/logo/GrihyaLogoWithName.png" />
          </div>
          <div
            className="hidden max-w-[340px] cursor-pointer items-center gap-2 overflow-clip rounded-[20px] object-contain md:flex"
            onClick={() => navigate("/")}
          >
            <img src="/logo/GrihyaLogoWithName.png" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="relative text-lg font-medium"
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
                    className="flex items-center gap-1 text-lg text-gray-900 transition-colors hover:text-[#2DB8D1]"
                    onClick={() => navigate(link.link)}
                  >
                    Properties
                    <ChevronDown className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(link.link)}
                    className="text-lg text-gray-900 transition-colors hover:text-[#2DB8D1]"
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
            {/* <button
              onClick={() => navigate("/account")}
              className="rounded-full bg-gray-900 px-6 py-3 text-white transition-colors hover:bg-gray-800"
            >
              Sign In
            </button> */}
            {isAuthenticated ? (
              <button
                onClick={() => navigate("/account")}
                className="rounded-full bg-gray-900 px-3 py-3 text-base font-medium text-white transition-colors hover:bg-gray-800"
              >
                <UserIcon />
              </button>
            ) : (
              <button
                onClick={() => navigate("/account")}
                className="rounded-full bg-gray-900 px-7 py-3 text-base font-medium text-white transition-colors hover:bg-gray-800"
              >
                Sign In
              </button>
            )}
            <button
              onClick={() => navigate("/contact")}
              className="rounded-full bg-[#2DB8D1] px-6 py-3 font-medium text-white transition-colors hover:bg-[#26a5bb]"
            >
              Contact Us
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 bg-[#ffffff] md:hidden">
            {isAuthenticated ? (
              <button
                onClick={() => navigate("/account")}
                className="rounded-full bg-gray-900 p-2 text-sm text-white transition-colors hover:bg-gray-800"
              >
                <UserIcon size={20} />
              </button>
            ) : (
              <button
                onClick={() => navigate("/account")}
                className="rounded-full bg-gray-900 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-800"
              >
                Sign In
              </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-full bg-[#2DB8D1] p-2 text-white transition-colors hover:bg-gray-100 hover:text-black"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
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
