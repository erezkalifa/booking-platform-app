import { useEffect, useState } from "react";
import { propertyService } from "../services/property.service";
import { PropertyList } from "../cmps/PropertyList";
import { PropertyFilter } from "../cmps/PropertyFilter";

export function PropertyIndex() {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
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
      setIsFiltering(true);
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
      setIsFiltering(false);
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
      <PropertyFilter
        filterBy={filterBy}
        onSetFilter={onSetFilter}
        isFiltering={isFiltering}
      />

      {properties.length === 0 ? (
        <div className="no-results">
          <h3>No Properties Found</h3>
          <p>Try adjusting your filters to find more properties</p>
        </div>
      ) : (
        <>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "600",
              color: "#2c3e50",
              margin: "32px 24px",
              padding: "0 16px",
              borderLeft: "4px solid #3498db",
              maxWidth: "1600px",
              marginLeft: "auto",
              marginRight: "auto",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            {properties.length} Properties Available
            {isFiltering && (
              <div
                className="filtering-spinner"
                style={{ width: "20px", height: "20px" }}
              ></div>
            )}
          </h2>

          <PropertyList properties={properties} />
        </>
      )}
    </main>
  );
}
