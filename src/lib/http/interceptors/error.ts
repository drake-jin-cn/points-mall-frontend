import type { AxiosInstance } from 'axios'
import { toast } from 'sonner'
import type { ApiResponse } from '@/lib/http/types'

export function applyErrorInterceptor(instance: AxiosInstance): void {
  instance.interceptors.response.use(
    (response) => {
      const body = response.data as ApiResponse
      if (body.code !== 'OK') {
        toast.error(body.message)
        if (body.traceId) {
          console.error('[traceId]', body.traceId)
        }
        return Promise.reject(body)
      }
      // Unwrap envelope — callers receive data.data directly
      return body.data
    },
    (error) => {
      // 401 is handled by auth interceptor — skip generic toast
      if (error.response?.status === 401) {
        return Promise.reject(error)
      }
      toast.error('网络异常，请稍后重试')
      return Promise.reject(error)
    },
  )
}
