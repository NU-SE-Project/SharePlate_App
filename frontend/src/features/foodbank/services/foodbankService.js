import api from '../../../utils/api';

/**
 * Get all available food donations from restaurants.
 */
export const getAvailableDonatedFood = async () => {
  const response = await api.get('/foodsdonate');
  return response.data;
};

/**
 * Create a request for a specific restaurant donation.
 */
export const requestFoodDonation = async (food_id, data) => {
  const response = await api.post(`/request/${food_id}`, data);
  return response.data;
};

/**
 * Get all claim-style requests made by this food bank.
 */
export const getMyFoodRequests = async (foodBank_id) => {
  const response = await api.get(`/request/${foodBank_id}`);
  return response.data?.requests || [];
};

/**
 * --- Proactive Requests (Post a Need) ---
 */

/**
 * Create a new proactive request (Broadcast a Need).
 */
export const createProactiveRequest = async (data) => {
  const response = await api.post('/foodbank-request', data);
  return response.data;
};

/**
 * Get all proactive requests created by this food bank.
 */
export const getMyProactiveRequests = async (foodbankId) => {
  const response = await api.get(`/foodbank-request/foodbank/${foodbankId}`);
  return response.data?.requests || [];
};

/**
 * Delete a proactive request.
 */
export const deleteProactiveRequest = async (id) => {
  const response = await api.delete(`/foodbank-request/${id}`);
  return response.data;
};
