import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { propertyService } from "../services/property.service";
import { getErrorMessage } from "../utils/api.utils";

export function PropertyPreview({ property, onPriceLoadingChange }) {
  const [pricing, setPricing] = useState(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [priceError, setPriceError] = useState(null);
  const loadingRef = useRef(false);

  const {
    id,
    title,
    description,
    location,
    images = [], // Provide default empty array
    bedrooms,
    bathrooms,
    maxGuests,
    amenities,
    type,
  } = property;

  const loadPricing = useCallback(async () => {
    // Prevent multiple simultaneous loads
    if (loadingRef.current || pricing) return;

    try {
      loadingRef.current = true;
      setIsLoadingPrice(true);
      if (onPriceLoadingChange) onPriceLoadingChange(true);
      setPriceError(null);

      const { checkIn, checkOut } = propertyService.getDefaultDates();
      const pricingData = await propertyService.getPricing(
        id,
        checkIn,
        checkOut,
        2
      );
      setPricing(pricingData);
    } catch (err) {
      console.error("Failed to load pricing:", err);
      setPriceError(getErrorMessage(err));
      setPricing(null);
    } finally {
      loadingRef.current = false;
      setIsLoadingPrice(false);
      if (onPriceLoadingChange) onPriceLoadingChange(false);
    }
  }, [id, onPriceLoadingChange]);

  // Load pricing only once when component mounts
  useEffect(() => {
    loadPricing();
  }, []);

  // Reset pricing when property changes
  useEffect(() => {
    setPricing(null);
    setPriceError(null);
    loadPricing();
  }, [id]);

  // Get the first image URL safely
  const getImageUrl = (image) => {
    if (!image) return null;
    return image.large || image.regular || image.original || image.thumbnail;
  };

  // Format prices
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // Get first 3 amenities for preview
  const previewAmenities = amenities?.slice(0, 3) || [];

  const renderPrice = () => {
    if (isLoadingPrice) {
      return <div className="price-loading">Loading price...</div>;
    }

    if (priceError) {
      return (
        <div
          className="price-error"
          style={{ cursor: "pointer" }}
          onClick={(e) => {
            e.preventDefault(); // Prevent navigation
            loadPricing(); // Retry loading price
          }}
        >
          <span>Price unavailable - Retry</span>
        </div>
      );
    }

    if (!pricing || typeof pricing.day_rate === "undefined") {
      return (
        <div
          className="price-error"
          style={{ cursor: "pointer" }}
          onClick={(e) => {
            e.preventDefault();
            loadPricing();
          }}
        >
          <span>Click to load price</span>
        </div>
      );
    }

    return (
      <>
        <span className="price">{formatter.format(pricing.day_rate || 0)}</span>
        <span className="price-details">per night</span>
        {pricing.cleaning_fee > 0 && (
          <div className="cleaning-fee">
            + {formatter.format(pricing.cleaning_fee)} cleaning fee
          </div>
        )}
      </>
    );
  };

  return (
    <Link to={`/property/${id}`} className="property-preview">
      <div className="property-preview-image">
        {images.length > 0 && getImageUrl(images[0]) ? (
          <img
            src={getImageUrl(images[0])}
            alt={images[0].caption || title}
            loading="lazy"
          />
        ) : (
          <div className="no-image">No image available</div>
        )}
        {type && <div className="property-type-badge">{type}</div>}
      </div>

      <div className="property-preview-content">
        <div className="property-preview-header">
          <h3 className="property-preview-title">{title}</h3>
          <p className="property-preview-location">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            </svg>
            {location}
          </p>
        </div>

        <div className="property-preview-specs">
          <span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {maxGuests} guests
          </span>
          <span>•</span>
          <span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {bedrooms} bed{bedrooms !== 1 ? "s" : ""}
          </span>
          <span>•</span>
          <span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12h-3m3 0l-3 3m3-3l-3-3M3 12h3m-3 0l3-3m-3 3l3 3" />
            </svg>
            {bathrooms} bath{bathrooms !== 1 ? "s" : ""}
          </span>
        </div>

        {previewAmenities.length > 0 && (
          <div className="amenities-preview">
            {previewAmenities.map((amenity, index) => (
              <span key={index} className="amenity-tag">
                {amenity}
              </span>
            ))}
            {amenities?.length > 3 && (
              <span className="amenity-tag">+{amenities.length - 3} more</span>
            )}
          </div>
        )}

        <div className="property-preview-price">{renderPrice()}</div>
      </div>
    </Link>
  );
}
