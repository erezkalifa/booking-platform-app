import { useRef, useEffect } from "react";
import { PropertyPreview } from "./PropertyPreview";

export function PropertyList({ properties, onLoadMore, hasMore }) {
  const observerRef = useRef();
  const loadingRef = useRef(null);

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
        <PropertyPreview key={property.id} property={property} />
      ))}
      {hasMore && (
        <div ref={loadingRef} className="loading-more">
          <div className="loader"></div>
        </div>
      )}
    </div>
  );
}
