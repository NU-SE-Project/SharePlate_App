import api from "../../../utils/api";

export const listAdminUsers = async (params = {}) => {
  const response = await api.get("/user", {
    params,
  });
  return response.data;
};

export const updateAdminUser = async (userId, payload) => {
  const response = await api.patch(`/user/${userId}`, payload);
  return response.data;
};

export const deactivateAdminUser = async (userId) => {
  const response = await api.delete(`/user/${userId}`);
  return response.data;
};
