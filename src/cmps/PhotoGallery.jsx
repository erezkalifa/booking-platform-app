import { useState, useEffect } from "react";

export function PhotoGallery({ images, title, onClose }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    // Add event listener for ESC key
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);

    // Add event listeners for arrow keys
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === "ArrowRight") {
        setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // Prevent body scroll
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleEsc);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [onClose, images.length]);

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="photo-gallery-overlay">
      <div className="photo-gallery-header">
        <button className="close-button" onClick={onClose}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div className="gallery-counter">
          {selectedIndex + 1} / {images.length}
        </div>
      </div>

      <div className="photo-gallery-content">
        <button className="nav-button prev" onClick={handlePrevious}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="main-image-container">
          <img
            src={images[selectedIndex].large || images[selectedIndex].original}
            alt={
              images[selectedIndex].caption ||
              `${title} - Image ${selectedIndex + 1}`
            }
          />
          {images[selectedIndex].caption && (
            <p className="image-caption">{images[selectedIndex].caption}</p>
          )}
        </div>

        <button className="nav-button next" onClick={handleNext}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="thumbnails-container">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`thumbnail ${selectedIndex === index ? "active" : ""}`}
            onClick={() => setSelectedIndex(index)}
          >
            <img
              src={image.thumbnail || image.large}
              alt={image.caption || `${title} - Thumbnail ${index + 1}`}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
