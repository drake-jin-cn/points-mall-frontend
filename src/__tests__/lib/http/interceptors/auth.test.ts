import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { useAuthStore } from '@/store/useAuthStore'
import { applyAuthInterceptor } from '@/lib/http/interceptors/auth'

const mockRedirect = vi.fn()
vi.mock('next/navigation', () => ({
  redirect: (path: string) => mockRedirect(path),
}))

const mockUser = { id: 1, name: 'Alice', email: 'alice@example.com', roles: ['employee'] }

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.setState({ user: mockUser })
})

describe('applyAuthInterceptor', () => {
  it('retries original request after successful refresh', async () => {
    const instance = axios.create()
    const mock = new MockAdapter(instance)
    applyAuthInterceptor(instance)

    mock.onGet('/protected').replyOnce(401).onGet('/protected').reply(200, { ok: true })
    mock.onPost('/auth/refresh').reply(200, { code: 'OK', data: null })

    const result = await instance.get('/protected')
    expect(result.data).toEqual({ ok: true })
  })

  it('only calls /auth/refresh once for concurrent 401s', async () => {
    const instance = axios.create()
    const mock = new MockAdapter(instance, { delayResponse: 10 })
    applyAuthInterceptor(instance)

    mock.onGet('/a').replyOnce(401).onGet('/a').reply(200, { data: 'a' })
    mock.onGet('/b').replyOnce(401).onGet('/b').reply(200, { data: 'b' })
    mock.onPost('/auth/refresh').replyOnce(200, { code: 'OK', data: null })

    await Promise.all([instance.get('/a'), instance.get('/b')])

    const refreshCalls = mock.history.post.filter((r) => r.url === '/auth/refresh')
    expect(refreshCalls).toHaveLength(1)
  })

  it('clears user and redirects to /login when refresh fails', async () => {
    const instance = axios.create()
    const mock = new MockAdapter(instance)
    applyAuthInterceptor(instance)

    mock.onGet('/protected').reply(401)
    mock.onPost('/auth/refresh').reply(401)

    await expect(instance.get('/protected')).rejects.toBeDefined()
    expect(useAuthStore.getState().user).toBeNull()
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })

  it('does not loop when /auth/refresh itself returns 401', async () => {
    const instance = axios.create()
    const mock = new MockAdapter(instance)
    applyAuthInterceptor(instance)

    mock.onPost('/auth/refresh').reply(401)

    await expect(instance.post('/auth/refresh')).rejects.toBeDefined()
    const refreshCalls = mock.history.post.filter((r) => r.url === '/auth/refresh')
    expect(refreshCalls).toHaveLength(1)
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })
})
