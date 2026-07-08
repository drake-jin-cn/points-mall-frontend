import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { redirect } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

type QueueItem = {
  resolve: () => void;
  reject: (err: unknown) => void;
};

export function applyAuthInterceptor(instance: AxiosInstance): void {
  // Closure-scoped state — each instance has its own refresh lock and queue
  let isRefreshing = false;
  const queue: QueueItem[] = [];

  function flushQueue(err?: unknown): void {
    for (const item of queue.splice(0)) {
      if (err) item.reject(err);
      else item.resolve();
    }
  }

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const config = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      if (error.response?.status !== 401) {
        return Promise.reject(error);
      }

      // Prevent infinite loop on /auth/refresh 401
      if (config.url === '/auth/refresh') {
        useAuthStore.getState().clearUser();
        redirect('/login');
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          queue.push({
            resolve: () => resolve(instance(config)),
            reject,
          });
        });
      }

      isRefreshing = true;
      config._retry = true;

      try {
        await instance.post('/auth/refresh', null, { silent: true } as object);
        flushQueue();
        return instance(config);
      } catch (refreshError) {
        flushQueue(refreshError);
        useAuthStore.getState().clearUser();
        redirect('/login');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    },
  );
}
