import React, { useEffect, useState, FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SearchIcon, MapPinIcon, HomeIcon } from "lucide-react";

const PRICE_OPTIONS = [
  { value: "", label: "Price Range" },
  { value: "0-10000", label: "Under ₹10,000" },
  { value: "10000-25000", label: "₹10,000 - ₹25,000" },
  { value: "25000-50000", label: "₹25,000 - ₹50,000" },
  { value: "50000-100000", label: "₹50,000 - ₹1,00,000" },
  { value: "100000+", label: "Above ₹1,00,000" },
];

const FeaturedFilter: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [location, setLocation] = useState<string>(
    params.get("location") || ""
  );
  const [dealType, setDealType] = useState<string>(params.get("for") || "");
  const [priceRange, setPriceRange] = useState<string>(
    params.get("price") || ""
  );

  useEffect(() => {
    setLocation(params.get("location") || "");
    setDealType(params.get("for") || "");
    setPriceRange(params.get("price") || "");
  }, [params]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = new URLSearchParams();
    if (location) q.set("location", location);
    if (dealType) q.set("for", dealType);
    if (priceRange) q.set("price", priceRange);
    navigate(`/properties?${q.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Location */}
        <div className="flex-1">
          <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 bg-gray-50 focus-within:border-[#2AB09C] focus-within:ring-1 focus-within:ring-[#2AB09C]">
            <MapPinIcon className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="ml-2 flex-1 outline-none bg-transparent text-gray-800"
            />
          </div>
        </div>

        {/* For (Rent / Sale) */}
        <div className="flex-1">
          <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
            <HomeIcon className="h-5 w-5 text-gray-400" />
            <select
              value={dealType}
              onChange={(e) => setDealType(e.target.value)}
              className="ml-2 flex-1 outline-none bg-transparent text-gray-600 appearance-none"
            >
              <option value="">Rent or Sale</option>
              <option value="rent">Rent</option>
              <option value="sale">Sale</option>
            </select>
          </div>
        </div>

        {/* Budget (range) */}
        <div className="flex-1">
          <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
            <div className="h-5 w-5 text-gray-400" />
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="ml-2 flex-1 outline-none bg-transparent text-gray-600 appearance-none"
            >
              {PRICE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="text-[black] bg-[#2AB09C] hover:text-[#2AB09C] hover:bg-transparent text-white px-6 py-2 rounded-md flex items-center justify-center transition-colors"
        >
          <SearchIcon className="h-5 w-5 mr-2" />
          Search
        </button>
      </div>
    </form>
  );
};

export default FeaturedFilter;
