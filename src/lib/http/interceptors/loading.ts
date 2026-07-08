import type { AxiosInstance } from 'axios';
import { useLoadingStore } from '@/store/useLoadingStore';

export function applyLoadingInterceptor(instance: AxiosInstance): void {
  instance.interceptors.request.use((config) => {
    if (!config.silent) {
      useLoadingStore.getState().increment();
    }
    return config;
  });

  const decrement = (config?: { silent?: boolean }) => {
    if (!config?.silent) {
      useLoadingStore.getState().decrement();
    }
  };

  instance.interceptors.response.use(
    (response) => {
      decrement(response.config);
      return response;
    },
    (error) => {
      decrement(error?.config);
      return Promise.reject(error);
    },
  );
}
