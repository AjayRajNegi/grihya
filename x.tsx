<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
  <div>
    <label
      htmlFor="type"
      className="mb-1 block text-sm font-medium text-gray-700"
    >
      Property Type <span className="text-red-500">*</span>
    </label>
    <select
      disabled={isBusy}
      id="type"
      name="type"
      value={formData.type}
      onChange={handleChange}
      className={`w-full border px-3 py-2 ${
        errors.type ? "border-red-500" : "border-gray-300"
      } rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#2DB8D1]`}
    >
      <option value="">Select Type</option>
      <option value="pg">PG Accommodation</option>
      <option value="flat">Apartment/Flat</option>
      <option value="house">Independent House/Villa</option>
      <option value="commercial">Commercial Property</option>
      <option value="land">Plot/Land</option>
    </select>
    {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
  </div>
  <div>
    <label className="mb-1 block text-sm font-medium text-gray-700">
      Listing For <span className="text-red-500">*</span>
    </label>
    <div className="flex space-x-4">
      <label className="inline-flex items-center">
        <input
          disabled={isBusy}
          type="radio"
          name="for"
          value="rent"
          checked={formData.for === "rent"}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
        />
        <span className="ml-2">Rent</span>
      </label>
      <label className="inline-flex items-center">
        <input
          disabled={isBusy}
          type="radio"
          name="for"
          value="sale"
          checked={formData.for === "sale"}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
        />
        <span className="ml-2">Sale</span>
      </label>
    </div>
    {errors.for && <p className="mt-1 text-sm text-red-600">{errors.for}</p>}
  </div>
</div>;
