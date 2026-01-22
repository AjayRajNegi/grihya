import React, { useState } from "react";
import { FilterIcon, XIcon } from "lucide-react";
interface PropertyFiltersProps {
  onFilterChange: (filters: any) => void;
  initialFilters: any;
}
const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  onFilterChange,
  initialFilters,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState(initialFilters || {});
  const handleFilterChange = (category: string, value: string) => {
    setFilters((prev: typeof filters) => ({
      ...prev,
      [category]: value,
    }));
  };
  const applyFilters = () => {
    onFilterChange(filters);
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };
  const clearFilters = () => {
    const emptyFilters = {
      type: "",
      for: "",
      bedrooms: "",
      bathrooms: "",
      priceRange: "",
      furnishing: "",
      amenities: [],
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };
  return (
    <>
      {/* Mobile filter button */}
      <div className="mb-4 md:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <FilterIcon className="mr-2 h-5 w-5" />
          Filters
        </button>
      </div>
      {/* Filter sidebar - desktop always visible, mobile as overlay */}
      <div
        className={` ${isOpen ? "fixed inset-0 z-40 flex md:hidden" : "hidden md:block"} `}
      >
        {/* Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-25"
            onClick={() => setIsOpen(false)}
          ></div>
        )}
        {/* Sidebar */}
        <div
          className={` ${isOpen ? "fixed right-0 top-0 h-full w-full max-w-xs" : ""} overflow-y-auto rounded-2xl border-[1px] border-gray-400 bg-white p-4 shadow-lg md:sticky md:top-24 md:h-auto md:p-6`}
        >
          <div className="mb-6 flex items-center justify-between md:hidden">
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>
          <h3 className="mb-6 hidden text-lg font-medium text-gray-900 md:block">
            Filters
          </h3>
          {/* Property Type */}
          <div className="mb-6">
            <h4 className="mb-2 font-medium text-gray-900">Property Type</h4>
            <div className="space-y-2">
              {["pg", "flat", "house", "commercial", "land"].map((type) => (
                <div key={type} className="flex items-center">
                  <input
                    id={`type-${type}`}
                    name="type"
                    type="radio"
                    checked={filters.type === type}
                    onChange={() => handleFilterChange("type", type)}
                    className="h-4 w-4 border-white accent-[var(--brand)] focus:outline-none focus:ring-0 focus:ring-offset-0"
                  />
                  <label
                    htmlFor={`type-${type}`}
                    className="ml-2 capitalize text-gray-700"
                  >
                    {type === "pg"
                      ? "PG Accommodation"
                      : type === "flat"
                        ? "Apartment/Flat"
                        : type === "house"
                          ? "Independent House/Villa"
                          : type === "commercial"
                            ? "Commercial Property"
                            : "Plot/Land"}
                  </label>
                </div>
              ))}
            </div>
          </div>
          {/* For Rent/Sale */}
          <div className="mb-6">
            <h4 className="mb-2 font-medium text-gray-900">Property For</h4>
            <div className="space-y-2">
              {["rent", "sale"].map((forType) => (
                <div key={forType} className="flex items-center">
                  <input
                    id={`for-${forType}`}
                    name="for"
                    type="radio"
                    checked={filters.for === forType}
                    onChange={() => handleFilterChange("for", forType)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`for-${forType}`}
                    className="ml-2 capitalize text-gray-700"
                  >
                    For {forType.charAt(0).toUpperCase() + forType.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </div>
          {/* Bedrooms */}
          <div className="mb-6">
            <h4 className="mb-2 font-medium text-gray-900">Bedrooms</h4>
            <div className="space-y-2">
              {["any", "1", "2", "3", "4+"].map((beds) => (
                <div key={beds} className="flex items-center">
                  <input
                    id={`beds-${beds}`}
                    name="bedrooms"
                    type="radio"
                    checked={filters.bedrooms === beds}
                    onChange={() => handleFilterChange("bedrooms", beds)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`beds-${beds}`}
                    className="ml-2 text-gray-700"
                  >
                    {beds === "any"
                      ? "Any"
                      : beds === "4+"
                        ? "4 or more"
                        : `${beds} ${
                            parseInt(beds) === 1 ? "Bedroom" : "Bedrooms"
                          }`}
                  </label>
                </div>
              ))}
            </div>
          </div>
          {/* Bathrooms */}
          <div className="mb-6">
            <h4 className="mb-2 font-medium text-gray-900">Bathrooms</h4>
            <div className="space-y-2">
              {["any", "1", "2", "3+"].map((baths) => (
                <div key={baths} className="flex items-center">
                  <input
                    id={`baths-${baths}`}
                    name="bathrooms"
                    type="radio"
                    checked={filters.bathrooms === baths}
                    onChange={() => handleFilterChange("bathrooms", baths)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`baths-${baths}`}
                    className="ml-2 text-gray-700"
                  >
                    {baths === "any"
                      ? "Any"
                      : baths === "3+"
                        ? "3 or more"
                        : `${baths} ${
                            parseInt(baths) === 1 ? "Bathroom" : "Bathrooms"
                          }`}
                  </label>
                </div>
              ))}
            </div>
          </div>
          {/* Price Range */}
          <div className="mb-6">
            <h4 className="mb-2 font-medium text-gray-900">Price Range</h4>
            <div className="space-y-2">
              {[
                {
                  value: "any",
                  label: "Any",
                },
                {
                  value: "0-10000",
                  label: "Under ₹10,000",
                },
                {
                  value: "10000-25000",
                  label: "₹10,000 - ₹25,000",
                },
                {
                  value: "25000-50000",
                  label: "₹25,000 - ₹50,000",
                },
                {
                  value: "50000-100000",
                  label: "₹50,000 - ₹1,00,000",
                },
                {
                  value: "100000+",
                  label: "Above ₹1,00,000",
                },
              ].map((option) => (
                <div key={option.value} className="flex items-center">
                  <input
                    id={`price-${option.value}`}
                    name="priceRange"
                    type="radio"
                    checked={filters.priceRange === option.value}
                    onChange={() =>
                      handleFilterChange("priceRange", option.value)
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`price-${option.value}`}
                    className="ml-2 text-gray-700"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          {/* Furnishing */}
          <div className="mb-6">
            <h4 className="mb-2 font-medium text-gray-900">Furnishing</h4>
            <div className="space-y-2">
              {["any", "furnished", "semifurnished", "unfurnished"].map(
                (furnish) => (
                  <div key={furnish} className="flex items-center">
                    <input
                      id={`furnish-${furnish}`}
                      name="furnishing"
                      type="radio"
                      checked={filters.furnishing === furnish}
                      onChange={() => handleFilterChange("furnishing", furnish)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`furnish-${furnish}`}
                      className="ml-2 capitalize text-gray-700"
                    >
                      {furnish === "any"
                        ? "Any"
                        : furnish === "semifurnished"
                          ? "Semi-Furnished"
                          : furnish}
                    </label>
                  </div>
                ),
              )}
            </div>
          </div>
          {/* Action buttons */}
          <div className="flex space-x-4">
            <button
              onClick={applyFilters}
              className="flex-1 rounded-[8px] bg-[#35B1C6] px-4 py-2 text-white transition-colors hover:bg-[#ffffff] hover:text-[#35B1C6]"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="flex-1 rounded-[8px] bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300"
            >
              Clear All
            </button>
          </div>
          {/* <div className="mb-2 flex h-16 space-x-4"></div> */}
        </div>
      </div>
    </>
  );
};
export default PropertyFilters;
