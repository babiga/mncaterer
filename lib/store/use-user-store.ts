import { create } from "zustand";

export type NavbarUser = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  userType: "dashboard" | "customer";
};

interface UserState {
  user: NavbarUser | null;
  isLoading: boolean;
  setUser: (user: NavbarUser | null) => void;
  fetchUser: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  fetchUser: async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (!response.ok) {
        set({ user: null, isLoading: false });
        return;
      }

      const result = await response.json();
      set({ user: result?.data ?? null, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },
}));
