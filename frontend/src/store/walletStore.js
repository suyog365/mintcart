import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useWallet = create(
  persist(
    (set, get) => ({
      address: "",
      points: 0,
      chainId: null,
      connecting: false,

      setAddress: (address) => set({ address: address.trim().toLowerCase() }),
      setPoints: (points) => set({ points: Number(points) }),
      setChainId: (chainId) => set({ chainId }),

      hasMetaMask: () =>
        typeof window !== "undefined" && !!window.ethereum,

      connect: async () => {
        if (!window.ethereum) {
          throw new Error("MetaMask is not installed");
        }

        set({ connecting: true });
        try {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });

          const chainId = await window.ethereum.request({
            method: "eth_chainId",
          });

          set({
            address: accounts[0].toLowerCase(),
            chainId: parseInt(chainId, 16),
            connecting: false,
          });

          return accounts[0];
        } catch (err) {
          set({ connecting: false });
          throw err;
        }
      },

      disconnect: () => {
        set({ address: "", points: 0, chainId: null });
      },

      refresh: async () => {
        if (!window.ethereum) return;
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            set({ address: accounts[0].toLowerCase() });
          } else {
            set({ address: "" });
          }
        } catch (err) {
          console.error("Refresh failed:", err);
        }
      },
    }),
    {
      name: "mintcart-wallet",
      partialize: (state) => ({
        address: state.address,
        points: state.points,
      }),
    }
  )
);