import axios from 'axios';

if (!process.env.NEXT_PUBLIC_BFF_URL) {
  console.warn('[http] NEXT_PUBLIC_BFF_URL is not set — all API calls will fail');
}

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BFF_URL,
  timeout: 10_000,
  withCredentials: true,
});
