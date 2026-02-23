import React from "react";
import { Link } from "react-router-dom";
import { BedIcon, BathIcon, SquareIcon, MapPinIcon } from "lucide-react";
import { Property } from "../../data/mockData";
import { motion, Variants } from "framer-motion";

interface PropertyCardProps {
  property: Property;
}

const itemVariants: Variants = {
  // hidden: { opacity: 0, y: 30 },
  // visible: {
  //   opacity: 1,
  //   y: 0,
  //   transition: {
  //     duration: 1.2,
  //     ease: [0.4, 0, 0.2, 1],
  //   },
  // },
};
const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  return (
    <motion.div
      className="overflow-hidden rounded-3xl border-[1px] border-[#B7E5F2] bg-white shadow-[0_3px_10px_rgb(0,0,0,0.2)] transition-all hover:shadow-lg"
      variants={itemVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <Link to={`/properties/${property.id}`}>
        {/* Image */}
        <div className="relative h-56">
          <img
            src={property.images[0]}
            alt={property.title}
            className="h-full w-full rounded-3xl object-cover"
          />

          {/* For Sale / Rent Badge */}
          <span className="absolute left-3 top-3 inline-flex items-center text-xs font-medium text-white">
            {property.for === "rent" ? (
              <p className="flex items-center gap-1 rounded-full border-[0.5px] border-black/20 bg-[#2DB8D1] px-3 py-2">
                <img src="/images/property/ForRent.png" className="h-4" />
                For Rent
              </p>
            ) : (
              <p className="flex items-center gap-1 rounded-full border-[0.5px] border-black/20 bg-[#2DB8D1] px-3 py-2">
                <img src="/images/property/ForSale.png" className="h-4" />
                For Sale
              </p>
            )}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="flex min-h-[160px] flex-col justify-between p-4">
        {/* Location */}
        <div className="mb-1 flex items-center text-sm text-gray-500">
          <MapPinIcon className="mr-1 h-4 w-4" />
          {property.location}
        </div>

        {/* Title */}
        <Link to={`/properties/${property.id}`}>
          <h3 className="mb-3 text-lg font-semibold leading-snug text-gray-900 hover:text-sky-600">
            {property.title}
          </h3>
        </Link>

        {/* Meta info */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <BedIcon className="h-4 w-4" />
            <span>{property.bedrooms ?? 0}</span>
          </div>

          <div className="flex items-center gap-1">
            <BathIcon className="h-4 w-4" />
            <span>{property.bathrooms ?? 0}</span>
          </div>

          <div className="flex items-center gap-1">
            <SquareIcon className="h-4 w-4" />
            <span>{property.area} sq.ft</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default PropertyCard;
