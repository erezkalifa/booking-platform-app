import { useEffect, useState } from "react";
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

  const loadProperties = async (filters) => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await propertyService.query(filters);
      setProperties(data);
    } catch (err) {
      console.error("Error loading properties:", err);
      setError(
        err.message || "Failed to load properties. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    loadProperties({});
  }, []);

  function onSetFilter(updatedFilter) {
    setFilterBy(updatedFilter);
    loadProperties(updatedFilter);
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
          <button
            className="btn btn-secondary"
            onClick={() => loadProperties(filterBy)}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="property-index">
      <PropertyFilter filterBy={filterBy} onSetFilter={onSetFilter} />

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
    </main>
  );
}
