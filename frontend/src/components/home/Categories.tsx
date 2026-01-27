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

type CategoriesProps = {
  ImageUrl: string;
  className: string;
  url: string;
};

export function Categories({ ImageUrl, className, url }: CategoriesProps) {
  const router = useNavigate();
  return (
    <section
      className={`mx-auto flex max-w-7xl flex-col-reverse gap-4 px-4 md:mt-12 md:px-12 ${className}`}
    >
      {/* Image */}
      <motion.div
        className="mx-0 h-[300px] w-full rounded-[20px] md:mx-2 md:h-auto md:w-1/2"
        style={{
          backgroundImage: `url(${ImageUrl})`,
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
              router(`${url}`);
            }}
          >
            {/* Text container */}
            <div className="w-1/2 translate-y-6 transform cursor-pointer transition-transform duration-300 ease-out group-hover:translate-y-0 md:w-[40%]">
              <h6 className="text-2xl font-semibold text-white">
                Residential Homes
              </h6>
              <p className="text-base leading-5 text-white">
                Experience elegance and comfort with our exclusive luxury
                villas, designed for sophisticated living.
              </p>
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
        {/* Main text block (unchanged logic) */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto"
        >
          <div className="flex items-center gap-2 md:mb-3">
            <div className="h-2 w-2 rounded-sm bg-cyan-500"></div>
            <span className="text-base font-medium text-gray-700">
              Categories
            </span>
          </div>

          <h1 className="mb-1 max-w-4xl text-4xl tracking-tighter text-gray-900 md:mb-1 md:text-3xl">
            The values that drive everything we do
          </h1>

          <h3 className="mb-2 text-[#808080] md:mb-4">Lorem Ipsum Line Here</h3>

          <button
            onClick={() => {
              router(`${url}`);
            }}
            className="cursor-pointer rounded-full bg-[#2DB8D1] px-5 py-2 text-base tracking-tighter text-white md:mx-7 md:py-3"
          >
            View Properties
          </button>
        </motion.div>

        {/* Feature card 1 */}
        <motion.div
          className="mb-1 mt-4 flex items-center rounded-[16px] border-[0.5px] border-[#2DB8D1] p-2"
          variants={featureVariants}
          initial="hidden"
          whileInView="visible"
          custom={0.2}
          viewport={{ once: true }}
        >
          <img
            src="/images/home/Vision1.png"
            className="h-[55px] md:h-[70px]"
          />
          <div>
            <h3 className="text-lg font-semibold text-[#2DB8D1] md:text-xl">
              Modern Villa
            </h3>
            <p className="text-sm md:text-base">
              Discover the luxury and comfort of modern villa living
            </p>
          </div>
        </motion.div>

        {/* Feature card 2 */}
        <motion.div
          className="flex items-center rounded-[16px] border-[0.5px] border-[#2DB8D1] p-2"
          variants={featureVariants}
          initial="hidden"
          whileInView="visible"
          custom={0.35}
          viewport={{ once: true }}
        >
          <img
            src="/images/home/Vision1.png"
            className="h-[55px] md:h-[70px]"
          />
          <div>
            <h3 className="text-lg font-semibold text-[#2DB8D1] md:text-xl">
              Modern Villa
            </h3>
            <p className="text-sm md:text-base">
              Discover the luxury and comfort of modern villa living
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
