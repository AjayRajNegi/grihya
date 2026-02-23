import { motion, Variants } from "framer-motion";
import { Calendar } from "lucide-react";
import BlogSection from "../components/blog/Blog";
import { useNavigate } from "react-router-dom";
import { ScrollToTop } from "@/utils/import";

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

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function AllBlogs() {
  const navigate = useNavigate();
  const currentDate = new Date(Date.now());
  const formattedDate = new Intl.DateTimeFormat("default", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(currentDate);
  return (
    <>
      <ScrollToTop />
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
          <div className="mb-6 flex w-fit items-center gap-2 rounded-full bg-[#f2f7ff] px-4 py-2">
            <span className="text-base font-medium text-[#2671ff]">Blogs</span>
          </div>

          <h1 className="max-w-4xl text-center text-4xl tracking-tighter text-gray-900 md:text-5xl">
            Explore expert perspectives that inspire smarter decisions.
          </h1>
        </motion.div>

        <div className="relative mx-auto h-[65vh] max-w-7xl overflow-hidden md:h-[90vh]">
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
            onClick={() =>
              navigate(
                "/blog/how-to-choose-the-right-real-estate-agent-for-your-needs",
              )
            }
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform cursor-pointer shadow-xl transition-transform duration-500 hover:scale-110 md:top-[70%] lg:left-auto lg:right-20 lg:translate-x-0"
          >
            <div className="shadow-3xl w-[330px] space-y-8 rounded-3xl bg-white p-4 py-6 tracking-tight md:w-[480px] md:p-6 md:py-8">
              <div className="mb-6 flex w-fit items-center gap-2 rounded-full bg-[#f2f7ff] px-4 py-2">
                <span className="text-base font-medium text-[#2671ff]">
                  Resources
                </span>
              </div>
              <h1 className="text-3xl">
                The ultimate guides for your first purchase.
              </h1>
              <p className="flex gap-3 text-gray-500">
                <Calendar size={20} /> {formattedDate}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Blog Section */}
      <BlogSection
        title="Top Articles on buying a"
        highlight="House"
        description="Editors' top picked blogs on House Related Properties"
      />

      {/* CTA Section */}
      <section className="mx-auto mt-12 max-w-7xl px-6 md:px-12">
        <motion.div
          variants={containerVariants}
          whileInView="visible"
          initial="hidden"
          viewport={{ once: true, amount: 0.4 }}
          className="flex flex-col items-center justify-center gap-8 rounded-[30px] bg-[#2DB8D1] py-[100px] text-white"
        >
          <motion.h3
            variants={fadeUp}
            className="text-xl font-medium tracking-tighter md:text-2xl"
          >
            Want to Book a Call?
          </motion.h3>
          <motion.h1
            variants={fadeUp}
            className="s mx-auto max-w-3xl text-center text-4xl font-medium tracking-tighter md:text-5xl"
          >
            Ready to make your step in real state? Book Now.
          </motion.h1>
          <motion.button
            variants={fadeUp}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-full bg-white px-5 py-3 text-sm tracking-tight text-black md:text-base"
            onClick={() => navigate("/properties")}
          >
            View Properties
          </motion.button>
        </motion.div>
      </section>
    </>
  );
}
