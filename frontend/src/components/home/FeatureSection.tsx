import { motion, Variants } from "framer-motion";

const cards = [
  {
    img: "/images/home/Feature1.png",
    title: "Expert Guidance",
    text: "Receive professional insights to make informed real estate decisions confidently.",
  },
  {
    img: "/images/home/Feature2.png",
    title: "Tailored Solutions",
    text: "We customize property options based on your specific needs and preferences.",
  },
  {
    img: "/images/home/Feature3.png",
    title: "Market Expertise",
    text: "Leverage our deep understanding of market trends for smart investments.",
  },
  {
    img: "/images/home/Feature4.png",
    title: "Seamless Process",
    text: "Enjoy a smooth, stress-free experience from property search to final transaction.",
  },
  {
    img: "/images/home/Feature5.png",
    title: "Client Focused",
    text: "We prioritize your satisfaction with personalized service every step of the perfect way.",
  },
  {
    img: "/images/home/Feature6.png",
    title: "Trusted Partners",
    text: "Work with a reliable team committed to delivering exceptional results for you.",
  },
];

export default function FeatureSection() {
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
    <div className="mx-4 my-5 min-h-screen max-w-7xl rounded-3xl bg-gray-100 px-4 py-6 md:mx-auto md:mt-10 md:px-12">
      {/* Header Section */}
      <div className="mx-auto">
        <div className="flex items-center justify-center gap-2 md:mb-6">
          <div className="h-2 w-2 rounded-sm bg-cyan-500"></div>
          <span className="text-base font-medium text-gray-700">Features</span>
        </div>

        <h1 className="mx-auto max-w-4xl text-center text-4xl font-[500] tracking-tighter text-gray-900 md:text-5xl">
          Discover the advantages and <br />
          exclusive benefits
        </h1>
      </div>

      {/* Cards Section */}
      <motion.div className="mx-auto mt-10 grid max-w-7xl grid-cols-1 gap-6 md:mt-20 md:gap-12 lg:grid-cols-3 lg:gap-16">
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
              <img
                src={card.img}
                alt={card.title}
                className="h-[50px] w-[50px]"
              />
            </div>
            <h2 className="mb-1 mt-3 text-xl font-medium tracking-tight text-gray-900 md:mb-4 md:mt-6 md:text-2xl">
              {card.title}
            </h2>
            <p className="text-lg leading-normal text-gray-500">{card.text}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
