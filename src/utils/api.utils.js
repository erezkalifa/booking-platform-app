/**
 * Custom API Error class that includes HTTP status and response data
 */
export class ApiError extends Error {
  constructor(status, message, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Handles API response checking and JSON parsing
 * @param {Response} response - Fetch API Response object
 * @returns {Promise<any>} Parsed response data
 * @throws {ApiError} When response is not ok
 */
export async function handleApiResponse(response) {
  // For axios responses
  if (response.data !== undefined) {
    // Even with status 200, throw error if data is invalid
    if (!response.data) {
      throw new ApiError(response.status, "Empty response received", response);
    }
    return response.data;
  }

  // For fetch responses
  let data;
  try {
    data = await response.json();
  } catch (error) {
    console.error("Response parsing error:", {
      status: response.status,
      statusText: response.statusText,
      error,
    });

    throw new ApiError(response.status, "Failed to parse response data", error);
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.message || `API Error: ${response.status} ${response.statusText}`,
      data
    );
  }

  return data;
}

/**
 * Creates a user-friendly error message from an error object
 */
export function getErrorMessage(error) {
  if (error instanceof ApiError) {
    // Don't show status code in user-facing messages
    return error.message.replace(/API Error: \d+ /, "");
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
}
