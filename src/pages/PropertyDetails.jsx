import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { propertyService } from "../services/property.service";
import { ImageModal } from "../cmps/ImageModal";
import { PhotoGallery } from "../cmps/PhotoGallery";

export function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPriceLoading, setIsPriceLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [showGallery, setShowGallery] = useState(false);

  // Format prices
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  useEffect(() => {
    loadProperty();
  }, [id]);

  useEffect(() => {
    if (property) {
      loadPricing();
    }
  }, [property]);

  async function loadProperty() {
    try {
      setIsLoading(true);
      setError(null);
      const data = await propertyService.getById(id);
      setProperty(data);
    } catch (err) {
      console.error("Error loading property:", err);
      setError(
        err.message ||
          "Failed to load property details. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function loadPricing() {
    try {
      setIsPriceLoading(true);
      const { checkIn, checkOut } = propertyService.getDefaultDates();
      const pricingData = await propertyService.getPricing(
        id,
        checkIn,
        checkOut,
        2
      );
      setPricing(pricingData);
    } catch (err) {
      console.error("Error loading pricing:", err);
    } finally {
      setIsPriceLoading(false);
    }
  }

  if (isLoading) {
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
          <h3>Error</h3>
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h3>Property Not Found</h3>
          <p>
            The property you're looking for doesn't exist or has been removed.
          </p>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const renderPrice = () => {
    if (isPriceLoading) {
      return (
        <div className="price-loading">
          <span>Loading price...</span>
        </div>
      );
    }

    if (!pricing) {
      return (
        <div className="price-error">
          <span>Price unavailable</span>
        </div>
      );
    }

    return (
      <>
        <span className="price-amount">
          {formatter.format(pricing.day_rate)}
        </span>
        <span className="price-period">per night</span>
        {pricing.cleaning_fee > 0 && (
          <div className="cleaning-fee">
            + {formatter.format(pricing.cleaning_fee)} cleaning fee
          </div>
        )}
      </>
    );
  };

  const handleImageClick = (image) => {
    setSelectedImageId(image.id);
    setShowModal(true);
  };

  const handleShowAllPhotos = () => {
    setShowGallery(true);
  };

  return (
    <div className="property-details">
      {showModal && property.images.length > 0 && (
        <ImageModal
          images={property.images}
          selectedImageId={selectedImageId}
          title={property.title}
          onClose={() => setShowModal(false)}
        />
      )}

      {showGallery && (
        <PhotoGallery
          images={property.images}
          title={property.title}
          onClose={() => setShowGallery(false)}
        />
      )}

      {/* Header Section */}
      <header className="property-header">
        <div className="container">
          <button className="back-button" onClick={() => navigate(-1)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Listings
          </button>
          <h1 className="property-title">{property.title}</h1>
          <div className="property-meta">
            <span className="property-location">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              </svg>
              {property.location}
            </span>
            <span className="property-price">{renderPrice()}</span>
          </div>
        </div>
      </header>

      {/* Gallery Section */}
      <section className="gallery-section">
        <div className="container">
          <div className="gallery-grid">
            {/* Main large image */}
            <div
              className="gallery-main"
              onClick={() => handleImageClick(property.images[0])}
            >
              {property.images.length > 0 && (
                <img
                  src={property.images[0].large}
                  alt={
                    property.images[0].caption || `${property.title} - Featured`
                  }
                />
              )}
            </div>

            {/* Thumbnail grid */}
            <div className="gallery-thumbnails">
              {property.images.slice(1, 5).map((image, index) => (
                <div
                  key={image.id}
                  className={`thumbnail ${
                    selectedImage === index + 1 ? "active" : ""
                  }`}
                  onClick={() => handleImageClick(image)}
                >
                  <img
                    src={image.large}
                    alt={
                      image.caption || `${property.title} - Image ${index + 2}`
                    }
                    loading="lazy"
                  />
                </div>
              ))}
            </div>

            {/* Show all photos button */}
            {property.images.length > 5 && (
              <button className="show-all-photos" onClick={handleShowAllPhotos}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                Show all photos ({property.images.length})
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container">
        <div className="property-content">
          {/* Left Column - Property Details */}
          <div className="property-main">
            {/* Quick Info */}
            <section className="quick-info">
              <div className="info-item">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>{property.bedrooms} Bedrooms</span>
              </div>
              <div className="info-item">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 12h-3m3 0l-3 3m3-3l-3-3M3 12h3m-3 0l3-3m-3 3l3 3" />
                </svg>
                <span>{property.bathrooms} Bathrooms</span>
              </div>
              <div className="info-item">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Up to {property.maxGuests} guests</span>
              </div>
            </section>

            {/* Description */}
            <section className="description-section">
              <h2>About this property</h2>
              <p>{property.description}</p>
            </section>

            {/* Amenities */}
            <section className="amenities-section">
              <h2>What this place offers</h2>
              <div className="amenities-grid">
                {property.amenities?.map((amenity, index) => (
                  <div key={index} className="amenity-item">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Booking Widget */}
          <aside className="booking-section">
            <div className="booking-widget">
              <h3>Book this property</h3>
              <div className="booking-price">{renderPrice()}</div>
              <div className="booking-form">
                {/* Add your booking form component here */}
                <button className="btn btn-primary btn-block">
                  Check Availability
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
