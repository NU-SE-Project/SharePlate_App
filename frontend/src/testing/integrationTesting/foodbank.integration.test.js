import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import AxiosMockAdapter from 'axios-mock-adapter';
import api from '../../utils/api';
import {
  createProactiveRequest,
  deleteProactiveRequest,
  getAvailableDonatedFood,
  getMyFoodRequests,
  getMyProactiveRequests,
  requestFoodDonation,
} from '../../features/foodbank/services/foodbankService';

describe('foodbank service integration tests', () => {
  let mock;

  beforeEach(() => {
    mock = new AxiosMockAdapter(api);
  });

  afterEach(() => {
    mock.restore();
  });

  it('getAvailableDonatedFood should fetch data via api instance', async () => {
    mock.onGet('/foodsdonate').reply(200, [{ id: 'food-1' }]);

    const result = await getAvailableDonatedFood();

    expect(result).toEqual([{ id: 'food-1' }]);
  });

  it('requestFoodDonation should post food request payload', async () => {
    const payload = { restaurant_id: 'r1', foodBank_id: 'fb1', requestedQuantity: 2 };
    mock.onPost('/request/food-10', payload).reply(201, { requestId: 'rq1' });

    const result = await requestFoodDonation('food-10', payload);

    expect(result).toEqual({ requestId: 'rq1' });
    expect(mock.history.post[0].url).toBe('/request/food-10');
  });

  it('getMyFoodRequests should return request array from response', async () => {
    mock.onGet('/request/fb-5').reply(200, { requests: [{ id: 'x1' }] });

    const result = await getMyFoodRequests('fb-5');

    expect(result).toEqual([{ id: 'x1' }]);
  });

  it('createProactiveRequest and deleteProactiveRequest should integrate with endpoints', async () => {
    const payload = { title: 'Need meals', quantity: 10, urgency: 'high' };
    mock.onPost('/foodbank-request', payload).reply(201, { id: 'p1' });
    mock.onDelete('/foodbank-request/p1').reply(200, { deleted: true });

    const created = await createProactiveRequest(payload);
    const deleted = await deleteProactiveRequest(created.id);

    expect(created.id).toBe('p1');
    expect(deleted.deleted).toBe(true);
  });

  it('getMyProactiveRequests should fallback to empty list when requests is missing', async () => {
    mock.onGet('/foodbank-request/foodbank/fb-6').reply(200, {});

    const result = await getMyProactiveRequests('fb-6');

    expect(result).toEqual([]);
  });
});
