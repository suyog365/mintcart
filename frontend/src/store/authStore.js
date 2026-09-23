import { create } from "zustand";
import { persist } from "zustand/middleware";

const API = "http://localhost:5000";

export const useAuth = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,

      // ---------- GOOGLE ----------
      loginWithGoogle: async (credential) => {
        set({ loading: true });
        try {
          const res = await fetch(`${API}/api/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential }),
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.error || "Login failed");
          set({ user: data.user, token: data.token, loading: false });
          return data.user;
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },

      // ---------- EMAIL / PASSWORD ----------
      signup: async ({ name, email, password }) => {
        set({ loading: true });
        try {
          const res = await fetch(`${API}/api/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.error || "Signup failed");
          set({ user: data.user, token: data.token, loading: false });
          return data.user;
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },

      login: async ({ email, password }) => {
        set({ loading: true });
        try {
          const res = await fetch(`${API}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.error || "Login failed");
          set({ user: data.user, token: data.token, loading: false });
          return data.user;
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },

      // ---------- SESSION ----------
      logout: () => set({ user: null, token: null }),

      isLoggedIn: () => !!get().user,

      setWallet: async (walletAddress) => {
        const token = get().token;
        if (!token) return;
        try {
          const res = await fetch(`${API}/api/auth/wallet`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ walletAddress }),
          });
          const data = await res.json();
          if (data.success) set({ user: data.user });
        } catch (err) {
          console.error("Failed to save wallet:", err);
        }
      },
    }),
    {
      name: "mintcart-auth",
    }
  )
);