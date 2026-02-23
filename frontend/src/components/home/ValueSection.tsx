import { motion, Variants } from "framer-motion";

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
    <div className="mx-auto min-h-screen max-w-7xl bg-white px-6 py-16 md:px-12">
      {/* Header Section */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mx-auto"
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-sm bg-cyan-500"></div>
          <span className="text-base font-medium text-gray-700">
            Our Vision
          </span>
        </div>

        <h1 className="mb-8 max-w-4xl text-4xl tracking-tighter text-gray-900 md:text-5xl">
          The values that drive everything we do
        </h1>

        {/* <button
          className="bg-gray-900 text-white px-7 py-3 rounded-full text-base hover:bg-gray-800 transition-colors tracking-tighter"
          onClick={() => navigate("/about")}
        >
          Learn more
        </button> */}
      </motion.div>

      {/* Cards Section */}
      <motion.div className="mx-auto mt-20 grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
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
            <h2 className="mb-2 mt-4 text-center text-xl font-medium tracking-tight text-gray-900 md:text-left md:text-2xl">
              {card.title}
            </h2>
            <p className="text-center text-lg leading-normal text-gray-500 md:text-left">
              {card.text}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
