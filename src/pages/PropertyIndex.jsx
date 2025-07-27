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

  return (
    <main className="property-index">
      <PropertyFilter
        filterBy={filterBy}
        onSetFilter={onSetFilter}
        isFiltering={isFiltering}
      />

      {error && (
        <div
          className="error-alert"
          style={{
            backgroundColor: "#fee2e2",
            border: "1px solid #ef4444",
            borderRadius: "8px",
            padding: "16px",
            margin: "24px auto",
            maxWidth: "1600px",
            color: "#991b1b",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9v5m0 0h2m-2 0H9m2-9v4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          {error}
          <button
            onClick={() => loadProperties(filterBy)}
            style={{
              marginLeft: "auto",
              padding: "4px 8px",
              backgroundColor: "#991b1b",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {!error && properties.length === 0 ? (
        <div className="no-results">
          <h3>No Properties Found</h3>
          <p>Try adjusting your filters to find more properties</p>
        </div>
      ) : (
        <>
          <div
            style={{
              maxWidth: "1600px",
              margin: "32px auto",
              padding: "0 24px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                backgroundColor: "#3498db",
                padding: "8px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                style={{ display: "block" }}
              >
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#1a1a1a",
                }}
              >
                {properties.length}
              </span>
              <span
                style={{
                  fontSize: "24px",
                  color: "#4b5563",
                  fontWeight: "500",
                }}
              >
                Properties Available
              </span>
            </div>
            {isFiltering && (
              <div
                className="filtering-spinner"
                style={{
                  width: "24px",
                  height: "24px",
                  borderWidth: "3px",
                }}
              ></div>
            )}
          </div>

          <PropertyList properties={properties} />
        </>
      )}
    </main>
  );
}
