// src/services/property.service.js
import api from "./api.service";
import { ApiError, handleApiResponse } from "../utils/api.utils";

export const propertyService = {
  query,
  getById,
  save,
  remove,
  getCities,
  getRegions,
  getPricing,
  getDefaultDates,
};

function formatDate(date) {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function query(filterBy = {}) {
  try {
    const { checkIn, checkOut } = getDefaultDates();

    // First, try to get all listings
    const response = await api.get("/listings", {
      params: {
        page: 1,
      },
    });

    const data = await handleApiResponse(response);

    if (!data.listings) {
      throw new ApiError(
        500,
        "Invalid API response structure: missing listings"
      );
    }

    // Then filter locally by various criteria
    let properties = data.listings;

    // Filter by search term (title, city, nickname, address)
    if (filterBy.city) {
      const searchLower = filterBy.city.toLowerCase();
      properties = properties.filter((property) => {
        const title = (property.title || "").toLowerCase();
        const cityName = (property.city_name || "").toLowerCase();
        const nickname = (property.nickname || "").toLowerCase();
        const address = (property.address?.city || "").toLowerCase();

        return (
          title.includes(searchLower) ||
          cityName.includes(searchLower) ||
          nickname.includes(searchLower) ||
          address.includes(searchLower)
        );
      });
    }

    // Filter by bedrooms
    if (filterBy.bedrooms) {
      const bedroomsCount = Number(filterBy.bedrooms);
      properties = properties.filter((property) => {
        const propertyBedrooms = Number(property.bedrooms) || 0;
        return bedroomsCount === 5
          ? propertyBedrooms >= 5
          : propertyBedrooms === bedroomsCount;
      });
    }

    // Filter by guests
    if (filterBy.guests) {
      const guestsCount = Number(filterBy.guests);
      properties = properties.filter((property) => {
        const propertyGuests = Number(property.accommodates) || 0;
        return guestsCount === 6
          ? propertyGuests >= 6
          : propertyGuests === guestsCount;
      });
    }

    // Filter by price if price range is specified
    if (filterBy.priceMin || filterBy.priceMax) {
      // First get pricing info for all properties
      const pricingPromises = properties.map(async (property) => {
        try {
          const pricingData = await getPricing(
            property.id,
            checkIn,
            checkOut,
            2 // Default number of guests
          );
          return {
            ...property,
            pricing: pricingData,
          };
        } catch (err) {
          console.error(
            `Failed to get pricing for property ${property.id}:`,
            err
          );
          return { ...property, pricing: null };
        }
      });

      // Wait for all pricing info
      properties = await Promise.all(pricingPromises);

      // Now filter by price
      properties = properties.filter((property) => {
        const dayRate = property.pricing?.day_rate || 0;
        const minPrice = Number(filterBy.priceMin) || 0;
        const maxPrice = Number(filterBy.priceMax) || Infinity;

        return (
          dayRate >= minPrice && (maxPrice === Infinity || dayRate <= maxPrice)
        );
      });
    }

    return properties.map(transformPropertyData);
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(500, "Failed to fetch properties", err);
  }
}

async function getById(id) {
  try {
    const response = await api.get(`/listings/${id}`);
    const data = await handleApiResponse(response);

    if (!data.listing) {
      throw new ApiError(404, "Property not found");
    }

    return transformPropertyData(data.listing);
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(500, "Failed to fetch property details", err);
  }
}

async function save(property) {
  try {
    if (property.id) {
      const response = await api.put(`/listings/${property.id}`, property);
      return transformPropertyData(response.data.listing);
    } else {
      const response = await api.post("/listings", property);
      return transformPropertyData(response.data.listing);
    }
  } catch (error) {
    console.error(
      "Error saving property:",
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.message || "Failed to save property");
  }
}

async function remove(id) {
  try {
    await api.delete(`/listings/${id}`);
  } catch (error) {
    console.error(
      "Error removing property:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to remove property"
    );
  }
}

async function getCities() {
  try {
    const response = await api.get("/listings/cities");
    return response.data;
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  }
}

async function getRegions() {
  try {
    const response = await api.get("/listings/regions");
    return response.data;
  } catch (error) {
    console.error("Error fetching regions:", error);
    return [];
  }
}

async function getPricing(id, checkIn, checkOut, guestsCount, retryCount = 0) {
  try {
    const response = await api.get(`/listings/${id}/pricing`, {
      params: {
        check_in: checkIn,
        check_out: checkOut,
        guests_count: guestsCount,
      },
    });

    // Check if we have valid data
    if (!response.data) {
      throw new ApiError(response.status, "No data received from pricing API");
    }

    // Return the pricing info or default values
    return {
      day_rate: response.data.info?.day_rate || 0,
      cleaning_fee: response.data.info?.cleaning_fee || 0,
      total: response.data.info?.total || 0,
    };
  } catch (err) {
    // If we haven't exceeded max retries and it's a network error, retry
    if (retryCount < 2 && (!err.response || err.code === "ECONNABORTED")) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * (retryCount + 1))
      ); // Exponential backoff
      return getPricing(id, checkIn, checkOut, guestsCount, retryCount + 1);
    }

    console.error(`Pricing API Error for property ${id}:`, {
      error: err,
      message: err.message,
      status: err.status,
      data: err.data,
    });

    // If it's a network error or other non-API error
    if (!(err instanceof ApiError)) {
      throw new ApiError(500, "Failed to fetch property pricing");
    }

    throw err;
  }
}

function getDefaultDates() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

  return {
    checkIn: tomorrow.toISOString().split("T")[0],
    checkOut: dayAfterTomorrow.toISOString().split("T")[0],
  };
}

function transformPropertyData(apiProperty) {
  if (!apiProperty) return null;

  const images =
    apiProperty.pictures?.map((pic) => ({
      id: pic.id || pic._id || String(Math.random()),
      large: pic.large || pic.original || pic.regular || pic.picture,
      regular: pic.regular || pic.large || pic.original || pic.picture,
      original: pic.original || pic.large || pic.regular || pic.picture,
      thumbnail:
        pic.thumbnail ||
        pic.regular ||
        pic.large ||
        pic.original ||
        pic.picture,
      caption: pic.caption || "",
    })) || [];

  return {
    id: apiProperty.id,
    title: apiProperty.title || apiProperty.nickname || "Unnamed Property",
    description:
      apiProperty.marketing_content?.description ||
      apiProperty.description ||
      "No description available",
    location:
      apiProperty.city_name ||
      apiProperty.address?.city ||
      "Location not specified",
    images,
    bedrooms: Number(apiProperty.beds) || 0,
    bathrooms: Number(apiProperty.baths) || 0,
    maxGuests: Number(apiProperty.accommodates) || 1,
    amenities: apiProperty.amenities || [],
    type: apiProperty.ota_type || "Property",
    latitude: apiProperty.lat,
    longitude: apiProperty.lng,
    address: apiProperty.address || {},
  };
}
