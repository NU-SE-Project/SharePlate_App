import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../../utils/api';
import {
  forgotPassword,
  getMe,
  login,
  loginWithGoogle,
  logout,
  register,
  resendVerification,
  sendVerification,
  verifyEmail,
  updateMe,
  validateResetToken,
} from '../../features/auth/services/authService';

vi.mock('../../utils/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('authService unit tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('login should post credentials and return response data', async () => {
    const payload = { email: 'user@test.com', password: 'secret123' };
    const expected = { accessToken: 'abc', user: { id: 'u1' } };
    api.post.mockResolvedValue({ data: expected });

    const result = await login(payload);

    expect(api.post).toHaveBeenCalledWith('/auth/login', payload);
    expect(result).toEqual(expected);
  });

  it('loginWithGoogle should post credential wrapped in object', async () => {
    const credential = 'google-jwt';
    const expected = { accessToken: 'token', user: { id: 'u2' } };
    api.post.mockResolvedValue({ data: expected });

    const result = await loginWithGoogle(credential);

    expect(api.post).toHaveBeenCalledWith('/auth/google', { credential });
    expect(result).toEqual(expected);
  });

  it('register should post user data and return response data', async () => {
    const payload = { name: 'User', email: 'new@test.com', password: 'pass1234' };
    const expected = { message: 'registered' };
    api.post.mockResolvedValue({ data: expected });

    const result = await register(payload);

    expect(api.post).toHaveBeenCalledWith('/auth/register', payload);
    expect(result).toEqual(expected);
  });

  it('validateResetToken should call GET with token as query params', async () => {
    const token = 'reset-token';
    const expected = { valid: true };
    api.get.mockResolvedValue({ data: expected });

    const result = await validateResetToken(token);

    expect(api.get).toHaveBeenCalledWith('/auth/validate-reset-token', {
      params: { token },
    });
    expect(result).toEqual(expected);
  });

  it('getMe should fetch current user and return response data', async () => {
    const expected = { user: { id: 'me1', role: 'restaurant' } };
    api.get.mockResolvedValue({ data: expected });

    const result = await getMe();

    expect(api.get).toHaveBeenCalledWith('/user/me');
    expect(result).toEqual(expected);
  });

  it('updateMe should patch current user profile data', async () => {
    const payload = { organizationName: 'Share Plate' };
    const expected = { user: { organizationName: 'Share Plate' } };
    api.patch.mockResolvedValue({ data: expected });

    const result = await updateMe(payload);

    expect(api.patch).toHaveBeenCalledWith('/user/me', payload);
    expect(result).toEqual(expected);
  });

  it('forgotPassword should post email payload and return response data', async () => {
    const email = 'forgot@test.com';
    const expected = { message: 'Reset email sent' };
    api.post.mockResolvedValue({ data: expected });

    const result = await forgotPassword(email);

    expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', { email });
    expect(result).toEqual(expected);
  });

  it('sendVerification should call verification endpoint', async () => {
    const expected = { message: 'Verification sent' };
    api.post.mockResolvedValue({ data: expected });

    const result = await sendVerification();

    expect(api.post).toHaveBeenCalledWith('/auth/send-verification');
    expect(result).toEqual(expected);
  });

  it('resendVerification should post email and return response', async () => {
    const expected = { message: 'Verification resent' };
    api.post.mockResolvedValue({ data: expected });

    const result = await resendVerification('verify@test.com');

    expect(api.post).toHaveBeenCalledWith('/auth/resend-verification', {
      email: 'verify@test.com',
    });
    expect(result).toEqual(expected);
  });

  it('verifyEmail should call GET with token query param', async () => {
    const expected = { verified: true };
    api.get.mockResolvedValue({ data: expected });

    const result = await verifyEmail('verify-token');

    expect(api.get).toHaveBeenCalledWith('/auth/verify-email', {
      params: { token: 'verify-token' },
    });
    expect(result).toEqual(expected);
  });

  it('logout should post to logout endpoint and return data', async () => {
    const expected = { message: 'Logged out' };
    api.post.mockResolvedValue({ data: expected });

    const result = await logout();

    expect(api.post).toHaveBeenCalledWith('/auth/logout');
    expect(result).toEqual(expected);
  });
});
