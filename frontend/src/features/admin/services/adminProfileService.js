import api from "../../../utils/api";

/**
 * Service to handle current admin's profile operations
 */
export const getMyProfile = async () => {
  const response = await api.get("/user/me");
  return response.data;
};

export const updateMyProfile = async (profileData) => {
  // backend: PATCH /api/user/me
  const response = await api.patch("/user/me", profileData);
  return response.data;
};
