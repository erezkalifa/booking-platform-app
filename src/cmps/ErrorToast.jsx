import { useState, useEffect } from "react";

export function ErrorToast({ message, onDismiss, type = "Error" }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-hide after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Wait for animation to complete before removing
      setTimeout(() => onDismiss(), 500);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className={`error-toast ${!isVisible ? "hide" : ""}`}>
      <div className="error-toast-header">
        <span className="error-toast-type">{type}</span>
      </div>

      <div className="error-toast-content">
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
        <span className="error-toast-message">{message}</span>
        <button
          className="error-toast-close"
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onDismiss(), 500);
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
