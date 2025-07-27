import { useEffect, useState, useCallback } from "react";
import { propertyService } from "../services/property.service";
import { PropertyList } from "../cmps/PropertyList";
import { PropertyFilter } from "../cmps/PropertyFilter";

export function PropertyIndex() {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterBy, setFilterBy] = useState({
    city: "",
    from: "",
    to: "",
    guests: 1,
    priceMin: "",
    priceMax: "",
  });

  const loadProperties = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await propertyService.query({
        ...filterBy,
        page: 1, // Always fetch first page for now
      });

      setProperties(data);
    } catch (err) {
      console.error("Error loading properties:", err);
      setError(
        err.message || "Failed to load properties. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  }, [filterBy]);

  useEffect(() => {
    loadProperties();
  }, [filterBy, loadProperties]);

  function onSetFilter(updatedFilter) {
    setFilterBy((prev) => ({
      ...prev,
      ...updatedFilter,
    }));
  }

  if (isLoading && !properties.length) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h3>Error Loading Properties</h3>
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={loadProperties}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="property-index">
      <div className="container">
        {/* Filter section */}
        <section className="filter-section">
          <PropertyFilter filterBy={filterBy} onSetFilter={onSetFilter} />
        </section>

        {/* Results section */}
        <section className="results-section">
          {properties.length === 0 ? (
            <div className="no-results">
              <h3>No Properties Found</h3>
              <p>Try adjusting your filters to find more properties</p>
            </div>
          ) : (
            <>
              <div className="results-header">
                <h2>{properties.length} Properties Available</h2>
                <p className="text-secondary">
                  {filterBy.city ? `in ${filterBy.city}` : "in all locations"}
                </p>
              </div>

              <PropertyList properties={properties} />
            </>
          )}
        </section>
      </div>
    </main>
  );
}
