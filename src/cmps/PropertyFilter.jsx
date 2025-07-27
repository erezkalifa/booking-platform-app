import { useState, useEffect, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export function PropertyFilter({ filterBy, onSetFilter }) {
  const [filters, setFilters] = useState({
    city: filterBy?.city || "",
    from: filterBy?.from ? new Date(filterBy.from) : null,
    to: filterBy?.to ? new Date(filterBy.to) : null,
    priceMin: filterBy?.priceMin || "",
    priceMax: filterBy?.priceMax || "",
  });

  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    // Only update filters if they're different from current
    const shouldUpdate =
      filters.city !== (filterBy?.city || "") ||
      filters.from?.toISOString() !==
        (filterBy?.from ? new Date(filterBy.from).toISOString() : null) ||
      filters.to?.toISOString() !==
        (filterBy?.to ? new Date(filterBy.to).toISOString() : null) ||
      filters.priceMin !== (filterBy?.priceMin || "") ||
      filters.priceMax !== (filterBy?.priceMax || "");

    if (shouldUpdate) {
      setFilters({
        city: filterBy?.city || "",
        from: filterBy?.from ? new Date(filterBy.from) : null,
        to: filterBy?.to ? new Date(filterBy.to) : null,
        priceMin: filterBy?.priceMin || "",
        priceMax: filterBy?.priceMax || "",
      });
    }
  }, [filterBy]);

  const debouncedSearch = useCallback(
    (value) => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      const timeoutId = setTimeout(() => {
        const formattedFilters = {
          ...filters,
          city: value,
          from: filters.from?.toISOString().split("T")[0] || "",
          to: filters.to?.toISOString().split("T")[0] || "",
        };
        onSetFilter(formattedFilters);
      }, 500);

      setSearchTimeout(timeoutId);
    },
    [filters, onSetFilter, searchTimeout]
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "city") {
      debouncedSearch(value);
    }
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setFilters((prev) => ({
      ...prev,
      from: start,
      to: end,
    }));

    // Don't trigger search immediately for dates
    const formattedFilters = {
      ...filters,
      from: start?.toISOString().split("T")[0] || "",
      to: end?.toISOString().split("T")[0] || "",
    };
    onSetFilter(formattedFilters);
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    const price = Math.max(0, Number(value));
    setFilters((prev) => ({
      ...prev,
      [name]: price || "",
    }));

    // Don't trigger search immediately for price changes
    const formattedFilters = {
      ...filters,
      [name]: price || "",
    };
    onSetFilter(formattedFilters);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Clear any pending debounced searches
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const formattedFilters = {
      ...filters,
      from: filters.from?.toISOString().split("T")[0] || "",
      to: filters.to?.toISOString().split("T")[0] || "",
    };
    onSetFilter(formattedFilters);
  };

  const handleReset = () => {
    // Clear any pending debounced searches
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const resetFilters = {
      city: "",
      from: null,
      to: null,
      priceMin: "",
      priceMax: "",
    };
    setFilters(resetFilters);
    onSetFilter(resetFilters);
  };

  const hasActiveFilters = Object.values(filters).some(
    (val) => val !== "" && val !== null
  );

  return (
    <form className="filter-form" onSubmit={handleSearch}>
      <div className="filter-content">
        {/* Location */}
        <div className="filter-group">
          <label className="filter-label">Location</label>
          <input
            type="text"
            name="city"
            className="filter-input"
            placeholder="Search by location or property name"
            value={filters.city}
            onChange={handleInputChange}
            autoComplete="off"
          />
        </div>

        {/* Dates */}
        <div className="filter-group">
          <label className="filter-label">Check-in / Check-out</label>
          <DatePicker
            selected={filters.from}
            onChange={handleDateChange}
            startDate={filters.from}
            endDate={filters.to}
            selectsRange
            monthsShown={2}
            className="filter-input"
            placeholderText="Select dates"
            minDate={new Date()}
            dateFormat="MMM d"
            isClearable
          />
        </div>

        {/* Price Range */}
        <div className="filter-group">
          <label className="filter-label">Price Range</label>
          <div className="price-range">
            <input
              type="number"
              name="priceMin"
              className="filter-input number-input"
              placeholder="Min"
              value={filters.priceMin}
              onChange={handlePriceChange}
              min="0"
            />
            <input
              type="number"
              name="priceMax"
              className="filter-input number-input"
              placeholder="Max"
              value={filters.priceMax}
              onChange={handlePriceChange}
              min="0"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="filter-actions">
          {hasActiveFilters && (
            <button
              type="button"
              className="btn-reset"
              onClick={handleReset}
              title="Reset all filters"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path d="M15 9l-6 6M9 9l6 6" />
              </svg>
            </button>
          )}
          <button type="submit" className="btn-primary">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            Search
          </button>
        </div>
      </div>
    </form>
  );
}
