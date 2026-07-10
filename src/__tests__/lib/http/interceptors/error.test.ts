import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { applyErrorInterceptor } from '@/lib/http/interceptors/error';

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}));

import { toast } from 'sonner';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('applyErrorInterceptor', () => {
  it('returns data.data when code is OK', async () => {
    const instance = axios.create();
    const mock = new MockAdapter(instance);
    applyErrorInterceptor(instance);
    mock.onGet('/ok').reply(200, { code: 'OK', message: 'success', data: { id: 1 } });

    const result = await instance.get('/ok');
    expect(result).toEqual({ id: 1 });
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('shows toast and rejects when code is not OK', async () => {
    const instance = axios.create();
    const mock = new MockAdapter(instance);
    applyErrorInterceptor(instance);
    mock.onGet('/err').reply(200, {
      code: 'bff-2001',
      message: 'User not found',
      data: null,
      traceId: 'abc-123',
    });

    await expect(instance.get('/err')).rejects.toMatchObject({ code: 'bff-2001' });
    expect(toast.error).toHaveBeenCalledWith('User not found');
  });

  it('logs traceId to console on business error', async () => {
    const instance = axios.create();
    const mock = new MockAdapter(instance);
    applyErrorInterceptor(instance);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mock.onGet('/trace').reply(200, {
      code: 'bff-2001',
      message: 'error',
      data: null,
      traceId: 'trace-xyz',
    });

    await expect(instance.get('/trace')).rejects.toBeDefined();
    expect(consoleSpy).toHaveBeenCalledWith('[traceId]', 'trace-xyz');
    consoleSpy.mockRestore();
  });

  it('shows generic toast on HTTP network error (non-401)', async () => {
    const instance = axios.create();
    const mock = new MockAdapter(instance);
    applyErrorInterceptor(instance);
    mock.onGet('/network').reply(500);

    await expect(instance.get('/network')).rejects.toBeDefined();
    expect(toast.error).toHaveBeenCalledWith('Network error, please try again');
  });

  it('does NOT show toast on 401 (handled by auth interceptor)', async () => {
    const instance = axios.create();
    const mock = new MockAdapter(instance);
    applyErrorInterceptor(instance);
    mock.onGet('/auth').reply(401);

    await expect(instance.get('/auth')).rejects.toBeDefined();
    expect(toast.error).not.toHaveBeenCalled();
  });
});
