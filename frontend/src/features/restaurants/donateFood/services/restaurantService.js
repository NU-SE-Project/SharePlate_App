import api from '../../../../utils/api';

// Direct Donation Management
export const createDonation = async (donationData) => {
  // If FormData is provided (file upload), let axios set multipart headers
  const config = donationData instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined;
  const response = await api.post('/foodsdonate', donationData, config);
  return response.data;
};

export const getMyDonations = async (restaurantId) => {
  const response = await api.get(`/foodsdonate/restaurant/${restaurantId}`);
  return response.data;
};

export const updateDonation = async (id, donationData) => {
  const config = donationData instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined;
  const response = await api.put(`/foodsdonate/${id}`, donationData, config);
  return response.data;
};

export const deleteDonation = async (id) => {
  const response = await api.delete(`/foodsdonate/${id}`);
  return response.data;
};

// Food Bank Requests Management
export const getAllOpenRequests = async () => {
  const response = await api.get('/foodbank-request');
  return response.data;
};

// Note: endpoint now returns all requests (including fulfilled) with acceptance breakdown
export const getAllRequestsWithAcceptances = async () => {
  const response = await api.get('/foodbank-request');
  return response.data;
};

export const acceptFoodRequest = async (requestId, quantity) => {
  const response = await api.post(`/accepts/foodbank-request/${requestId}`, { quantity });
  return response.data;
};

export const getDonationRequests = async (restaurantId) => {
  const response = await api.get(`/request/restaurant/${restaurantId}`);
  return response.data;
};

export const approveDonationRequest = async (requestId, quantity) => {
  // quantity is optional for approve route; service handles it server-side
  const response = await api.put(`/request/approve/${requestId}`, { quantity });
  return response.data;
};

export const rejectDonationRequest = async (requestId) => {
  const response = await api.put(`/request/reject/${requestId}`);
  return response.data;
};


// ✅ Fetches the specific donation
export const getSingleDonation = async (donationId) => {
  const response = await api.get(`/foodsdonate/${donationId}`);
  return response.data;
};

// ✅ Fetches only requests for the specific donation
export const getRequestsForDonation = async (donationId) => {
  const response = await api.get(`/request/donation/${donationId}`);
  return response.data;
};
export const verifyPickupOTP = async (pickupId, otp) => {
  const response = await api.post('/pickup/verify', { pickupId, otp });
  return response.data;
};

export const resendPickupOTP = async (pickupId) => {
  const response = await api.post('/pickup/resend', { pickupId });
  return response.data;
};
