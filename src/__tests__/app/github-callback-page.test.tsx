import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  searchParams: new URLSearchParams(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mocks.replace,
  }),
  useSearchParams: () => mocks.searchParams,
}));

import GitHubCallbackPage from '@/app/(auth)/auth/github/callback/page';

describe('GitHubCallbackPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.searchParams = new URLSearchParams();
  });

  it('redirects to the login page with the same error code when OAuth returns an error', async () => {
    mocks.searchParams = new URLSearchParams('error=oauth_failed');

    render(<GitHubCallbackPage />);

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith('/login?error=oauth_failed');
    });
  });

  it('redirects to the dashboard when OAuth succeeds without an error code', async () => {
    render(<GitHubCallbackPage />);

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith('/dashboard');
    });
  });
});
