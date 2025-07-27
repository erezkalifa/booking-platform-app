import { useNavigate } from "react-router-dom";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="error-container">
        <div className="error-content">
          <h1 className="error-title">404</h1>
          <h2>Page Not Found</h2>
          <p>The page you're looking for doesn't exist or has been moved.</p>
          <button
            className="btn btn-primary mt-md"
            onClick={() => navigate("/properties")}
          >
            Back to Properties
          </button>
        </div>
      </div>
    </div>
  );
}
