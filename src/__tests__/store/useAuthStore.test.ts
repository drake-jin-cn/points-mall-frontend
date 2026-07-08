import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useAuthStore } from '@/store/useAuthStore';

const mockUser = { id: 1, name: 'Alice', email: 'alice@example.com', roles: ['EMPLOYEE'] };

beforeEach(() => {
  useAuthStore.setState({ user: null });
  sessionStorage.clear();
});

describe('useAuthStore', () => {
  it('starts with null user', () => {
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('setUser stores user info', () => {
    act(() => useAuthStore.getState().setUser(mockUser));
    expect(useAuthStore.getState().user).toEqual(mockUser);
  });

  it('clearUser resets to null', () => {
    act(() => {
      useAuthStore.getState().setUser(mockUser);
      useAuthStore.getState().clearUser();
    });
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('user is persisted to sessionStorage after setUser', () => {
    act(() => useAuthStore.getState().setUser(mockUser));
    const stored = JSON.parse(sessionStorage.getItem('auth-store') ?? '{}');
    expect(stored.state?.user?.email).toBe('alice@example.com');
  });
});
