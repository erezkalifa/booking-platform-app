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
};

function getDefaultDates() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  // Format dates as YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return {
    check_in: formatDate(tomorrow),
    check_out: formatDate(dayAfter),
  };
}

async function query(filterBy = {}) {
  try {
    const searchTerm = filterBy.city?.trim().toLowerCase();

    // Get default dates if none provided
    const defaultDates = getDefaultDates();
    const params = {
      page: filterBy.page || 1,
      check_in: filterBy.from || defaultDates.check_in,
      check_out: filterBy.to || defaultDates.check_out,
    };

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

async function getPricing(id, params = {}) {
  try {
    const response = await api.get(`/listings/${id}/pricing`, { params });
    return {
      nightsCount: response.data.info.nights_count,
      dayRate: response.data.info.day_rate,
      subtotal: response.data.info.subtotal,
      cleaningFee: response.data.info.cleaning_fee,
      discount: response.data.info.discount,
      taxes: response.data.info.taxes,
      total: response.data.info.total,
      securityDeposit: response.data.info.security_deposit,
    };
  } catch (error) {
    console.error(`Error fetching pricing for property ${id}:`, error);
    return null;
  }
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
