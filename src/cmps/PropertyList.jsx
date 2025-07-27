import { useRef, useEffect, useState, useCallback } from "react";
import { PropertyPreview } from "./PropertyPreview";

export function PropertyList({
  properties,
  onLoadMore,
  hasMore,
  onPriceLoadingChange,
}) {
  const observerRef = useRef();
  const loadingRef = useRef(null);
  const [loadingPrices, setLoadingPrices] = useState(new Set());

  const handlePriceLoadingChange = useCallback((propertyId, isLoading) => {
    setLoadingPrices((prev) => {
      const newSet = new Set(prev);
      if (isLoading) {
        newSet.add(propertyId);
      } else {
        newSet.delete(propertyId);
      }
      return newSet;
    });
  }, []);

  // Notify parent about loading state changes
  useEffect(() => {
    if (onPriceLoadingChange) {
      onPriceLoadingChange(loadingPrices.size > 0);
    }
  }, [loadingPrices, onPriceLoadingChange]);

  // Reset loading state when properties change
  useEffect(() => {
    setLoadingPrices(new Set());
  }, [properties]);

  useEffect(() => {
    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    // Start observing
    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current);
    }

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [onLoadMore, hasMore]);

  if (!properties.length) return null;

  return (
    <div className="property-list">
      {properties.map((property) => (
        <PropertyPreview
          key={property.id}
          property={property}
          onPriceLoadingChange={(isLoading) =>
            handlePriceLoadingChange(property.id, isLoading)
          }
        />
      ))}
      {hasMore && (
        <div ref={loadingRef} className="loading-more">
          <div className="loader"></div>
        </div>
      )}
    </div>
  );
}
