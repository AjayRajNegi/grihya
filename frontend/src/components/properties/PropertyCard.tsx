import React from "react";
import { Link } from "react-router-dom";
import { BedIcon, BathIcon, SquareIcon, MapPinIcon } from "lucide-react";
import { Property } from "../../data/mockData";
interface PropertyCardProps {
  property: Property;
}
const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1 flex flex-col">
      <Link to={`/properties/${property.id}`}>
        <div className="relative h-48 overflow-hidden">
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2">
            {/* <span className={`
              px-2 py-1 text-xs font-semibold rounded
              ${property.type === 'pg' ? 'bg-purple-600 text-white' : property.type === 'flat' ? 'text-[#2AB09C] text-white' : property.type === 'house' ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}
            `}>
              {property.type === 'pg' ? 'PG' : property.type === 'flat' ? 'Flat' : property.type === 'house' ? 'House' : 'Other'}
            </span> */}
          </div>
          <div className="absolute top-2 right-2">
            <span
              className={`px-2 py-1 text-xs font-semibold rounded text-white ${
                property.for === "rent" ? "bg-red-500" : "bg-yellow-500"
              }`}
            >
              {property.for === "rent" ? "For Rent" : "For Sale"}
            </span>
          </div>
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/properties/${property.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-[#2AB09C]">
            {property.title}
          </h3>
        </Link>
        <div className="flex items-center text-gray-600 text-sm mb-2">
          <MapPinIcon className="h-4 w-4 mr-1" />
          <span>{property.location}</span>
        </div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-[#2AB09C] font-bold text-lg">
            ₹{property.price.toLocaleString()}
            {property.for === "rent" ? "/month" : ""}
          </span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 pt-3 border-t mt-auto">
          {property.bedrooms && (
            <div className="flex items-center">
              <BedIcon className="h-4 w-4 mr-1" />
              <span>
                {property.bedrooms} {property.bedrooms === 1 ? "Bed" : "Beds"}
              </span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center">
              <BathIcon className="h-4 w-4 mr-1" />
              <span>
                {property.bathrooms}{" "}
                {property.bathrooms === 1 ? "Bath" : "Baths"}
              </span>
            </div>
          )}
          {property.area && (
            <div className="flex items-center">
              <SquareIcon className="h-4 w-4 mr-1" />
              <span>{property.area} sq.ft</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default PropertyCard;
