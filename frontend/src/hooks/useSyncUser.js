import { useEffect } from "react";
import { useAuth } from "../store/authStore";
import { useWallet } from "../store/walletStore";

/**
 * Keeps walletStore.address in sync with the logged-in user's saved wallet.
 */
export function useSyncUser() {
  const user = useAuth((s) => s.user);
  const setAddress = useWallet((s) => s.setAddress);
  const current = useWallet((s) => s.address);

  useEffect(() => {
    if (user?.walletAddress && user.walletAddress !== current) {
      setAddress(user.walletAddress);
    }
  }, [user, setAddress, current]);
}