import { useNavigate } from "react-router-dom";
import { motion, Variants } from "framer-motion";

export function Options() {
  const router = useNavigate();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section className="max-w-8xl relative mx-auto bg-[#FAFCFE] px-4 pt-[40px] md:px-0">
      <div className="mx-auto w-[95%] overflow-hidden text-black md:w-[90%]">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-3xl font-normal md:text-4xl"
        >
          Get started with exploring real estate options
        </motion.h2>

        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-5 grid gap-6 md:grid-cols-3 md:gap-10"
        >
          {/* House */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            className="rounded-2xl"
          >
            <img
              src="/images/home/Option1.avif"
              className="h-[200px] w-full cursor-pointer rounded-2xl object-cover transition-all duration-300 hover:shadow-2xl"
              onClick={() => router("/properties")}
            />
            <h6
              className="mt-2 cursor-pointer text-2xl font-semibold text-[#2DB8D1]"
              onClick={() => router("/properties")}
            >
              House
            </h6>
            <p className="text-lg leading-5 text-black">
              Find your perfect house — comfort and convenience await
            </p>
          </motion.div>

          {/* Apartment */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            className="rounded-2xl"
          >
            <img
              src="/images/home/Option2.avif"
              className="h-[200px] w-full cursor-pointer rounded-2xl object-cover transition-all duration-300 hover:shadow-2xl"
              onClick={() => router("/properties")}
            />
            <h6
              className="mt-2 cursor-pointer text-2xl font-semibold text-[#2DB8D1]"
              onClick={() => router("/properties")}
            >
              Apartment
            </h6>
            <p className="text-lg leading-5 text-black">
              Browse our selection of stunning apartments.
            </p>
          </motion.div>

          {/* Business Space */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            className="rounded-2xl"
          >
            <img
              src="/images/home/Option3.avif"
              className="h-[200px] w-full cursor-pointer rounded-2xl object-cover transition-all duration-300 hover:shadow-2xl"
              onClick={() => router("/properties")}
            />
            <h6
              className="mt-2 cursor-pointer text-2xl font-semibold text-[#2DB8D1]"
              onClick={() => router("/properties")}
            >
              Business Space
            </h6>
            <p className="text-lg leading-5 text-black">
              Explore a variety of professional spaces tailored to elevate your
              business.
            </p>
          </motion.div>
        </motion.section>
      </div>
    </section>
  );
}
