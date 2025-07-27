import { useEffect, useState } from "react";
import { propertyService } from "../services/property.service";
import { PropertyList } from "../cmps/PropertyList";
import { PropertyFilter } from "../cmps/PropertyFilter";
import { getErrorMessage } from "../utils/api.utils";

export function PropertyIndex() {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState(null);
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [filterBy, setFilterBy] = useState({
    city: "",
    from: "",
    to: "",
    guests: 1,
    priceMin: "",
    priceMax: "",
  });

  useEffect(() => {
    if (error) {
      setIsErrorVisible(true);
      // Auto-hide error after 5 seconds
      const timer = setTimeout(() => {
        setIsErrorVisible(false);
        setTimeout(() => setError(null), 500); // Clear error after animation
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const loadProperties = async (filters) => {
    try {
      setIsFiltering(true);
      setError(null);

      const data = await propertyService.query(filters);
      setProperties(data);
    } catch (err) {
      setError(getErrorMessage(err));
      // Keep the existing properties if there's an error during filtering
      if (!isFiltering) {
        setProperties([]);
      }
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

      {error && isErrorVisible && (
        <div className={`error-toast ${!isErrorVisible ? "hide" : ""}`}>
          <svg
            className="error-toast-icon"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9v5m0 0h2m-2 0H9m2-9v4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span className="error-toast-message">{error}</span>
          <button
            className="error-toast-close"
            onClick={() => {
              setIsErrorVisible(false);
              setTimeout(() => setError(null), 500);
            }}
          >
            Dismiss
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
