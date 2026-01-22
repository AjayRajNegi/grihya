import { useEffect, useState } from "react";
import PropertyCard from "../properties/PropertyCard";
import { motion, Variants } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface Property {
  id: string;
  title: string;
  description: string;
  type: "pg" | "flat" | "house" | "commercial" | "land";
  for: "rent" | "sale";
  price: number;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  furnishing?: "furnished" | "semifurnished" | "unfurnished";
  amenities?: string[];
  images: string[];
  listedDate: string;
  owner: {
    name: string;
    phone: string;
    email: string;
  };

  distanceMeters?: number;
}
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

export function FeaturedProperties({
  url,
  desc,
  type,
}: {
  url: string;
  desc: string;
  type: string;
}) {
  const router = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);

  const fetchProperties = async () => {
    const response = await fetch(
      `http://127.0.0.1:8000/api/properties?type=${type}`,
    );
    const data = await response.json();
    setProperties(data.data);
  };
  useEffect(() => {
    fetchProperties();
  }, []);
  return (
    <section className="mx-auto my-4 mb-0 max-w-7xl overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col items-start justify-between px-5 lg:flex-row lg:items-end lg:px-0">
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
              Properties
            </span>
          </div>

          <h1 className="max-w-4xl text-4xl font-[500] tracking-tighter text-gray-900 md:text-5xl">
            {desc}
          </h1>
        </motion.div>

        <button
          onClick={() => {
            router(`${url}`);
          }}
          className="mt-3 cursor-pointer rounded-full bg-black px-7 py-3 text-base font-[500] tracking-tighter text-white lg:mt-0"
        >
          All Properties
        </button>
      </div>

      <div className="mx-5 my-5 grid grid-cols-1 gap-6 md:grid-cols-2 lg:mx-4 lg:grid-cols-3">
        {properties.slice(0, 6).map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  );
}
