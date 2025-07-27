import { Link } from "react-router-dom";
import { showErrorMsg } from "../services/event-bus.service";

export function Navbar() {
  const handleLogin = () => {
    showErrorMsg(
      "Login functionality is not implemented yet. Please try again later!"
    );
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
