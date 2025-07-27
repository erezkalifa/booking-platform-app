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
            {(isFiltering || isPricingLoading) && (
              <div
                className="filtering-spinner"
                style={{ width: "20px", height: "20px" }}
              ></div>
            )}
          </h2>

          <PropertyList
            properties={properties}
            onPriceLoadingChange={handlePriceLoadingChange}
          />
        </>
      )}
    </main>
  );
}
