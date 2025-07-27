import { useState, useEffect } from "react";
import { PropertyList } from "../cmps/PropertyList";
import { propertyService } from "../services/property.service";
import { wishlistService } from "../services/wishlist.service";

export function WishlistPage() {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWishlistProperties();
  }, []);

  const loadWishlistProperties = async () => {
    try {
      setIsLoading(true);
      const wishlistIds = wishlistService.getWishlist();
      if (wishlistIds.length === 0) {
        setProperties([]);
        return;
      }

      const allProperties = await propertyService.query();
      const wishlistProperties = allProperties.filter((property) =>
        wishlistIds.includes(property.id)
      );
      setProperties(wishlistProperties);
    } catch (err) {
      console.error("Failed to load wishlist properties:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="wishlist-page">
        <div className="page-header">
          <h1>My Wishlist</h1>
        </div>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="page-header">
          <h1>My Wishlist</h1>
        </div>
        <div className="empty-state">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="empty-icon"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <h2>No saved properties yet</h2>
          <p>
            Click the heart icon on any property to save it to your wishlist
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="page-header">
        <h1>My Wishlist</h1>
        <p>
          {properties.length} saved{" "}
          {properties.length === 1 ? "property" : "properties"}
        </p>
      </div>
      <PropertyList properties={properties} onLoadMore={null} hasMore={false} />
    </div>
  );
}
