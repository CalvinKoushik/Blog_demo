import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/types/auth";
import * as authApi from "@/lib/auth-api";
import { ApiError } from "@/lib/api";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  clearSession: () => void;
  setLoading: (loading: boolean) => void;
  hydrateSession: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      setSession: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        }),

      clearSession: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      hydrateSession: async () => {
        const { accessToken, refreshToken } = get();
        if (!accessToken || !refreshToken) {
          set({ isLoading: false, isAuthenticated: false });
          return;
        }

        try {
          const user = await authApi.fetchMe(accessToken);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (err) {
          if (err instanceof ApiError && err.status === 401 && refreshToken) {
            try {
              const session = await authApi.refreshSession(refreshToken);
              set({
                user: session.user,
                accessToken: session.accessToken,
                refreshToken: session.refreshToken,
                isAuthenticated: true,
                isLoading: false,
              });
              return;
            } catch {
              get().clearSession();
              return;
            }
          }
          get().clearSession();
        }
      },

      logout: async () => {
        const { accessToken } = get();
        if (accessToken) {
          try {
            await authApi.logout(accessToken);
          } catch {
            /* clear local session even if API fails */
          }
        }
        get().clearSession();
      },
    }),
    {
      name: "student-hub-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
