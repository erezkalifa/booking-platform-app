import { useState } from "react";
import { ApiError } from "../utils/api.utils";

// Simulated API calls that return different types of errors
const simulatedApiCalls = {
  success: async () => {
    return { data: { message: "Success!" } };
  },

  networkError: async () => {
    throw new Error("Network Error: Failed to fetch");
  },

  apiError404: async () => {
    throw new ApiError(404, "Resource not found");
  },

  apiError500: async () => {
    throw new ApiError(500, "Internal Server Error");
  },

  emptyResponse: async () => {
    return { data: null };
  },

  invalidJson: async () => {
    throw new ApiError(200, "Failed to parse response data");
  },

  asyncError: async () => {
    // Simulates an error in async component rendering
    throw new Error("Async Component Error");
  },
};

export function ErrorDemo() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleApiCall = async (type) => {
    try {
      setIsLoading(true);
      setError(null);
      setResult(null);

      const response = await simulatedApiCalls[type]();
      setResult(response.data);
    } catch (err) {
      console.error("Error in demo:", err);
      if (err instanceof ApiError) {
        setError(`API Error (${err.status}): ${err.message}`);
      } else {
        setError(err.message || "An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const buttonStyle = {
    padding: "8px 16px",
    margin: "4px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    cursor: "pointer",
    backgroundColor: "#fff",
    transition: "all 0.2s",
  };

  const errorStyle = {
    padding: "16px",
    margin: "16px 0",
    borderRadius: "8px",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #ef4444",
  };

  const successStyle = {
    padding: "16px",
    margin: "16px 0",
    borderRadius: "8px",
    backgroundColor: "#dcfce7",
    color: "#166534",
    border: "1px solid #22c55e",
  };

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Error Handling Demo</h1>
      <p>Click the buttons below to test different error scenarios:</p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "24px",
        }}
      >
        <button style={buttonStyle} onClick={() => handleApiCall("success")}>
          Test Success
        </button>

        <button
          style={buttonStyle}
          onClick={() => handleApiCall("networkError")}
        >
          Test Network Error
        </button>

        <button
          style={buttonStyle}
          onClick={() => handleApiCall("apiError404")}
        >
          Test 404 Error
        </button>

        <button
          style={buttonStyle}
          onClick={() => handleApiCall("apiError500")}
        >
          Test 500 Error
        </button>

        <button
          style={buttonStyle}
          onClick={() => handleApiCall("emptyResponse")}
        >
          Test Empty Response
        </button>

        <button
          style={buttonStyle}
          onClick={() => handleApiCall("invalidJson")}
        >
          Test Invalid JSON
        </button>

        <button style={buttonStyle} onClick={() => handleApiCall("asyncError")}>
          Test Async Error
        </button>
      </div>

      {isLoading && (
        <div style={{ textAlign: "center", padding: "20px" }}>Loading...</div>
      )}

      {error && (
        <div style={errorStyle}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={successStyle}>
          <strong>Success:</strong> {JSON.stringify(result)}
        </div>
      )}

      <div style={{ marginTop: "24px" }}>
        <h2>How to Use This Demo:</h2>
        <ul>
          <li>
            <strong>Success:</strong> Shows successful API response handling
          </li>
          <li>
            <strong>Network Error:</strong> Simulates connection issues
          </li>
          <li>
            <strong>404 Error:</strong> Shows how API 404 errors are handled
          </li>
          <li>
            <strong>500 Error:</strong> Shows how server errors are handled
          </li>
          <li>
            <strong>Empty Response:</strong> Tests handling of null/empty
            responses
          </li>
          <li>
            <strong>Invalid JSON:</strong> Shows parsing error handling
          </li>
          <li>
            <strong>Async Error:</strong> Tests async component error handling
          </li>
        </ul>
      </div>
    </div>
  );
}
