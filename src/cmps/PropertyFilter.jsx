import { useState, useEffect, useRef } from "react";
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
    bedrooms: filterBy?.bedrooms || "",
    guests: filterBy?.guests || "",
  });

  const [cities, setCities] = useState([]);
  const [showCitiesList, setShowCitiesList] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRefs = {
    bedrooms: useRef(null),
    guests: useRef(null),
    price: useRef(null),
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown) {
        const activeRef = dropdownRefs[activeDropdown];
        if (activeRef && !activeRef.current?.contains(event.target)) {
          setActiveDropdown(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown]);

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      const cities = await propertyService.getCities();
      setCities(cities);
    } catch (err) {
      console.error("Failed to load cities:", err);
    }
  };

  const handleInputChange = (ev) => {
    const { name, value } = ev.target;
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

  const handleCitySelect = (city) => {
    setLocalFilters((prev) => ({
      ...prev,
      city,
    }));
    setShowCitiesList(false);
  };

  const handleSearch = (ev) => {
    ev.preventDefault();
    onSetFilter(localFilters);
    setIsModalOpen(false);
  };

  const handleReset = () => {
    const emptyFilters = {
      city: "",
      from: null,
      to: null,
      priceMin: "",
      priceMax: "",
      bedrooms: "",
      guests: "",
    };
    setLocalFilters(emptyFilters);
    onSetFilter(emptyFilters);
    setIsModalOpen(false);
  };

  const hasActiveFilters = () => {
    return Object.values(localFilters).some(
      (value) => value !== "" && value !== null
    );
  };

  const renderCustomDropdown = (type) => {
    let options = [];
    let title = "";
    let icon = null;

    switch (type) {
      case "bedrooms":
        title = "Bedrooms";
        icon = (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="dropdown-icon"
          >
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
        options = [
          { value: "", label: "Any" },
          { value: "1", label: "1 Bedroom" },
          { value: "2", label: "2 Bedrooms" },
          { value: "3", label: "3 Bedrooms" },
          { value: "4", label: "4 Bedrooms" },
          { value: "5", label: "5+ Bedrooms" },
        ];
        break;
      case "guests":
        title = "Guests";
        icon = (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="dropdown-icon"
          >
            <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
        options = [
          { value: "", label: "Any" },
          { value: "1", label: "1 Guest" },
          { value: "2", label: "2 Guests" },
          { value: "3", label: "3 Guests" },
          { value: "4", label: "4 Guests" },
          { value: "5", label: "5 Guests" },
          { value: "6", label: "6+ Guests" },
        ];
        break;
      case "price":
        title = "Price Range";
        icon = (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="dropdown-icon"
          >
            <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
        options = [
          { value: "-", label: "Any price" },
          { value: "0-100", label: "Up to $100" },
          { value: "100-200", label: "$ 100 - $ 200" },
          { value: "200-300", label: "$ 200 - $ 300" },
          { value: "300-500", label: "$ 300 - $ 500" },
          { value: "500-", label: "$ 500+" },
        ];
        break;
    }

    const selectedOption = options.find((opt) => {
      if (type === "price") {
        return (
          `${localFilters.priceMin || ""}-${localFilters.priceMax || ""}` ===
          opt.value
        );
      }
      return localFilters[type] === opt.value;
    });

    return (
      <div className="custom-dropdown" ref={dropdownRefs[type]}>
        <button
          type="button"
          className={`dropdown-button ${
            activeDropdown === type ? "active" : ""
          }`}
          onClick={() => handleDropdownClick(type)}
          aria-label={`Select ${title.toLowerCase()}`}
          aria-expanded={activeDropdown === type}
        >
          {icon}
          <div className="dropdown-button-content">
            <span className="dropdown-label">{title}</span>
            <span className="dropdown-value">
              {selectedOption?.label || "Any"}
            </span>
          </div>
        </button>

        {activeDropdown === type && (
          <div className="dropdown-menu" role="listbox">
            {options.map((option) => (
              <div
                key={option.value}
                className={`dropdown-item ${
                  type === "price"
                    ? `${localFilters.priceMin || ""}-${
                        localFilters.priceMax || ""
                      }` === option.value
                    : localFilters[type] === option.value
                    ? "selected"
                    : ""
                }`}
                onClick={() => {
                  if (type === "price") {
                    const [min, max] = option.value.split("-");
                    const newFilters = {
                      ...localFilters,
                      priceMin: min || "",
                      priceMax: max || "",
                    };
                    setLocalFilters(newFilters);
                    onSetFilter(newFilters);
                    setActiveDropdown(null); // Close dropdown after selection
                  } else {
                    handleOptionSelect(type, option.value);
                  }
                }}
                role="option"
                aria-selected={
                  type === "price"
                    ? `${localFilters.priceMin || ""}-${
                        localFilters.priceMax || ""
                      }` === option.value
                    : localFilters[type] === option.value
                }
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleDropdownClick = (dropdownName) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const handleOptionSelect = (field, value) => {
    const newFilters = {
      ...localFilters,
      [field]: value,
    };
    setLocalFilters(newFilters);
    onSetFilter(newFilters);
    setActiveDropdown(null);
  };

  const FilterContent = () => (
    <>
      {/* Location Filter */}
      <div className="filter-segment">
        <div className="filter-control">
          <label className="filter-label" htmlFor="location-input">
            Location
          </label>
          <input
            type="text"
            id="location-input"
            name="city"
            value={localFilters.city}
            onChange={handleInputChange}
            placeholder="Where are you going?"
            autoComplete="off"
            onFocus={() => setShowCitiesList(true)}
          />
          {showCitiesList && cities.length > 0 && (
            <div className="cities-dropdown">
              {cities
                .filter((city) =>
                  city.toLowerCase().includes(localFilters.city.toLowerCase())
                )
                .map((city, index) => (
                  <div
                    key={index}
                    onClick={() => handleCitySelect(city)}
                    className="dropdown-item"
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
        <div className="filter-control">
          <label className="filter-label" htmlFor="date-input">
            Check-in / Check-out
          </label>
          <DatePicker
            id="date-input"
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

      {/* Bedrooms Filter */}
      <div className="filter-segment">{renderCustomDropdown("bedrooms")}</div>

      {/* Guests Filter */}
      <div className="filter-segment">{renderCustomDropdown("guests")}</div>

      {/* Price Range Filter */}
      <div className="filter-segment">{renderCustomDropdown("price")}</div>

      <div className="filter-actions">
        {/* Search Button */}
        <button type="submit" className="filter-action" disabled={isFiltering}>
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
        {hasActiveFilters() && (
          <button onClick={handleReset} className="filter-action" type="button">
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
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Filter */}
      <form className="filter-bar desktop-filter" onSubmit={handleSearch}>
        <FilterContent />
      </form>

      {/* Mobile Filter Button & Modal */}
      <div className="mobile-filter">
        <button
          className="mobile-filter-button"
          onClick={() => setIsModalOpen(true)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ width: 20, height: 20, marginRight: 8 }}
          >
            <path d="M3 4h18M3 12h18M3 20h18" />
          </svg>
          Filters
          {hasActiveFilters() && <span className="filter-badge" />}
        </button>

        {isModalOpen && (
          <div
            className="filter-modal-overlay"
            onClick={() => setIsModalOpen(false)}
          >
            <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
              <div className="filter-modal-header">
                <h2>Filters</h2>
                <button
                  className="close-modal"
                  onClick={() => setIsModalOpen(false)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ width: 24, height: 24 }}
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSearch}>
                <FilterContent />
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
