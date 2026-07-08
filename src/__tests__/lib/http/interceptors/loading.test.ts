import { describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { useLoadingStore } from '@/store/useLoadingStore';
import { applyLoadingInterceptor } from '@/lib/http/interceptors/loading';

beforeEach(() => {
  useLoadingStore.setState({ count: 0, isLoading: false });
});

describe('applyLoadingInterceptor', () => {
  it('increments count on request and decrements on response', async () => {
    const instance = axios.create();
    const mock = new MockAdapter(instance, { delayResponse: 20 });
    applyLoadingInterceptor(instance);
    mock.onGet('/test').reply(200, { code: 'OK', message: 'ok', data: null });

    const req = instance.get('/test');
    // Yield to microtask queue so request interceptor runs, but response is still delayed
    await Promise.resolve();
    expect(useLoadingStore.getState().count).toBe(1);
    await req;
    expect(useLoadingStore.getState().count).toBe(0);
  });

  it('does not increment count when silent: true', async () => {
    const instance = axios.create();
    const mock = new MockAdapter(instance);
    applyLoadingInterceptor(instance);
    mock.onGet('/silent').reply(200, { code: 'OK', message: 'ok', data: null });

    await instance.get('/silent', { silent: true });
    expect(useLoadingStore.getState().count).toBe(0);
  });

  it('decrements count on request error', async () => {
    const instance = axios.create();
    const mock = new MockAdapter(instance);
    applyLoadingInterceptor(instance);
    mock.onGet('/fail').reply(500);

    try {
      await instance.get('/fail');
    } catch {}
    expect(useLoadingStore.getState().count).toBe(0);
  });

  it('never lets count go below 0', async () => {
    const instance = axios.create();
    const mock = new MockAdapter(instance);
    applyLoadingInterceptor(instance);
    mock.onGet('/test').reply(200, { code: 'OK', message: 'ok', data: null });

    // Force extra decrement before request
    useLoadingStore.getState().decrement();
    await instance.get('/test');
    expect(useLoadingStore.getState().count).toBe(0);
  });
});
