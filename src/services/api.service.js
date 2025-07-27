import axios from "axios";

// API Configuration
const BASE_URL = "/open_api/v1";
const CLIENT_ID = "boom_a70ed11058d102023431";
const CLIENT_SECRET =
  "8fc601324e8c0e47a05e2c5f98f1a07b1d747e8ff12b51fc8da64b280182ba75";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000, // 15 seconds timeout
});

// Authentication state
let accessToken = null;
let tokenExpiry = null;

// Check if token is expired
const isTokenExpired = () => {
  if (!tokenExpiry) return true;
  return Date.now() >= tokenExpiry;
};

// Get access token
const getAccessToken = async () => {
  try {
    // Return existing token if valid
    if (accessToken && !isTokenExpired()) {
      return accessToken;
    }

    // Request new token
    const response = await axios.post(
      `${BASE_URL}/auth/token`,
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data.access_token) {
      throw new Error("No access token received");
    }

    // Store token and expiry
    accessToken = response.data.access_token;
    tokenExpiry = response.data.expires_in * 1000; // Convert to milliseconds

    return accessToken;
  } catch (error) {
    console.error(
      "Authentication failed:",
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.message || "Authentication failed");
  }
};

// Add authentication token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      // Don't add token for auth endpoints
      if (config.url.includes("/auth/")) {
        return config;
      }

      const token = await getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Debug the outgoing request
      console.log("API Request:", {
        url: config.url,
        method: config.method,
        params: config.params,
        headers: config.headers,
      });

      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors by refreshing token and retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      accessToken = null; // Force token refresh

      try {
        const token = await getAccessToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (retryError) {
        return Promise.reject(retryError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
