import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import AxiosMockAdapter from 'axios-mock-adapter';
import api from '../../utils/api';
import {
  forgotPassword,
  login,
  logout,
  register,
  validateResetToken,
} from '../../features/auth/services/authService';

describe('auth service integration tests', () => {
  let mock;

  beforeEach(() => {
    mock = new AxiosMockAdapter(api);
  });

  afterEach(() => {
    mock.restore();
  });

  it('login should integrate with api instance and return server payload', async () => {
    const payload = { email: 'login@test.com', password: 'secret123' };
    const expected = { accessToken: 'token-1', user: { id: 'u1' } };

    mock.onPost('/auth/login', payload).reply(200, expected);

    const result = await login(payload);

    expect(result).toEqual(expected);
    expect(mock.history.post[0].url).toBe('/auth/login');
  });

  it('register should send payload to register endpoint', async () => {
    const payload = { name: 'New User', email: 'new@test.com', password: 'pass1234' };
    mock.onPost('/auth/register', payload).reply(201, { message: 'registered' });

    const result = await register(payload);

    expect(result).toEqual({ message: 'registered' });
    expect(mock.history.post).toHaveLength(1);
    expect(mock.history.post[0].url).toBe('/auth/register');
  });

  it('validateResetToken should include token in query params', async () => {
    mock.onGet('/auth/validate-reset-token').reply((config) => {
      if (config.params?.token === 'reset-abc') {
        return [200, { valid: true }];
      }
      return [400, { valid: false }];
    });

    const result = await validateResetToken('reset-abc');

    expect(result).toEqual({ valid: true });
  });

  it('forgotPassword should post email body and return payload', async () => {
    const expected = { message: 'Reset email sent' };
    mock.onPost('/auth/forgot-password', { email: 'forgot@test.com' }).reply(200, expected);

    const result = await forgotPassword('forgot@test.com');

    expect(result).toEqual(expected);
    expect(mock.history.post[0].data).toContain('forgot@test.com');
  });

  it('logout should call logout endpoint and propagate errors', async () => {
    mock.onPost('/auth/logout').reply(500, { message: 'logout failed' });

    await expect(logout()).rejects.toBeTruthy();
    expect(mock.history.post[0].url).toBe('/auth/logout');
  });
});
