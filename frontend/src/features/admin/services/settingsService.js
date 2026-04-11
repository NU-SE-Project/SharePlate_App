import api from '../../../utils/api';

export const getDistanceSetting = async () => {
  const response = await api.get('/settings/distance');
  return response.data;
};

export const updateDistanceSetting = async (value) => {
  const response = await api.put('/settings/distance', { value });
  return response.data;
};
