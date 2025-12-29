import { motion, Variants } from "framer-motion";
import { useNavigate } from "react-router-dom";

const cards = [
  {
    img: "/images/home/Vision1.png",
    title: "Dream Home",
    text: "Discover your ideal living space with our premium featured real estate listings.",
  },
  {
    img: "/images/home/Vision2.png",
    title: "Smart Investment",
    text: "Secure high-value, future-ready property and investment opportunities today.",
  },
  {
    img: "/images/home/Vision3.png",
    title: "Luxury Living",
    text: "Explore exclusive, sophisticated properties tailored to your perfect lifestyle.",
  },
  {
    img: "/images/home/Vision4.png",
    title: "Luxury Living",
    text: "Explore exclusive, sophisticated properties tailored to your perfect lifestyle.",
  },
];

export default function ValueSection() {
  const navigate = useNavigate();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.35,
      },
    },
  };

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

  return (
    <div className="min-h-screen max-w-7xl px-6 md:px-12 bg-white py-16 mx-auto">
      {/* Header Section */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mx-auto"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 bg-cyan-500 rounded-sm"></div>
          <span className="text-base font-medium text-gray-700">
            Our Vision
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl tracking-tighter text-gray-900 mb-8 max-w-4xl">
          The values that drive everything we do
        </h1>

        <button
          className="bg-gray-900 text-white px-7 py-3 rounded-full text-base hover:bg-gray-800 transition-colors tracking-tighter"
          onClick={() => navigate("/about")}
        >
          Learn more
        </button>
      </motion.div>

      {/* Cards Section */}
      <motion.div className="max-w-7xl mx-auto mt-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            whileHover={{ y: -6 }}
            transition={{ delay: index * 0.15 }} // optional stagger
            className="flex flex-col"
          >
            <div>
              <img src={card.img} alt={card.title} />
            </div>
            <h2 className="text-xl text-center md:text-left md:text-2xl tracking-tight text-gray-900 mb-2 mt-4 font-medium">
              {card.title}
            </h2>
            <p className="text-gray-500 text-lg text-center md:text-left leading-normal">
              {card.text}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
