import api from "../../../utils/api";

export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

export const loginWithGoogle = async (credential) => {
  const response = await api.post("/auth/google", { credential });
  return response.data;
};

export const completeGoogleSignup = async (payload) => {
  const response = await api.post("/auth/google/complete", payload);
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const refresh = async () => {
  const response = await api.post("/auth/refresh");
  return response.data;
};

export const logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export const logoutAll = async () => {
  const response = await api.post("/auth/logout-all");
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

export const validateResetToken = async (token) => {
  const response = await api.get("/auth/validate-reset-token", {
    params: { token },
  });
  return response.data;
};

export const resetPassword = async (data) => {
  const response = await api.post("/auth/reset-password", data);
  return response.data;
};

export const sendVerification = async () => {
  const response = await api.post("/auth/send-verification");
  return response.data;
};

export const resendVerification = async (email) => {
  const response = await api.post("/auth/resend-verification", { email });
  return response.data;
};

export const verifyEmail = async (token) => {
  const response = await api.get("/auth/verify-email", {
    params: { token },
  });
  return response.data;
};

export const changePassword = async (payload) => {
  const response = await api.post("/auth/change-password", payload);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/user/me");
  return response.data;
};

export const updateMe = async (userData) => {
  const response = await api.patch("/user/me", userData);
  return response.data;
};
