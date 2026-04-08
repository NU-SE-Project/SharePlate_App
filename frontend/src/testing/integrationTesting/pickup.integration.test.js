import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import AxiosMockAdapter from 'axios-mock-adapter';
import api from '../../utils/api';
import {
  resendPickupOTP,
  verifyPickupOTP,
} from '../../features/restaurants/donateFood/services/restaurantService';

describe('pickup otp integration tests', () => {
  let mock;

  beforeEach(() => {
    mock = new AxiosMockAdapter(api);
  });

  afterEach(() => {
    mock.restore();
  });

  it('verifyPickupOTP should post pickupId and otp through api', async () => {
    mock.onPost('/pickup/verify', { pickupId: 'p1', otp: '123456' }).reply(200, { verified: true });

    const result = await verifyPickupOTP('p1', '123456');

    expect(result).toEqual({ verified: true });
    expect(mock.history.post[0].url).toBe('/pickup/verify');
  });

  it('resendPickupOTP should post pickupId and return response', async () => {
    mock.onPost('/pickup/resend', { pickupId: 'p2' }).reply(200, { sent: true });

    const result = await resendPickupOTP('p2');

    expect(result).toEqual({ sent: true });
    expect(mock.history.post[0].url).toBe('/pickup/resend');
  });

  it('verifyPickupOTP should propagate endpoint errors', async () => {
    mock.onPost('/pickup/verify').reply(400, { message: 'Invalid OTP' });

    await expect(verifyPickupOTP('p3', '000000')).rejects.toBeTruthy();
  });
});
