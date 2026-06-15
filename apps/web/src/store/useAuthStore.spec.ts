import { useAuthStore } from './useAuthStore';
import * as authApi from '@/lib/auth-api';
import { ApiError } from '@/lib/api';

// Mock the auth API
jest.mock('@/lib/auth-api', () => ({
  fetchMe: jest.fn(),
  refreshSession: jest.fn(),
  logout: jest.fn(),
}));

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  createdAt: '2023-01-01',
  updatedAt: '2023-01-01',
  profile: {
    nickname: 'testuser',
  },
};

describe('useAuthStore', () => {
  beforeEach(() => {
    // Clear the store before each test
    useAuthStore.getState().clearSession();
    useAuthStore.setState({ isLoading: false });
    jest.clearAllMocks();
  });

  it('initializes with default values', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('sets session correctly', () => {
    useAuthStore.getState().setSession(mockUser, 'access-123', 'refresh-123');
    const state = useAuthStore.getState();
    
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe('access-123');
    expect(state.refreshToken).toBe('refresh-123');
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('clears session correctly', () => {
    useAuthStore.getState().setSession(mockUser, 'access-123', 'refresh-123');
    useAuthStore.getState().clearSession();
    const state = useAuthStore.getState();
    
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  describe('hydrateSession', () => {
    it('sets unauthenticated if no tokens exist', async () => {
      useAuthStore.setState({ isLoading: true });
      await useAuthStore.getState().hydrateSession();
      
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it('fetches user if tokens exist', async () => {
      (authApi.fetchMe as jest.Mock).mockResolvedValue(mockUser);
      useAuthStore.setState({ accessToken: 'valid', refreshToken: 'valid' });
      
      await useAuthStore.getState().hydrateSession();
      
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(authApi.fetchMe).toHaveBeenCalledWith('valid');
    });

    it('refreshes token if fetchMe returns 401', async () => {
      (authApi.fetchMe as jest.Mock).mockRejectedValue(new ApiError('Unauthorized', 401));
      (authApi.refreshSession as jest.Mock).mockResolvedValue({
        user: mockUser,
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      });
      useAuthStore.setState({ accessToken: 'expired', refreshToken: 'valid-refresh' });
      
      await useAuthStore.getState().hydrateSession();
      
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.accessToken).toBe('new-access');
      expect(state.isAuthenticated).toBe(true);
    });

    it('clears session if refresh token fails', async () => {
      (authApi.fetchMe as jest.Mock).mockRejectedValue(new ApiError('Unauthorized', 401));
      (authApi.refreshSession as jest.Mock).mockRejectedValue(new Error('Failed refresh'));
      useAuthStore.setState({ accessToken: 'expired', refreshToken: 'expired-refresh', isAuthenticated: true });
      
      await useAuthStore.getState().hydrateSession();
      
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.accessToken).toBeNull();
    });
  });

  describe('logout', () => {
    it('calls authApi.logout and clears session', async () => {
      useAuthStore.getState().setSession(mockUser, 'access-123', 'refresh-123');
      await useAuthStore.getState().logout();
      
      expect(authApi.logout).toHaveBeenCalledWith('access-123');
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('clears session even if api logout fails', async () => {
      (authApi.logout as jest.Mock).mockRejectedValue(new Error('Network error'));
      useAuthStore.getState().setSession(mockUser, 'access-123', 'refresh-123');
      await useAuthStore.getState().logout();
      
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });
});
