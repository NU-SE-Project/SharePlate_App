import api from "../../../utils/api";

/**
 * Service for admin data fetching.
 */
export const fetchFoodBanks = async () => {
  // Use /user endpoint with role filter as the specific /foodbanks endpoint doesn't exist
  const response = await api.get("/user", { params: { role: "foodbank", limit: 50 } });
  // The backend returns an object with a 'data' array
  return response.data?.data || [];
};

export const fetchRestaurants = async () => {
  const response = await api.get("/user", { params: { role: "restaurant", limit: 50 } });
  return response.data?.data || [];
};

export const fetchAdminStats = async () => {
  try {
    const response = await api.get("/user/stats");
    return {
      totalUsers: response.data.totalUsers || 0,
      totalFoodBanks: response.data.totalFoodBanks || 0,
      totalRestaurants: response.data.totalRestaurants || 0,
      totalDonations: response.data.totalDonations || 0,
      activeRequests: response.data.activeRequests || 0
    };
  } catch (error) {
    console.error("Dashboard stats fetch failed:", error);
    return {
      totalUsers: 0,
      totalFoodBanks: 0,
      totalRestaurants: 0,
      totalDonations: 0,
      activeRequests: 0
    };
  }
};
