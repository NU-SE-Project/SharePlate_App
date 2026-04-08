import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../../utils/api';
import {
  createProactiveRequest,
  deleteProactiveRequest,
  getAvailableDonatedFood,
  getMyFoodRequests,
  getMyProactiveRequests,
  requestFoodDonation,
} from '../../features/foodbank/services/foodbankService';

vi.mock('../../utils/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('foodbankService unit tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requestFoodDonation should post request payload to donation endpoint', async () => {
    const foodId = 'food123';
    const payload = {
      restaurant_id: 'res1',
      foodBank_id: 'fb1',
      requestedQuantity: 3,
    };
    const expected = { requestId: 'req1' };
    api.post.mockResolvedValue({ data: expected });

    const result = await requestFoodDonation(foodId, payload);

    expect(api.post).toHaveBeenCalledWith(`/request/${foodId}`, payload);
    expect(result).toEqual(expected);
  });

  it('getMyFoodRequests should return request list from response data', async () => {
    const foodBankId = 'fb1';
    const expectedRequests = [{ id: 'r1' }, { id: 'r2' }];
    api.get.mockResolvedValue({ data: { requests: expectedRequests } });

    const result = await getMyFoodRequests(foodBankId);

    expect(api.get).toHaveBeenCalledWith(`/request/${foodBankId}`);
    expect(result).toEqual(expectedRequests);
  });

  it('getMyFoodRequests should return empty array when requests is missing', async () => {
    api.get.mockResolvedValue({ data: {} });

    const result = await getMyFoodRequests('fb2');

    expect(result).toEqual([]);
  });

  it('createProactiveRequest should post to foodbank-request endpoint', async () => {
    const payload = {
      title: 'Need fresh meals',
      quantity: 20,
      urgency: 'high',
    };
    const expected = { id: 'p1', ...payload };
    api.post.mockResolvedValue({ data: expected });

    const result = await createProactiveRequest(payload);

    expect(api.post).toHaveBeenCalledWith('/foodbank-request', payload);
    expect(result).toEqual(expected);
  });

  it('getMyProactiveRequests should return list or fallback to empty array', async () => {
    const foodbankId = 'fbX';
    const expectedRequests = [{ id: 'p1' }];
    api.get.mockResolvedValueOnce({ data: { requests: expectedRequests } });

    const firstResult = await getMyProactiveRequests(foodbankId);
    expect(api.get).toHaveBeenCalledWith(`/foodbank-request/foodbank/${foodbankId}`);
    expect(firstResult).toEqual(expectedRequests);

    api.get.mockResolvedValueOnce({ data: null });
    const secondResult = await getMyProactiveRequests(foodbankId);
    expect(secondResult).toEqual([]);
  });

  it('getAvailableDonatedFood should fetch donated food list', async () => {
    const expected = [{ id: 'f1' }, { id: 'f2' }];
    api.get.mockResolvedValue({ data: expected });

    const result = await getAvailableDonatedFood();

    expect(api.get).toHaveBeenCalledWith('/foodsdonate');
    expect(result).toEqual(expected);
  });

  it('deleteProactiveRequest should delete by id and return response', async () => {
    const expected = { deleted: true };
    api.delete.mockResolvedValue({ data: expected });

    const result = await deleteProactiveRequest('pro-1');

    expect(api.delete).toHaveBeenCalledWith('/foodbank-request/pro-1');
    expect(result).toEqual(expected);
  });

  it('requestFoodDonation should propagate API errors', async () => {
    const error = new Error('Request failed');
    api.post.mockRejectedValue(error);

    await expect(requestFoodDonation('food-err', { requestedQuantity: 1 })).rejects.toThrow(
      'Request failed',
    );
  });

  it('createProactiveRequest should propagate API errors', async () => {
    const error = new Error('Create proactive request failed');
    api.post.mockRejectedValue(error);

    await expect(createProactiveRequest({ title: 'Need milk' })).rejects.toThrow(
      'Create proactive request failed',
    );
  });

  it('getMyProactiveRequests should call endpoint with the provided foodbank id', async () => {
    api.get.mockResolvedValue({ data: { requests: [] } });

    await getMyProactiveRequests('fb-call-check');

    expect(api.get).toHaveBeenCalledWith('/foodbank-request/foodbank/fb-call-check');
  });
});
