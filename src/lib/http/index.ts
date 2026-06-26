import { applyAuthInterceptor } from './interceptors/auth'
import { applyErrorInterceptor } from './interceptors/error'
import { applyLoadingInterceptor } from './interceptors/loading'
import { axiosInstance } from './instance'

applyLoadingInterceptor(axiosInstance)
applyErrorInterceptor(axiosInstance)
applyAuthInterceptor(axiosInstance)

export const http = axiosInstance
