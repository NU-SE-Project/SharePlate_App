import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import AxiosMockAdapter from 'axios-mock-adapter';
import api from '../../utils/api';
import {
  acceptFoodRequest,
  createDonation,
  deleteDonation,
  getDonationRequests,
  getMyDonations,
  updateDonation,
} from '../../features/restaurants/donateFood/services/restaurantService';

describe('restaurant service integration tests', () => {
  let mock;

  beforeEach(() => {
    mock = new AxiosMockAdapter(api);
  });

  afterEach(() => {
    mock.restore();
  });

  it('createDonation should send JSON body through api instance', async () => {
    const payload = { foodType: 'Rice', quantity: 12 };
    mock.onPost('/foodsdonate', payload).reply(201, { id: 'd1', ...payload });

    const result = await createDonation(payload);

    expect(result.id).toBe('d1');
    expect(mock.history.post[0].url).toBe('/foodsdonate');
  });

  it('getMyDonations should request donation list for restaurant', async () => {
    mock.onGet('/foodsdonate/restaurant/rest-1').reply(200, [{ id: 'd1' }]);

    const result = await getMyDonations('rest-1');

    expect(result).toEqual([{ id: 'd1' }]);
  });

  it('updateDonation should put updated payload', async () => {
    const payload = { quantity: 20 };
    mock.onPut('/foodsdonate/d-2', payload).reply(200, { id: 'd-2', quantity: 20 });

    const result = await updateDonation('d-2', payload);

    expect(result.quantity).toBe(20);
    expect(mock.history.put[0].url).toBe('/foodsdonate/d-2');
  });

  it('getDonationRequests should call donation requests endpoint', async () => {
    mock.onGet('/request/restaurant/rest-9').reply(200, [{ id: 'r1' }, { id: 'r2' }]);

    const result = await getDonationRequests('rest-9');

    expect(result).toHaveLength(2);
  });

  it('acceptFoodRequest should post acceptance payload and return data', async () => {
    mock.onPost('/accepts/foodbank-request/req-1', { quantity: 5 }).reply(200, { accepted: true });

    const result = await acceptFoodRequest('req-1', 5);

    expect(result).toEqual({ accepted: true });
    expect(mock.history.post[0].url).toBe('/accepts/foodbank-request/req-1');
  });

  it('deleteDonation should call delete endpoint', async () => {
    mock.onDelete('/foodsdonate/d-3').reply(200, { deleted: true });

    const result = await deleteDonation('d-3');

    expect(result).toEqual({ deleted: true });
    expect(mock.history.delete[0].url).toBe('/foodsdonate/d-3');
  });
});
