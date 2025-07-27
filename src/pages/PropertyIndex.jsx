import { useEffect, useState } from "react";
import { propertyService } from "../services/property.service";
import { PropertyList } from "../cmps/PropertyList";
import { PropertyFilter } from "../cmps/PropertyFilter";
import { getErrorMessage } from "../utils/api.utils";
import { showErrorMsg } from "../services/event-bus.service";

export function PropertyIndex() {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPricingLoading, setIsPricingLoading] = useState(false);
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

  const handlePriceLoadingChange = (isLoading) => {
    setIsPricingLoading(isLoading);
  };

  const loadProperties = async (filters) => {
    try {
      setIsFiltering(true);
      setError(null);

      const data = await propertyService.query(filters);
      setProperties(data);
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      showErrorMsg(errorMsg);
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

  // Show loading state if either initial load or pricing data is being loaded
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
            {(isFiltering || isPricingLoading) && (
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

          <PropertyList
            properties={properties}
            onPriceLoadingChange={handlePriceLoadingChange}
          />
        </>
      )}
    </main>
  );
}
