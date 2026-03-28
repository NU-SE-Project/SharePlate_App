import api from '../../../../utils/api';

/**
 * Get all available food donations from restaurants.
 * @returns {Promise<Array>} List of donations
 */
export const getAvailableDonatedFood = async () => {
  const response = await api.get('/foodsdonate');
  return response.data;
};

/**
 * Create a request for a specific food donation.
 * @param {string} food_id - The ID of the food donation.
 * @param {Object} data - Request details (restaurant_id, foodBank_id, requestedQuantity).
 */
export const requestFoodDonation = async (food_id, data) => {
  const response = await api.post(`/request/${food_id}`, data);
  return response.data;
};

/**
 * Get all requests made by a specific food bank.
 * @param {string} foodBank_id - The ID of the food bank.
 */
export const getMyFoodRequests = async (foodBank_id) => {
  const response = await api.get(`/request/${foodBank_id}`);
  return response.data?.requests || [];
};
