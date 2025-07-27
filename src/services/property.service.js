// src/services/property.service.js
import api from "./api.service";

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
    const searchTerm = filterBy.city?.trim().toLowerCase();

    // Start with minimal params
    const params = {
      page: filterBy.page || 1,
    };

    // Add dates only if explicitly provided
    if (filterBy.from) {
      params.check_in = formatDate(new Date(filterBy.from));
    }
    if (filterBy.to) {
      params.check_out = formatDate(new Date(filterBy.to));
    }

    // Add search term if provided
    if (searchTerm) {
      params.search = searchTerm;
    }

    // Add other filters only if they have values
    if (filterBy.adults) params.adults = filterBy.adults;
    if (filterBy.children) params.children = filterBy.children;
    if (filterBy.bedrooms) params.beds = filterBy.bedrooms;
    if (filterBy.bathrooms) params.baths = filterBy.bathrooms;
    if (filterBy.region) params.region = filterBy.region;

    console.log("Searching with params:", params);
    const response = await api.get("/listings", { params });

    // Log raw listings before filtering
    console.log(
      "Raw listings before filtering:",
      response.data.listings.map((listing) => ({
        id: listing.id,
        title: listing.title,
        city_name: listing.city_name,
        nickname: listing.nickname,
      }))
    );

    // If searching for a specific term, filter results more strictly
    let filteredListings = response.data.listings;
    if (searchTerm) {
      filteredListings = response.data.listings.filter((listing) => {
        const titleMatch = listing.title?.toLowerCase().includes(searchTerm);
        const cityMatch = listing.city_name?.toLowerCase().includes(searchTerm);
        const nicknameMatch = listing.nickname
          ?.toLowerCase()
          .includes(searchTerm);
        return titleMatch || cityMatch || nicknameMatch;
      });
    }

    // Log filtered results
    console.log(
      "Filtered listings:",
      filteredListings.map((listing) => ({
        id: listing.id,
        title: listing.title,
        city_name: listing.city_name,
        nickname: listing.nickname,
      }))
    );

    // Transform the data
    const transformedData = filteredListings.map((listing) => {
      const images = listing.pictures?.map((pic) => pic.picture) || [];

      return {
        id: listing.id,
        title: listing.title || "Unnamed Property",
        description:
          listing.marketing_content?.description ||
          listing.description ||
          "No description available",
        location: listing.city_name || listing.address?.city || "",
        images: images,
        pricing: {
          basePrice: listing.days_rates
            ? Object.values(listing.days_rates)[0] || 0
            : 0,
          currency: "USD",
          total:
            listing.total_price ||
            (listing.days_rates
              ? Object.values(listing.days_rates)[0] || 0
              : 0),
        },
        bedrooms: parseInt(listing.beds) || 0,
        bathrooms: parseInt(listing.baths) || 0,
        maxGuests: parseInt(listing.accommodates) || 1,
        amenities: listing.amenities || [],
        type: listing.ota_type || "Property",
        latitude: listing.lat,
        longitude: listing.lng,
        address: listing.address || {},
      };
    });

    // Log final results
    console.log("Final search results:", {
      searchTerm,
      totalFound: transformedData.length,
      results: transformedData.map((item) => ({
        id: item.id,
        title: item.title,
        location: item.location,
      })),
    });

    return transformedData;
  } catch (error) {
    console.error(
      "Error fetching properties:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch properties"
    );
  }
}

async function getById(id) {
  try {
    const response = await api.get(`/listings/${id}`);
    return transformPropertyData(response.data.listing);
  } catch (error) {
    console.error(
      "Error fetching property details:",
      error.response?.data || error.message
    );
    if (error.response?.status === 404) {
      throw new Error("Property not found");
    }
    throw new Error(
      error.response?.data?.message || "Failed to fetch property details"
    );
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

async function getPricing(id, checkIn, checkOut, guestsCount) {
  try {
    const response = await api.get(`/listings/${id}/pricing`, {
      params: {
        check_in: checkIn,
        check_out: checkOut,
        guests_count: guestsCount,
      },
    });
    return response.data.info;
  } catch (err) {
    console.error("Error fetching property pricing:", err);
    return null;
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
  const images = apiProperty.pictures?.map((pic) => pic.picture) || [];

  return {
    id: apiProperty.id,
    title: apiProperty.title || "Unnamed Property",
    description:
      apiProperty.marketing_content?.description ||
      apiProperty.description ||
      "No description available",
    location: apiProperty.city_name || apiProperty.address?.city || "",
    images: images,
    pricing: {
      basePrice: apiProperty.days_rates
        ? Object.values(apiProperty.days_rates)[0] || 0
        : 0,
      currency: "USD",
      total:
        apiProperty.total_price ||
        (apiProperty.days_rates
          ? Object.values(apiProperty.days_rates)[0] || 0
          : 0),
    },
    bedrooms: parseInt(apiProperty.beds) || 0,
    bathrooms: parseInt(apiProperty.baths) || 0,
    maxGuests: parseInt(apiProperty.accommodates) || 1,
    amenities: apiProperty.amenities || [],
    type: apiProperty.ota_type || "Property",
    latitude: apiProperty.lat,
    longitude: apiProperty.lng,
    address: apiProperty.address || {},
  };
}
