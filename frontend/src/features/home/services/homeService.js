import api from "../../../utils/api";

export async function getLandingOverview() {
  const response = await api.get("/dashboard/landing");
  return response.data?.data || { stats: {}, activity: [], generatedAt: null };
}
