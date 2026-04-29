import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthProvider, useAuth } from '../../hooks/useAuth';
import * as api from '../../lib/api';

vi.mock('../../lib/api');

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with null user and token', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should load user and token from localStorage', async () => {
    const mockUser = { id: 1, email: 'test@example.com', fullName: 'Test User' };
    const mockToken = 'token123';

    localStorage.getItem = vi.fn((key) => {
      if (key === 'token') return mockToken;
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe(mockToken);
    });
  });

  it('should login successfully', async () => {
    const mockResponse = {
      data: {
        token: 'newtoken123',
        user: { id: 1, email: 'test@example.com', fullName: 'Test User' },
      },
    };

    vi.spyOn(api.authApi, 'login').mockResolvedValue(mockResponse as any);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(result.current.user).toEqual(mockResponse.data.user);
    expect(result.current.token).toBe('newtoken123');
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'newtoken123');
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'user',
      JSON.stringify(mockResponse.data.user)
    );
  });

  it('should register successfully', async () => {
    const mockResponse = {
      data: {
        token: 'newtoken123',
        user: { id: 1, email: 'test@example.com', fullName: 'Test User' },
      },
    };

    vi.spyOn(api.authApi, 'register').mockResolvedValue(mockResponse as any);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register('test@example.com', 'password123', 'Test User');
    });

    expect(result.current.user).toEqual(mockResponse.data.user);
    expect(result.current.token).toBe('newtoken123');
  });

  it('should logout successfully', async () => {
    const mockUser = { id: 1, email: 'test@example.com', fullName: 'Test User' };
    localStorage.getItem = vi.fn((key) => {
      if (key === 'token') return 'token123';
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
  });

  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });
});
