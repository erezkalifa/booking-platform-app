import { Link } from "react-router-dom";
import { useError } from "./ErrorContainer";

export function Navbar() {
  const { showError } = useError();

  const handleLogin = () => {
    showError({
      message:
        "🔒 Login is currently unavailable. We're working on implementing this feature. Please try again later!",
      type: "Authentication",
    });
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-logo">
          BookingPro
        </Link>

        <div className="navbar-links">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/property" className="nav-link">
            Properties
          </Link>
        </div>

        <div className="navbar-actions">
          <button
            className="btn-login"
            onClick={handleLogin}
            style={{ cursor: "pointer" }}
          >
            Login
          </button>
          <button className="btn-signup">Sign Up</button>
        </div>
      </div>
    </nav>
  );
}
