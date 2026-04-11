import api from "./api.js";

// Complaint API functions

export const complaintsApi = {
  // For restaurants and foodbanks
  createComplaint: async (data) => {
    const response = await api.post("/complaints", data);
    return response.data;
  },

  getMyComplaints: async () => {
    const response = await api.get("/complaints/my");
    return response.data;
  },

  getComplaintTargets: async () => {
    const response = await api.get("/complaints/targets");
    return response.data;
  },

  // For admin
  getAllComplaints: async (params = {}) => {
    const response = await api.get("/complaints", { params });
    return response.data;
  },

  replyToComplaint: async (complaintId, reply) => {
    const response = await api.patch(`/complaints/${complaintId}/reply`, {
      adminReply: reply,
    });
    return response.data;
  },
};
