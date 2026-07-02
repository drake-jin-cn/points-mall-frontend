import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  searchParams: new URLSearchParams(),
  toastError: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mocks.push,
    replace: mocks.replace,
  }),
  useSearchParams: () => mocks.searchParams,
}))

vi.mock('@/lib/http', () => ({
  http: {
    post: vi.fn(),
  },
}))

vi.mock('sonner', () => ({
  toast: {
    error: mocks.toastError,
  },
}))

import LoginPage from '@/app/(auth)/login/page'

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.searchParams = new URLSearchParams()
    process.env.NEXT_PUBLIC_BFF_URL = 'http://bff.example.com'
    window.history.replaceState({}, '', '/login')
  })

  it('navigates to the GitHub OAuth endpoint when the GitHub login button is clicked', async () => {
    const user = userEvent.setup()

    render(<LoginPage />)

    await user.click(screen.getByRole('button', { name: '使用 GitHub 登录' }))

    expect(window.location.href).toBe('http://bff.example.com/auth/github')
  })

  it('shows an OAuth error toast when the login page receives an OAuth error code', async () => {
    mocks.searchParams = new URLSearchParams('error=oauth_cancelled')

    render(<LoginPage />)

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith('GitHub 登录已取消')
    })
  })
})
