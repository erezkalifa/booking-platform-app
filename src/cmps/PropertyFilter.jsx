import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export function PropertyFilter({ filterBy, onSetFilter }) {
  const [localFilters, setLocalFilters] = useState({
    city: filterBy?.city || "",
    from: filterBy?.from ? new Date(filterBy.from) : null,
    to: filterBy?.to ? new Date(filterBy.to) : null,
    priceMin: filterBy?.priceMin || "",
    priceMax: filterBy?.priceMax || "",
  });

  useEffect(() => {
    setLocalFilters({
      city: filterBy?.city || "",
      from: filterBy?.from ? new Date(filterBy.from) : null,
      to: filterBy?.to ? new Date(filterBy.to) : null,
      priceMin: filterBy?.priceMin || "",
      priceMax: filterBy?.priceMax || "",
    });
  }, [filterBy]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setLocalFilters((prev) => ({
      ...prev,
      from: start,
      to: end,
    }));
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    const price = Math.max(0, Number(value));
    setLocalFilters((prev) => ({
      ...prev,
      [name]: price || "",
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const formattedFilters = {
      ...localFilters,
      from: localFilters.from?.toISOString().split("T")[0] || "",
      to: localFilters.to?.toISOString().split("T")[0] || "",
    };
    onSetFilter(formattedFilters);
  };

  return (
    <form className="filter-bar" onSubmit={handleSearch}>
      {/* Location Filter */}
      <div className="filter-segment">
        <label className="filter-label" htmlFor="city">
          Location
        </label>
        <div className="filter-control">
          <input
            type="text"
            id="city"
            name="city"
            value={localFilters.city}
            onChange={handleInputChange}
            placeholder="Where are you going?"
            autoComplete="off"
          />
        </div>
      </div>

      {/* Dates Filter */}
      <div className="filter-segment">
        <label className="filter-label">Check-in / Check-out</label>
        <div className="filter-control">
          <DatePicker
            selected={localFilters.from}
            onChange={handleDateChange}
            startDate={localFilters.from}
            endDate={localFilters.to}
            selectsRange
            monthsShown={2}
            placeholderText="Select dates"
            minDate={new Date()}
            dateFormat="MMM d"
            isClearable
          />
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="filter-segment">
        <label className="filter-label">Price</label>
        <div className="filter-control">
          <select
            name="priceRange"
            onChange={(e) => {
              const [min, max] = e.target.value.split("-");
              setLocalFilters((prev) => ({
                ...prev,
                priceMin: min || "",
                priceMax: max || "",
              }));
            }}
            value={`${localFilters.priceMin || ""}-${
              localFilters.priceMax || ""
            }`}
          >
            <option value="">Any price</option>
            <option value="0-100">Up to $100</option>
            <option value="100-200">$100 - $200</option>
            <option value="200-300">$200 - $300</option>
            <option value="300-500">$300 - $500</option>
            <option value="500-">$500+</option>
          </select>
        </div>
      </div>

      {/* Search Button */}
      <button type="submit" className="filter-action">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ width: 20, height: 20, marginRight: 8 }}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        Search
      </button>
    </form>
  );
}
