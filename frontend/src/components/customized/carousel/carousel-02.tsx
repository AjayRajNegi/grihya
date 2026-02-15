import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { motion, Variants } from "framer-motion";

const propertyOptions = [
  {
    title: "Renting a Home",
    image: "/images/home/Option1.avif",
  },
  {
    title: "Selling a Home",
    image: "/images/home/Option2.avif",
  },
  {
    title: "Commercial Leasing",
    image: "/images/home/Option3.avif",
  },
  {
    title: "Commercial Sales",
    image: "/images/home/Option1.avif",
  },
  {
    title: "Investment in Real Estate",
    image: "/images/home/Option2.avif",
  },
  {
    title: "Land Acquisition",
    image: "/images/home/Option3.avif",
  },
  {
    title: "Development Consulting",
    image: "/images/home/Option3.avif",
  },
];

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function CarouselWithMultipleSlides() {
  return (
    <Carousel
      className="w-full"
      opts={{
        align: "start",
      }}
    >
      <CarouselContent>
        {propertyOptions.map((item, index) => (
          <CarouselItem
            key={index}
            className="basis-1/2 md:basis-1/4 lg:basis-1/6"
          >
            <div className="md:p-2">
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.03 }}
                className="rounded-2xl"
              >
                <img
                  src={item.image}
                  className="h-[120px] w-full rounded-2xl object-cover"
                />

                <h6 className="text-center text-lg font-[500] text-[#2DB8D1]">
                  {item.title}
                </h6>
              </motion.div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious className="ml-4" />
      <CarouselNext className="mr-4" />
    </Carousel>
  );
}
