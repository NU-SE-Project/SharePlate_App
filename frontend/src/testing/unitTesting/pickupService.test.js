import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../../utils/api';
import {
  resendPickupOTP,
  verifyPickupOTP,
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

describe('pickup OTP service unit tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('verifyPickupOTP should call /pickup/verify with pickupId and otp', async () => {
    const expected = { success: true, message: 'OTP verified' };
    api.post.mockResolvedValue({ data: expected });

    const result = await verifyPickupOTP('pickup-1', '123456');

    expect(api.post).toHaveBeenCalledWith('/pickup/verify', {
      pickupId: 'pickup-1',
      otp: '123456',
    });
    expect(result).toEqual(expected);
  });

  it('verifyPickupOTP should preserve leading zeros in OTP', async () => {
    api.post.mockResolvedValue({ data: { success: true } });

    await verifyPickupOTP('pickup-2', '001234');

    expect(api.post).toHaveBeenCalledWith('/pickup/verify', {
      pickupId: 'pickup-2',
      otp: '001234',
    });
  });

  it('verifyPickupOTP should pass otp exactly as provided', async () => {
    api.post.mockResolvedValue({ data: { success: false } });

    await verifyPickupOTP('pickup-3', '12A456');

    expect(api.post).toHaveBeenCalledWith('/pickup/verify', {
      pickupId: 'pickup-3',
      otp: '12A456',
    });
  });

  it('verifyPickupOTP should return backend payload as-is', async () => {
    const payload = { delivered: true, pickup: { id: 'p7' } };
    api.post.mockResolvedValue({ data: payload });

    const result = await verifyPickupOTP('p7', '999999');

    expect(result).toEqual(payload);
  });

  it('verifyPickupOTP should propagate api errors', async () => {
    const error = new Error('Invalid OTP');
    api.post.mockRejectedValue(error);

    await expect(verifyPickupOTP('pickup-4', '000000')).rejects.toThrow('Invalid OTP');
  });

  it('resendPickupOTP should call /pickup/resend with pickupId', async () => {
    const expected = { success: true, message: 'OTP resent' };
    api.post.mockResolvedValue({ data: expected });

    const result = await resendPickupOTP('pickup-5');

    expect(api.post).toHaveBeenCalledWith('/pickup/resend', {
      pickupId: 'pickup-5',
    });
    expect(result).toEqual(expected);
  });

  it('resendPickupOTP should return backend payload as-is', async () => {
    const payload = { otpGeneratedAt: '2026-04-08T00:00:00.000Z', success: true };
    api.post.mockResolvedValue({ data: payload });

    const result = await resendPickupOTP('pickup-6');

    expect(result).toEqual(payload);
  });

  it('resendPickupOTP should propagate api errors', async () => {
    const error = new Error('Resend limit reached');
    api.post.mockRejectedValue(error);

    await expect(resendPickupOTP('pickup-7')).rejects.toThrow('Resend limit reached');
  });

  it('verifyPickupOTP should support numeric pickupId values', async () => {
    api.post.mockResolvedValue({ data: { success: true } });

    await verifyPickupOTP(12345, '654321');

    expect(api.post).toHaveBeenCalledWith('/pickup/verify', {
      pickupId: 12345,
      otp: '654321',
    });
  });

  it('service calls should keep payloads isolated across multiple invocations', async () => {
    api.post.mockResolvedValue({ data: { success: true } });

    await verifyPickupOTP('pickup-A', '111111');
    await resendPickupOTP('pickup-B');

    expect(api.post).toHaveBeenNthCalledWith(1, '/pickup/verify', {
      pickupId: 'pickup-A',
      otp: '111111',
    });
    expect(api.post).toHaveBeenNthCalledWith(2, '/pickup/resend', {
      pickupId: 'pickup-B',
    });
    expect(api.post).toHaveBeenCalledTimes(2);
  });
});
