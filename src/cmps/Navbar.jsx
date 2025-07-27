import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { wishlistService } from "../services/wishlist.service";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleWishlistClick = () => {
    setIsMenuOpen(false);
    // Will be implemented later
    navigate("/wishlist");
  };

  const handleLoginClick = () => {
    setIsMenuOpen(false);
    // Will be implemented later
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-content">
        <Link to="/" className="nav-logo">
          <span className="logo-text">Booking Platform</span>
        </Link>

        <div className="nav-menu" ref={menuRef}>
          <button
            className={`menu-button ${isMenuOpen ? "active" : ""}`}
            onClick={handleMenuClick}
            aria-expanded={isMenuOpen}
            aria-label="Menu"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="menu-icon"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="user-icon"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M20 21a8 8 0 10-16 0" />
            </svg>
          </button>

          {isMenuOpen && (
            <div className="menu-dropdown">
              <button className="menu-item" onClick={handleWishlistClick}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                Wishlist
                <span className="wishlist-count">
                  {wishlistService.getWishlist().length}
                </span>
              </button>
              <button className="menu-item disabled" disabled>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Login
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
