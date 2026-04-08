import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../../utils/api';
import {
  acceptFoodRequest,
  approveDonationRequest,
  createDonation,
  deleteDonation,
  getAllOpenRequests,
  getDonationRequests,
  getMyDonations,
  rejectDonationRequest,
  updateDonation,
} from '../../features/restaurants/donateFood/services/restaurantService';

vi.mock('../../utils/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('restaurantService unit tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createDonation should post normal payload without custom config', async () => {
    const donationData = { foodType: 'Rice', quantity: 10 };
    const expected = { id: 'd1', ...donationData };
    api.post.mockResolvedValue({ data: expected });

    const result = await createDonation(donationData);

    expect(api.post).toHaveBeenCalledWith('/foodsdonate', donationData, undefined);
    expect(result).toEqual(expected);
  });

  it('createDonation should post FormData with multipart config', async () => {
    const formData = new FormData();
    formData.append('foodType', 'Bread');
    formData.append('quantity', '5');
    api.post.mockResolvedValue({ data: { id: 'd2' } });

    await createDonation(formData);

    expect(api.post).toHaveBeenCalledWith(
      '/foodsdonate',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  });

  it('getDonationRequests should fetch requests for a specific restaurant', async () => {
    const restaurantId = 'r1';
    const expected = [{ id: 'req1' }];
    api.get.mockResolvedValue({ data: expected });

    const result = await getDonationRequests(restaurantId);

    expect(api.get).toHaveBeenCalledWith(`/request/restaurant/${restaurantId}`);
    expect(result).toEqual(expected);
  });

  it('acceptFoodRequest should post request acceptance with quantity', async () => {
    const requestId = 'fbReq1';
    const quantity = 6;
    const expected = { accepted: true };
    api.post.mockResolvedValue({ data: expected });

    const result = await acceptFoodRequest(requestId, quantity);

    expect(api.post).toHaveBeenCalledWith(`/accepts/foodbank-request/${requestId}`, { quantity });
    expect(result).toEqual(expected);
  });

  it('approveDonationRequest should call approve endpoint with quantity payload', async () => {
    const requestId = 'dr1';
    const quantity = 4;
    const expected = { approved: true };
    api.put.mockResolvedValue({ data: expected });

    const result = await approveDonationRequest(requestId, quantity);

    expect(api.put).toHaveBeenCalledWith(`/request/approve/${requestId}`, { quantity });
    expect(result).toEqual(expected);
  });

  it('rejectDonationRequest should call reject endpoint and return response', async () => {
    const requestId = 'dr2';
    const expected = { rejected: true };
    api.put.mockResolvedValue({ data: expected });

    const result = await rejectDonationRequest(requestId);

    expect(api.put).toHaveBeenCalledWith(`/request/reject/${requestId}`);
    expect(result).toEqual(expected);
  });

  it('getAllOpenRequests should fetch foodbank-request list', async () => {
    const expected = [{ id: 'fbr1' }, { id: 'fbr2' }];
    api.get.mockResolvedValue({ data: expected });

    const result = await getAllOpenRequests();

    expect(api.get).toHaveBeenCalledWith('/foodbank-request');
    expect(result).toEqual(expected);
  });

  it('getMyDonations should fetch donations for restaurant id', async () => {
    const expected = [{ id: 'd1' }];
    api.get.mockResolvedValue({ data: expected });

    const result = await getMyDonations('rest-1');

    expect(api.get).toHaveBeenCalledWith('/foodsdonate/restaurant/rest-1');
    expect(result).toEqual(expected);
  });

  it('updateDonation should put updated payload without config for plain object', async () => {
    const expected = { id: 'd2', quantity: 12 };
    const payload = { quantity: 12 };
    api.put.mockResolvedValue({ data: expected });

    const result = await updateDonation('d2', payload);

    expect(api.put).toHaveBeenCalledWith('/foodsdonate/d2', payload, undefined);
    expect(result).toEqual(expected);
  });

  it('updateDonation should use multipart config for FormData payload', async () => {
    const payload = new FormData();
    payload.append('quantity', '20');
    api.put.mockResolvedValue({ data: { id: 'd3' } });

    await updateDonation('d3', payload);

    expect(api.put).toHaveBeenCalledWith('/foodsdonate/d3', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  });

  it('deleteDonation should call delete endpoint and return response data', async () => {
    const expected = { deleted: true };
    api.delete.mockResolvedValue({ data: expected });

    const result = await deleteDonation('d4');

    expect(api.delete).toHaveBeenCalledWith('/foodsdonate/d4');
    expect(result).toEqual(expected);
  });
});
