import type { AxiosRequestConfig } from 'axios';

export interface ApiResponse<T = unknown> {
  code: string;
  message: string;
  data: T;
  traceId?: string;
}

// Extend AxiosRequestConfig to support per-request silent flag
declare module 'axios' {
  interface AxiosRequestConfig {
    silent?: boolean;
  }
}

export type { AxiosRequestConfig };
