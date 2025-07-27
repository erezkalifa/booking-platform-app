import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { propertyService } from "../services/property.service";

export function PropertyFilter({ filterBy, onSetFilter, isFiltering }) {
  const [localFilters, setLocalFilters] = useState({
    city: filterBy?.city || "",
    from: filterBy?.from ? new Date(filterBy.from) : null,
    to: filterBy?.to ? new Date(filterBy.to) : null,
    priceMin: filterBy?.priceMin || "",
    priceMax: filterBy?.priceMax || "",
  });

  const [cities, setCities] = useState([]);
  const [showCitiesList, setShowCitiesList] = useState(false);

  useEffect(() => {
    loadCities();
  }, []);

  useEffect(() => {
    setLocalFilters({
      city: filterBy?.city || "",
      from: filterBy?.from ? new Date(filterBy.from) : null,
      to: filterBy?.to ? new Date(filterBy.to) : null,
      priceMin: filterBy?.priceMin || "",
      priceMax: filterBy?.priceMax || "",
    });
  }, [filterBy]);

  const loadCities = async () => {
    try {
      const citiesData = await propertyService.getCities();
      setCities(citiesData);
    } catch (err) {
      console.error("Error loading cities:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log("Filter input changed:", { name, value });
    setLocalFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "city") {
      setShowCitiesList(true);
    }
  };

  const handleCitySelect = (city) => {
    setLocalFilters((prev) => ({
      ...prev,
      city,
    }));
    setShowCitiesList(false);
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
      city: localFilters.city.trim(),
    };

    onSetFilter(formattedFilters);
  };

  const handleReset = (e) => {
    e.preventDefault();
    const emptyFilters = {
      city: "",
      from: null,
      to: null,
      priceMin: "",
      priceMax: "",
    };
    setLocalFilters(emptyFilters);
    onSetFilter(emptyFilters);
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
            onFocus={() => setShowCitiesList(true)}
          />
          {showCitiesList && cities.length > 0 && (
            <div
              className="cities-dropdown"
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "white",
                border: "1px solid #ccc",
                borderRadius: "4px",
                maxHeight: "200px",
                overflowY: "auto",
                zIndex: 1000,
              }}
            >
              {cities
                .filter((city) =>
                  city.toLowerCase().includes(localFilters.city.toLowerCase())
                )
                .map((city, index) => (
                  <div
                    key={index}
                    onClick={() => handleCitySelect(city)}
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      borderBottom: "1px solid #eee",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#f5f5f5")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "white")
                    }
                  >
                    {city}
                  </div>
                ))}
            </div>
          )}
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

      <div className="filter-actions" style={{ display: "flex", gap: "10px" }}>
        {/* Search Button */}
        <button
          type="submit"
          className="filter-action"
          disabled={isFiltering}
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            opacity: isFiltering ? 0.7 : 1,
            cursor: isFiltering ? "not-allowed" : "pointer",
          }}
        >
          {isFiltering ? (
            <>
              <div className="button-spinner"></div>
              Filtering...
            </>
          ) : (
            <>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ width: 20, height: 20 }}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              Search
            </>
          )}
        </button>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="filter-action"
          style={{
            backgroundColor: "#f5f5f5",
            color: "#333",
            border: "1px solid #ddd",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ width: 20, height: 20, marginRight: 8 }}
          >
            <path d="M3 12a9 9 0 1 1 2.83 6.54M3 12l4-4M3 12l4 4" />
          </svg>
          Reset
        </button>
      </div>
    </form>
  );
}
