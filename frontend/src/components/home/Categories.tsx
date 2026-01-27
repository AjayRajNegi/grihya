import { motion, Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
const featureVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay,
      ease: "easeOut",
    },
  }),
};

type CategoryFeature = {
  id: number;
  title: string;
  description: string;
  image: string;
  delay?: number;
};

type CategoryConfig = {
  header: string;
  title: string;
  desc: string;
  tag?: string;
  image: {
    url: string;
    title: string;
    description: string;
  };
  cta: {
    text: string;
    url: string;
  };
  features: CategoryFeature[];
};

type CategoriesProps = {
  config: CategoryConfig;
  className?: string;
};

export function Categories({ config, className }: CategoriesProps) {
  const router = useNavigate();
  return (
    <>
      {/* Header Section */}
      <section className="mx-auto max-w-7xl px-4 md:mt-12 md:px-12">
        <div className="flex flex-col items-start justify-between lg:flex-row lg:items-end lg:px-0">
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className=""
          >
            <div className="mb-1 flex items-center gap-2 md:mb-3 lg:mb-6">
              <div className="h-2 w-2 rounded-sm bg-cyan-500"></div>
              <span className="text-base font-medium text-gray-700">
                Categories
              </span>
            </div>

            <h1 className="max-w-xl text-4xl font-[500] tracking-tighter text-gray-900 md:text-5xl">
              {config.header}
            </h1>
          </motion.div>

          <button
            onClick={() => {
              router(`${config.cta.url}`);
            }}
            className="mt-3 cursor-pointer rounded-full bg-black px-7 py-3 text-base font-[500] tracking-tighter text-white lg:mt-0"
          >
            All Properties
          </button>
        </div>
      </section>
      {/* Information Body */}
      <section
        className={`mx-auto mt-4 flex max-w-7xl flex-col gap-4 px-4 md:mt-12 md:px-12 ${className}`}
      >
        {/* Image */}
        <motion.div
          className="mx-0 h-[250px] w-full rounded-[20px] md:mx-2 md:h-auto md:w-1/2"
          style={{
            backgroundImage: `url(${config.image.url})`,
            backgroundSize: "cover",
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <div className="group relative flex h-full items-center justify-between">
            <div
              className="absolute inset-0 flex h-full items-center justify-between rounded-[20px] bg-gradient-to-b from-transparent to-black/50 p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:p-10"
              onClick={() => {
                router(`${config.cta.url}`);
              }}
            >
              {/* Text container */}
              <div className="w-1/2 translate-y-6 transform cursor-pointer transition-transform duration-300 ease-out group-hover:translate-y-0 md:w-[40%]">
                <h6 className="text-2xl font-semibold text-white">
                  {config.title}
                </h6>
                <p className="text-base leading-5 text-white">{config.desc}</p>
              </div>

              {/* Arrow */}
              <div className="translate-y-6 transform cursor-pointer rounded-full bg-white p-3 font-thin text-black transition-transform duration-300 ease-out group-hover:translate-y-0">
                <ArrowRight size={30} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Information */}
        <div className="w-full md:w-1/2">
          {/* Main text block */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mx-auto mb-4"
          >
            <h1 className="mb-1 max-w-4xl text-2xl tracking-tighter text-gray-900 md:mb-1 md:text-3xl">
              Explore best Housing properties with Grihya
            </h1>

            <h3 className="mb-2 leading-5 text-[#808080] md:mb-4">
              Trusted residential solutions for buying, selling, and renting
              homes
            </h3>

            <button
              onClick={() => {
                router(`${config.cta.url}`);
              }}
              className="cursor-pointer rounded-full bg-[#2DB8D1] px-5 py-3 text-base tracking-tighter text-white md:mx-7 md:py-3"
              style={{ marginLeft: 0 }}
            >
              View Properties
            </button>
          </motion.div>

          {/* Feature Card */}
          {config.features.map((feature) => (
            <motion.div
              key={feature.id}
              className="mb-1 flex items-center rounded-[16px] border-[0.5px] border-[#2DB8D1] p-2"
              variants={featureVariants}
              initial="hidden"
              whileInView="visible"
              custom={feature.delay}
              viewport={{ once: true }}
            >
              <img
                src={feature.image}
                className="h-[55px] md:h-[70px]"
                alt={feature.title}
              />
              <div>
                <h3 className="text-lg font-semibold text-[#2DB8D1] md:text-xl">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#808080] md:text-base">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
